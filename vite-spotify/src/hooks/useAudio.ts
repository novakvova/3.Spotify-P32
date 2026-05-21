import { useEffect, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
    setProgress, setDuration, setPlaying, nextSong,
    selectCurrentSong, selectIsPlaying, selectPlayerState,
} from '../store/slices/playerSlice'
import { getSongUrl } from '../utils/format'

export function useAudio() {
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const dispatch = useAppDispatch()
    const currentSong = useAppSelector(selectCurrentSong)
    const isPlaying = useAppSelector(selectIsPlaying)
    const { volume, repeat } = useAppSelector(selectPlayerState)

    useEffect(() => {
        if (!audioRef.current) audioRef.current = new Audio()
        const audio = audioRef.current

        const onTimeUpdate = () => dispatch(setProgress(audio.currentTime))
        const onLoadedMetadata = () => dispatch(setDuration(audio.duration))
        const onEnded = () =>
            repeat === 'one'
                ? (audio.currentTime = 0, void audio.play())
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
        audio.src = getSongUrl(currentSong.fileName)
        audio.load()
        audio.play().catch(() => dispatch(setPlaying(false)))
    }, [currentSong?.id])

    useEffect(() => {
        const audio = audioRef.current
        if (!audio) return
        isPlaying
            ? audio.play().catch(() => dispatch(setPlaying(false)))
            : audio.pause()
    }, [isPlaying])

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