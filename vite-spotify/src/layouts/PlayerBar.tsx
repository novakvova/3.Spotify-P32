import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
    togglePlay, nextSong, prevSong,
    setVolume, toggleShuffle, toggleRepeat,
} from '../store/slices/playerSlice'
import { useAudio } from '../hooks/useAudio'

function fmt(s: number) {
    if (!s || isNaN(s)) return '0:00'
    return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}

export default function PlayerBar() {
    const dispatch = useAppDispatch()
    const { currentSong, isPlaying, volume, progress, duration, shuffle, repeat } =
        useAppSelector(s => s.player)
    const { seek } = useAudio()

    const pct = duration ? (progress / duration) * 100 : 0

    return (
        <footer
            className="fixed bottom-16 md:relative md:bottom-auto left-0 w-full h-20 border-t z-45 flex items-center justify-between px-4 bg-[var(--sidebar-bg)]"
            style={{
                borderColor: 'var(--border)'
            }}
        >
            <div className="flex items-center justify-between w-full" style={{ width: 220 }}>
                {currentSong ? (
                    <>
                        <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-lg"
                            style={{ background: 'var(--bg-hover)' }}
                        >♪</div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>
                                {currentSong.name}
                            </p>
                            <p className="text-xs truncate" style={{ color: 'var(--text-3)' }}>
                                {currentSong.artist ?? '—'}
                            </p>
                        </div>
                    </>
                ) : (
                    <p className="text-xs" style={{ color: 'var(--text-3)' }}>Оберіть пісню</p>
                )}
            </div>
            <div className="flex flex-col items-center gap-1.5 flex-1">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => dispatch(toggleShuffle())}
                        className="text-sm transition-opacity hover:opacity-100"
                        style={{ color: shuffle ? 'var(--accent)' : 'var(--text-3)', opacity: shuffle ? 1 : 0.6 }}
                        title="Перемішати"
                    >⇄</button>

                    <button
                        onClick={() => dispatch(prevSong())}
                        className="text-lg transition-opacity hover:opacity-100"
                        style={{ color: 'var(--text-2)', opacity: 0.8 }}
                    >⏮</button>

                    <button
                        onClick={() => dispatch(togglePlay())}
                        className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-transform hover:scale-105"
                        style={{ background: 'var(--text)', color: 'var(--bg)' }}
                    >
                        {isPlaying ? '⏸' : '▶'}
                    </button>

                    <button
                        onClick={() => dispatch(nextSong())}
                        className="text-lg transition-opacity hover:opacity-100"
                        style={{ color: 'var(--text-2)', opacity: 0.8 }}
                    >⏭</button>

                    <button
                        onClick={() => dispatch(toggleRepeat())}
                        className="text-sm transition-opacity hover:opacity-100"
                        style={{ color: repeat !== 'off' ? 'var(--accent)' : 'var(--text-3)', opacity: repeat !== 'off' ? 1 : 0.6 }}
                        title={repeat === 'one' ? 'Повтор: одна' : repeat === 'all' ? 'Повтор: всі' : 'Повтор: вимк'}
                    >{repeat === 'one' ? '🔂' : '🔁'}</button>
                </div>

                <div className="flex items-center gap-2 w-full max-w-md">
                    <span className="text-xs w-8 text-right" style={{ color: 'var(--text-3)' }}>{fmt(progress)}</span>
                    <div
                        className="flex-1 h-1 rounded-full relative cursor-pointer group"
                        style={{ background: 'var(--border)' }}
                        onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect()
                            seek(((e.clientX - rect.left) / rect.width) * (duration || 0))
                        }}
                    >
                        <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${pct}%`, background: 'var(--accent)' }}
                        />
                    </div>
                    <span className="text-xs w-8" style={{ color: 'var(--text-3)' }}>{fmt(duration)}</span>
                </div>
            </div>
            <div className="flex items-center gap-2" style={{ width: 120 }}>
        <span className="text-xs" style={{ color: 'var(--text-3)' }}>
          {volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
        </span>
                <input
                    type="range" min={0} max={1} step={0.01} value={volume}
                    onChange={(e) => dispatch(setVolume(Number(e.target.value)))}
                    className="flex-1"
                    style={{ accentColor: 'var(--accent)' }}
                />
            </div>
        </footer>
    )
}