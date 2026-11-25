import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { selectIsAuthenticated } from '../store/slices/authSlice'
import {
    playSong,
    togglePlay,
    nextSong,
    prevSong,
    setVolume,
    toggleShuffle,
    toggleRepeat,
} from '../store/slices/playerSlice'
import { useGetSongsQuery } from '../services/songs/songsApi'
import { useGetAlbumsQuery } from '../services/albums/albumsApi'
import { useAudio } from '../hooks/useAudio'
import { formatTime, resolveSongCover } from '../utils/format'
import MediaImage from '../components/MediaImage'
import { Play, Pause, Music } from 'lucide-react'

import imgShuffle from '../assets/player/shuffle.svg'
import imgPrev from '../assets/player/prev.svg'
import imgNext from '../assets/player/next.svg'
import imgRepeat from '../assets/player/repeat.svg'
import imgMicrophone from '../assets/player/microphone.svg'
import imgQueue from '../assets/player/queue.svg'
import imgDevice from '../assets/player/device.svg'
import imgSoundOn from '../assets/player/sound-on.svg'
import imgSoundOff from '../assets/player/sound-off.svg'
import imgMiniPlayer from '../assets/player/mini-player.svg'
import imgFullScreen from '../assets/player/full-screen.svg'

export default function PlayerBar() {
    const { t } = useTranslation()
    const dispatch = useAppDispatch()
    const isAuth = useAppSelector(selectIsAuthenticated)
    const {
        currentSong,
        currentIndex,
        isPlaying,
        volume,
        progress,
        duration,
        shuffle,
        repeat,
    } = useAppSelector((s) => s.player)
    const { seek } = useAudio()
    const { data: songsPage } = useGetSongsQuery({ page: 0, size: 50 })
    const { data: albumsData } = useGetAlbumsQuery()
    const [hoverProgress, setHoverProgress] = useState(0)
    const [hoverVolume, setHoverVolume] = useState(0)

    const fallbackSongs = songsPage?.content ?? []
    const currentCoverUrl = resolveSongCover(currentSong, albumsData)
    const maxDuration = duration || 100

    const getHoverRatio = (e: React.MouseEvent<HTMLElement>) => {
        const rect = e.currentTarget.getBoundingClientRect()
        if (rect.width <= 0) return 0
        return Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
    }

    if (!isAuth) {
        return (
            <footer className="fixed bottom-16 md:bottom-0 left-0 right-0 min-h-22 w-full bg-gradient-to-r from-sonora-dark via-sonora-purple to-sonora-light font-inter flex flex-wrap items-center justify-between gap-4 px-6 py-4 shrink-0 select-none z-50 border-t border-white/20">
                <div className="flex flex-col text-white">
                    <p className="font-bold text-sm uppercase tracking-wider">
                        {t('webPlayer.guestBannerTitle')}
                    </p>
                    <p className="font-medium text-base text-white/95 mt-0.5">
                        {t('webPlayer.guestBannerDesc')}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        to="/login"
                        className="px-6 py-2.5 rounded-full font-bold text-sm text-white border border-white hover:bg-white/15 transition-colors whitespace-nowrap"
                    >
                        {t('header.logIn')}
                    </Link>
                    <Link
                        to="/register"
                        className="px-7 py-2.5 rounded-full font-bold text-sm bg-white text-sonora-dark hover:scale-105 transition-transform whitespace-nowrap"
                    >
                        {t('webPlayer.signUpFree')}
                    </Link>
                </div>
            </footer>
        )
    }

    const handlePlayOrInit = () => {
        if (currentSong) {
            dispatch(togglePlay())
        } else if (fallbackSongs.length > 0) {
            dispatch(playSong({ song: fallbackSongs[0], queue: fallbackSongs }))
        }
    }

    const handlePrev = () => {
        if (!currentSong) {
            if (fallbackSongs.length > 0) {
                dispatch(playSong({ song: fallbackSongs[0], queue: fallbackSongs }))
            }
            return
        }
        if (progress > 3 || currentIndex <= 0) {
            seek(0)
        }
        dispatch(prevSong())
    }

    const handleNext = () => {
        if (!currentSong && fallbackSongs.length > 0) {
            dispatch(playSong({ song: fallbackSongs[0], queue: fallbackSongs }))
            return
        }
        dispatch(nextSong())
    }

    const handleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen?.().catch(() => {})
        } else {
            document.exitFullscreen?.().catch(() => {})
        }
    }

    return (
        <footer className="fixed bottom-16 md:bottom-0 left-0 right-0 h-20 sm:h-24 w-full bg-sonora-dark font-inter flex items-center justify-between px-2.5 sm:px-5 gap-1.5 sm:gap-4 shrink-0 select-none z-50 border-t border-white/10">
            <div className="flex items-center min-w-0 gap-2 sm:gap-4 w-24 sm:w-44 lg:w-64 shrink-0">
                <MediaImage
                    src={currentCoverUrl}
                    alt={currentSong?.name ?? ''}
                    className={`relative shrink-0 w-9 h-9 sm:w-14 sm:h-14 rounded-md overflow-hidden flex items-center justify-center text-white ${
                        currentSong
                            ? 'bg-gradient-to-br from-sonora-purple to-sonora-light'
                            : 'bg-sonora-panel'
                    }`}
                    fallback={<Music size={20} />}
                />

                <div className="flex flex-col justify-center min-w-0">
                    <p className="font-normal text-xs sm:text-base leading-4 sm:leading-6 text-white truncate">
                        {currentSong ? currentSong.name : t('catalog.selectSong')}
                    </p>
                    {currentSong && (
                        <p className="font-normal text-xs sm:text-base leading-4 sm:leading-6 text-white/80 truncate">
                            {currentSong.artist_name ?? '—'}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex flex-col items-center flex-1 min-w-0 max-w-xl mx-1 sm:mx-4 gap-1 sm:gap-3">
                <div className="flex items-center gap-2.5 sm:gap-8 lg:gap-10">
                    <button
                        type="button"
                        onClick={() => dispatch(toggleShuffle())}
                        className={`relative shrink-0 w-5 h-5 cursor-pointer transition-all hover:scale-110 ${
                            shuffle ? 'opacity-100' : 'opacity-60'
                        }`}
                        title={t('catalog.shuffle')}
                    >
                        <img alt="" className="block w-full h-full" src={imgShuffle} />
                    </button>

                    <button
                        type="button"
                        onClick={handlePrev}
                        className="relative shrink-0 w-5 h-5 cursor-pointer transition-all hover:scale-110"
                        title={t('catalog.prevTrack')}
                    >
                        <img alt="" className="block w-full h-full" src={imgPrev} />
                    </button>

                    <button
                        type="button"
                        onClick={handlePlayOrInit}
                        className="relative shrink-0 w-10 h-10 cursor-pointer transition-transform hover:scale-105 active:scale-95 flex items-center justify-center rounded-full bg-white"
                    >
                        {isPlaying ? (
                            <Pause size={20} fill="#280a3a" color="#280a3a" />
                        ) : (
                            <Play size={20} fill="#280a3a" color="#280a3a" className="ml-0.5" />
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={handleNext}
                        className="relative shrink-0 w-5 h-5 cursor-pointer transition-all hover:scale-110"
                        title={t('catalog.nextTrack')}
                    >
                        <img alt="" className="block w-full h-full" src={imgNext} />
                    </button>

                    <button
                        type="button"
                        onClick={() => dispatch(toggleRepeat())}
                        className={`relative shrink-0 w-5 h-5 cursor-pointer transition-all hover:scale-110 ${
                            repeat !== 'off' ? 'opacity-100' : 'opacity-60'
                        }`}
                        title={
                            repeat === 'one'
                                ? t('catalog.repeatOne')
                                : repeat === 'all'
                                ? t('catalog.repeatAll')
                                : t('catalog.repeatOff')
                        }
                    >
                        <img alt="" className="block w-full h-full" src={imgRepeat} />
                        {repeat === 'one' && (
                            <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-sonora-light text-white text-xs font-bold rounded-full flex items-center justify-center">
                                1
                            </span>
                        )}
                    </button>
                </div>

                <div className="flex items-center w-full max-w-lg gap-2 sm:gap-3">
                    <span className="font-normal text-xs sm:text-base leading-5 text-white text-right shrink-0 min-w-7 sm:min-w-9">
                        {formatTime(progress)}
                    </span>

                    <div
                        className="relative flex-1 flex items-center h-4"
                        onMouseMove={(e) => setHoverProgress(getHoverRatio(e) * maxDuration)}
                        onMouseLeave={() => setHoverProgress(0)}
                    >
                        <progress
                            value={hoverProgress}
                            max={maxDuration}
                            className="player-progress-hover absolute inset-x-0 w-full h-1.5 rounded-full overflow-hidden pointer-events-none"
                        />
                        <progress
                            value={progress}
                            max={maxDuration}
                            className="player-progress relative w-full h-1.5 rounded-full overflow-hidden pointer-events-none"
                        />
                        <input
                            type="range"
                            min={0}
                            max={maxDuration}
                            step={0.1}
                            value={progress}
                            onChange={(e) => seek(Number(e.target.value))}
                            className="absolute inset-0 w-full h-full cursor-pointer"
                        />
                    </div>

                    <span className="font-normal text-xs sm:text-base leading-5 text-white shrink-0 min-w-7 sm:min-w-9">
                        {formatTime(duration)}
                    </span>
                </div>
            </div>

            <div className="flex items-center justify-end gap-3 lg:gap-5 shrink-0">
                <button
                    type="button"
                    className="hidden lg:block relative shrink-0 w-5 h-5 cursor-pointer hover:opacity-80"
                >
                    <img alt="" className="block w-full h-full" src={imgMicrophone} />
                </button>

                <button
                    type="button"
                    className="hidden lg:block relative shrink-0 w-5 h-5 cursor-pointer hover:opacity-80"
                >
                    <img alt="" className="block w-full h-full" src={imgQueue} />
                </button>

                <button
                    type="button"
                    className="hidden lg:block relative shrink-0 w-6 h-5 cursor-pointer hover:opacity-80"
                >
                    <img alt="" className="block w-full h-full" src={imgDevice} />
                </button>

                <div className="relative flex items-center shrink-0 h-4 gap-1.5 sm:gap-2.5">
                    <button
                        type="button"
                        onClick={() => dispatch(setVolume(volume === 0 ? 0.8 : 0))}
                        className="relative shrink-0 w-4 h-3.5 sm:w-5 sm:h-4 cursor-pointer hover:opacity-80"
                    >
                        <img
                            alt=""
                            className="block w-full h-full"
                            src={volume === 0 ? imgSoundOff : imgSoundOn}
                        />
                    </button>

                    <div
                        className="relative w-12 sm:w-20 lg:w-25 shrink-0 flex items-center h-4"
                        onMouseMove={(e) => setHoverVolume(getHoverRatio(e))}
                        onMouseLeave={() => setHoverVolume(0)}
                    >
                        <progress
                            value={hoverVolume}
                            max={1}
                            className="player-progress-hover absolute inset-x-0 w-full h-1.5 rounded-full overflow-hidden pointer-events-none"
                        />
                        <progress
                            value={volume}
                            max={1}
                            className="player-progress relative w-full h-1.5 rounded-full overflow-hidden pointer-events-none"
                        />
                        <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.01}
                            value={volume}
                            onChange={(e) => dispatch(setVolume(Number(e.target.value)))}
                            className="absolute inset-0 w-full h-full cursor-pointer"
                        />
                    </div>
                </div>

                <button
                    type="button"
                    className="hidden lg:block relative shrink-0 w-6 h-5 cursor-pointer hover:opacity-80"
                >
                    <img alt="" className="block w-full h-full" src={imgMiniPlayer} />
                </button>

                <button
                    type="button"
                    onClick={handleFullScreen}
                    className="hidden sm:block relative shrink-0 w-5 h-5 cursor-pointer hover:opacity-80"
                >
                    <img alt="" className="block w-full h-full" src={imgFullScreen} />
                </button>
            </div>
        </footer>
    )
}
