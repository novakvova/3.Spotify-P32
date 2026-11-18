import { useEffect, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
    setProgress,
    setDuration,
    setPlaying,
    nextSong,
    selectCurrentSong,
    selectIsPlaying,
    selectPlayerState,
} from '../store/slices/playerSlice'
import { getSongUrl } from '../utils/format'

export function useAudio() {
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const isPlayingRef = useRef<boolean>(false)
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
        const onError = () => dispatch(setPlaying(false))

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

        const loadAndPlay = async () => {
            try {
                const token = localStorage.getItem('token')
                const response = await fetch(getSongUrl(currentSong.fileName), {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                })
                if (!response.ok || cancelled) {
                    if (!cancelled) dispatch(setPlaying(false))
                    return
                }
                const blob = await response.blob()
                if (cancelled) return
                objectUrl = URL.createObjectURL(blob)
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
            audio.pause()
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl)
            }
        }
    }, [currentSong, dispatch])

    useEffect(() => {
        const audio = audioRef.current
        if (!audio || !currentSong || !audio.src) return
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
        if (audioRef.current) {
            audioRef.current.currentTime = time
            dispatch(setProgress(time))
        }
    }

    return { seek }
}
