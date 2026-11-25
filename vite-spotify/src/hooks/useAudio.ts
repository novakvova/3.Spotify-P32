import { useEffect, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
    setProgress,
    setDuration,
    setPlaying,
    setShowAuthModal,
    nextSong,
    selectCurrentSong,
    selectIsPlaying,
    selectPlayerState,
} from '../store/slices/playerSlice'
import { logout, isJwtTokenValid } from '../store/slices/authSlice'
import { useIncrementPlayMutation } from '../services/songs/songsApi'
import { analyticsApi } from '../services/analytics/analyticsApi'
import { getSongUrl } from '../utils/format'

export function useAudio() {
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const isPlayingRef = useRef<boolean>(false)
    const loadedSongIdRef = useRef<number | null>(null)
    const listenedSecondsRef = useRef<number>(0)
    const lastTimeRef = useRef<number>(0)
    const playReportedRef = useRef<boolean>(false)

    const dispatch = useAppDispatch()
    const currentSong = useAppSelector(selectCurrentSong)
    const isPlaying = useAppSelector(selectIsPlaying)
    const { volume, repeat } = useAppSelector(selectPlayerState)
    const [incrementPlay] = useIncrementPlayMutation()

    useEffect(() => {
        isPlayingRef.current = isPlaying
    }, [isPlaying])

    useEffect(() => {
        if (!audioRef.current) audioRef.current = new Audio()
        const audio = audioRef.current

        const onTimeUpdate = () => {
            const current = audio.currentTime
            const delta = current - lastTimeRef.current
            lastTimeRef.current = current
            dispatch(setProgress(current))

            if (delta > 0 && delta < 2) {
                listenedSecondsRef.current += delta
            }

            const songId = loadedSongIdRef.current
            if (songId !== null && !playReportedRef.current) {
                const dur =
                    Number.isFinite(audio.duration) && audio.duration > 0
                        ? audio.duration
                        : 0
                const threshold =
                    dur > 0 ? Math.min(15, Math.ceil(dur * 0.3)) : 15

                if (listenedSecondsRef.current >= threshold) {
                    playReportedRef.current = true
                    void incrementPlay({
                        id: songId,
                        listenedSeconds: Math.max(
                            threshold,
                            Math.floor(listenedSecondsRef.current)
                        ),
                        durationSeconds: dur > 0 ? Math.round(dur) : undefined,
                    })
                        .unwrap()
                        .then((res) => {
                            if (res.counted) {
                                dispatch(
                                    analyticsApi.util.invalidateTags(['Analytics'])
                                )
                            }
                        })
                        .catch(() => {})
                }
            }
        }

        const onLoadedMetadata = () => dispatch(setDuration(audio.duration))

        const onEnded = () => {
            if (repeat === 'one') {
                listenedSecondsRef.current = 0
                lastTimeRef.current = 0
                playReportedRef.current = false
                audio.currentTime = 0
                void audio.play()
            } else {
                dispatch(nextSong())
            }
        }

        const onError = () => {
            if (loadedSongIdRef.current !== null) {
                dispatch(setPlaying(false))
            }
        }

        audio.addEventListener('timeupdate', onTimeUpdate)
        audio.addEventListener('loadedmetadata', onLoadedMetadata)
        audio.addEventListener('ended', onEnded)
        audio.addEventListener('error', onError)

        return () => {
            audio.removeEventListener('timeupdate', onTimeUpdate)
            audio.removeEventListener('loadedmetadata', onLoadedMetadata)
            audio.removeEventListener('ended', onEnded)
            audio.removeEventListener('error', onError)
        }
    }, [repeat, dispatch, incrementPlay])

    useEffect(() => {
        const audio = audioRef.current
        if (!audio || !currentSong) return

        let cancelled = false
        let objectUrl: string | null = null
        loadedSongIdRef.current = null
        listenedSecondsRef.current = 0
        lastTimeRef.current = 0
        playReportedRef.current = false
        dispatch(setDuration(0))
        dispatch(setProgress(0))

        const loadAndPlay = async () => {
            try {
                const token = localStorage.getItem('token')
                if (!isJwtTokenValid(token)) {
                    if (!cancelled) {
                        dispatch(setPlaying(false))
                        dispatch(logout())
                        dispatch(setShowAuthModal(true))
                    }
                    return
                }
                const response = await fetch(getSongUrl(currentSong.fileName), {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                })
                if (response.status === 401 || response.status === 403) {
                    if (!cancelled) {
                        dispatch(setPlaying(false))
                        dispatch(logout())
                        dispatch(setShowAuthModal(true))
                    }
                    return
                }
                if (!response.ok || cancelled) {
                    if (!cancelled) dispatch(setPlaying(false))
                    return
                }
                const blob = await response.blob()
                if (cancelled) return
                objectUrl = URL.createObjectURL(blob)
                loadedSongIdRef.current = currentSong.id
                audio.src = objectUrl
                audio.load()
                if (isPlayingRef.current) {
                    await audio.play()
                }
            } catch {
                if (!cancelled) dispatch(setPlaying(false))
            }
        }

        void loadAndPlay()

        return () => {
            cancelled = true
            loadedSongIdRef.current = null
            audio.pause()
            audio.removeAttribute('src')
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl)
            }
        }
    }, [currentSong, dispatch])

    useEffect(() => {
        const audio = audioRef.current
        if (!audio || !currentSong) return
        if (loadedSongIdRef.current !== currentSong.id) return
        if (isPlaying) {
            audio.play().catch(() => dispatch(setPlaying(false)))
        } else {
            audio.pause()
        }
    }, [isPlaying, currentSong, dispatch])

    useEffect(() => {
        if (audioRef.current) audioRef.current.volume = volume
    }, [volume])

    const seek = (time: number) => {
        if (audioRef.current && loadedSongIdRef.current !== null) {
            lastTimeRef.current = time
            audioRef.current.currentTime = time
            dispatch(setProgress(time))
        }
    }

    return { seek }
}
