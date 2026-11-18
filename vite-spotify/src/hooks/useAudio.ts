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
import { getSongUrl } from '../utils/format'

export function useAudio() {
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const isPlayingRef = useRef<boolean>(false)
    const loadedSongIdRef = useRef<number | null>(null)
    const dispatch = useAppDispatch()
    const currentSong = useAppSelector(selectCurrentSong)
    const isPlaying = useAppSelector(selectIsPlaying)
    const { volume, repeat } = useAppSelector(selectPlayerState)

    useEffect(() => {
        isPlayingRef.current = isPlaying
    }, [isPlaying])

    useEffect(() => {
        if (!audioRef.current) audioRef.current = new Audio()
        const audio = audioRef.current

        const onTimeUpdate = () => dispatch(setProgress(audio.currentTime))
        const onLoadedMetadata = () => dispatch(setDuration(audio.duration))
        const onEnded = () =>
            repeat === 'one'
                ? ((audio.currentTime = 0), void audio.play())
                : dispatch(nextSong())
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
    }, [repeat, dispatch])

    useEffect(() => {
        const audio = audioRef.current
        if (!audio || !currentSong) return

        let cancelled = false
        let objectUrl: string | null = null
        loadedSongIdRef.current = null
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
            audioRef.current.currentTime = time
            dispatch(setProgress(time))
        }
    }

    return { seek }
}
