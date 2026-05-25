import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
    togglePlay, nextSong, prevSong,
    setVolume, toggleShuffle, toggleRepeat,
} from '../store/slices/playerSlice'
import { useAudio } from '../hooks/useAudio'
import {
    Shuffle, SkipBack, SkipForward,
    Play, Pause, Repeat, Repeat1,
    Volume1, Volume2, VolumeX, Music
} from 'lucide-react'

function fmt(s: number) {
    if (!s || isNaN(s)) return '0:00'
    return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}

export default function PlayerBar() {
    const dispatch = useAppDispatch()
    const {
        currentSong, isPlaying, volume,
        progress, duration, shuffle, repeat,
    } = useAppSelector(s => s.player)
    const { seek } = useAudio()

    const pct = duration ? (progress / duration) * 100 : 0
    const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2

    return (
        <footer
            className="fixed bottom-16 md:relative md:bottom-auto left-0 w-full h-20 border-t flex items-center px-4 gap-4 flex-shrink-0 z-45 transition-all duration-200 select-none"
            style={{ background: 'var(--sidebar-bg)', borderColor: 'var(--border)' }}
        >
            <div className="flex items-center gap-3 min-w-0" style={{ width: 220 }}>
                {currentSong ? (
                    <>
                        <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-lg"
                            style={{ background: 'var(--bg-hover)', color: 'var(--text-2)' }}
                        >
                            <Music size={20} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>
                                {currentSong.name}
                            </p>
                            <p className="text-xs truncate" style={{ color: 'var(--text-3)' }}>
                                {currentSong.artist_name ?? '—'}
                            </p>
                        </div>
                    </>
                ) : (
                    <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                        Оберіть пісню
                    </p>
                )}
            </div>


            <div className="flex flex-col items-center gap-1.5 flex-1">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => dispatch(toggleShuffle())}
                        className="transition-all hover:scale-110 active:scale-95"
                        style={{ color: shuffle ? 'var(--accent)' : 'var(--text-3)', opacity: shuffle ? 1 : 0.6 }}
                        title="Перемішати"
                    >
                        <Shuffle size={16} />
                    </button>

                    <button
                        onClick={() => dispatch(prevSong())}
                        className="transition-all hover:scale-110 active:scale-95"
                        style={{ color: 'var(--text-2)' }}
                        title="Попередня"
                    >
                        <SkipBack size={20} fill="currentColor" />
                    </button>

                    <button
                        onClick={() => dispatch(togglePlay())}
                        className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-sm"
                        style={{ background: 'var(--text)', color: 'var(--bg)' }}
                    >
                        {isPlaying
                            ? <Pause size={16} fill="currentColor" />
                            : <Play size={16} fill="currentColor" className="ml-0.5" />
                        }
                    </button>

                    <button
                        onClick={() => dispatch(nextSong())}
                        className="transition-all hover:scale-110 active:scale-95"
                        style={{ color: 'var(--text-2)' }}
                        title="Наступна"
                    >
                        <SkipForward size={20} fill="currentColor" />
                    </button>

                    <button
                        onClick={() => dispatch(toggleRepeat())}
                        className="transition-all hover:scale-110 active:scale-95"
                        style={{
                            color: repeat !== 'off' ? 'var(--accent)' : 'var(--text-3)',
                            opacity: repeat !== 'off' ? 1 : 0.6,
                        }}
                        title={repeat === 'one' ? 'Повтор: одна' : repeat === 'all' ? 'Повтор: всі' : 'Повтор: вимк'}
                    >
                        {repeat === 'one' ? <Repeat1 size={16} /> : <Repeat size={16} />}
                    </button>
                </div>

                <div className="flex items-center gap-2 w-full max-w-md">
                    <span className="text-[11px] w-8 text-right flex-shrink-0 font-medium" style={{ color: 'var(--text-3)' }}>
                        {fmt(progress)}
                    </span>

                    <div className="flex-1 h-1 relative flex items-center group">
                        <div
                            className="absolute left-0 top-0 h-full w-full rounded-full pointer-events-none transition-colors duration-200"
                            style={{ background: 'var(--border)' }}
                        >
                            <div
                                className="h-full rounded-full relative transition-all duration-100 ease-linear"
                                style={{
                                    width: `${pct}%`,
                                    background: 'var(--accent)'
                                }}
                            >
                                <div
                                    className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-all duration-150 scale-75 group-hover:scale-100 shadow-md"
                                    style={{ transform: 'translate(50%, -50%)' }}
                                />
                            </div>
                        </div>


                        <input
                            type="range"
                            min={0}
                            max={duration || 100}
                            value={progress}
                            onChange={(e) => seek(Number(e.target.value))}
                            className="w-full h-full cursor-pointer opacity-0 absolute top-0 left-0 z-10"
                        />
                    </div>

                    <span className="text-[11px] w-8 flex-shrink-0 font-medium" style={{ color: 'var(--text-3)' }}>
                        {fmt(duration)}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-2" style={{ width: 130 }}>
                <button
                    onClick={() => dispatch(setVolume(volume === 0 ? 0.8 : 0))}
                    className="flex-shrink-0 transition-all hover:scale-110 active:scale-95"
                    style={{ color: 'var(--text-3)', opacity: 0.8 }}
                >
                    <VolumeIcon size={18} />
                </button>

                <div className="flex-1 h-1 relative flex items-center group">
                    <div
                        className="absolute left-0 top-0 h-full w-full rounded-full pointer-events-none"
                        style={{ background: 'var(--border)' }}
                    >
                        <div
                            className="h-full rounded-full relative transition-all duration-75 ease-out"
                            style={{
                                width: `${volume * 100}%`,
                                background: 'var(--text-2)'
                            }}
                        >
                            <div
                                className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-all duration-150 scale-75 group-hover:scale-100 shadow-md"
                                style={{ transform: 'translate(50%, -50%)' }}
                            />
                        </div>
                    </div>

                    <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={volume}
                        onChange={(e) => dispatch(setVolume(Number(e.target.value)))}
                        className="w-full h-full cursor-pointer opacity-0 absolute top-0 left-0 z-10"
                    />
                </div>
            </div>
        </footer>
    )
}