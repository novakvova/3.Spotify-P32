import { useParams, useNavigate } from 'react-router-dom'
import { useGetGenresQuery } from '../services/genres/genresApi'
import { useGetSongsQuery } from '../services/songs/songsApi'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { playSong, togglePlay, selectCurrentSong, selectIsPlaying } from '../store/slices/playerSlice'
import type { ISong } from '../types/ISong'
import { Play, Pause, ArrowLeft, Layers, Music } from 'lucide-react'

export default function GenreDetailsPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const dispatch = useAppDispatch()

    const currentSong = useAppSelector(selectCurrentSong)
    const isPlaying = useAppSelector(selectIsPlaying)

    const { data: genres } = useGetGenresQuery()
    const currentGenre = genres?.find(g => g.id === Number(id))

    const { data: songsData, isLoading } = useGetSongsQuery({ page: 0, size: 100 })

    const genreSongs = songsData?.content ? songsData.content.filter((song: ISong) =>
        song.genres_names?.some(gName => gName.toLowerCase() === currentGenre?.name?.toLowerCase())
    ) : []

    const handlePlaySong = (song: ISong) => {
        if (currentSong?.id === song.id) dispatch(togglePlay())
        else dispatch(playSong({ song, queue: genreSongs }))
    }

    if (isLoading) return (
        <div className="flex items-center justify-center h-48">
            <p className="animate-pulse text-sm" style={{ color: 'var(--text-3)' }}>Вхід у жанр...</p>
        </div>
    )

    if (!currentGenre) return <p className="text-center py-12 text-sm opacity-60">Жанр не знайдено</p>

    return (
        <div className="max-w-4xl pb-10 select-none">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-xs font-bold mb-6 opacity-80 hover:opacity-100 transition-all" style={{ color: 'var(--text)' }}>
                <ArrowLeft size={16} /> Назад
            </button>

            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-8">
                <div className="w-40 h-40 md:w-48 md:h-48 rounded-2xl shadow-xl flex items-center justify-center flex-shrink-0 bg-white/5 border border-white/5 text-[var(--accent)]">
                    <Layers size={54} className="opacity-40" />
                </div>
                <div className="text-center md:text-left min-w-0">
                    <p className="text-xs font-black uppercase tracking-widest opacity-60">Жанр</p>
                    <h1 className="text-3xl md:text-5xl font-black tracking-tight my-1 truncate" style={{ color: 'var(--text)' }}>
                        {currentGenre.name}
                    </h1>
                    <p className="text-xs opacity-70 max-w-xl mt-1 leading-relaxed" style={{ color: 'var(--text-2)' }}>
                        {currentGenre.description ?? 'Опис жанру відсутній.'}
                    </p>
                </div>
            </div>

            <h2 className="text-lg font-bold mb-4 tracking-tight" style={{ color: 'var(--text)' }}>Пісні у цьому жанрі</h2>

            <div className="flex flex-col gap-0.5">
                {genreSongs.map((song, i) => {
                    const active = currentSong?.id === song.id
                    return (
                        <div
                            key={song.id}
                            onDoubleClick={() => handlePlaySong(song)}
                            className="flex items-center gap-4 px-4 py-2.5 rounded-lg group hover:bg-white/[0.04] transition-colors cursor-pointer"
                            style={{ background: active ? 'var(--bg-hover)' : 'transparent' }}
                        >
                            <span className="text-xs font-semibold w-5 text-center" style={{ color: active ? 'var(--accent)' : 'var(--text-3)' }}>
                                {active && isPlaying ? '♫' : i + 1}
                            </span>
                            <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center flex-shrink-0">
                                <Music size={14} style={{ color: active ? 'var(--accent)' : 'var(--text-3)' }} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold truncate" style={{ color: active ? 'var(--accent)' : 'var(--text)' }}>
                                    {song.name}
                                </p>
                                <p className="text-xs truncate opacity-60" style={{ color: 'var(--text-3)' }}>
                                    {song.artist_name ?? '—'}
                                </p>
                            </div>
                            <button onClick={() => handlePlaySong(song)} className="hidden group-hover:block transition-transform active:scale-90" style={{ color: 'var(--text)' }}>
                                {active && isPlaying ? <Pause size={14} fill="currentColor"/> : <Play size={14} fill="currentColor"/>}
                            </button>
                        </div>
                    )
                })}
            </div>

            {genreSongs.length === 0 && (
                <p className="text-center py-12 text-sm opacity-40">У цьому жанрі поки немає пісень.</p>
            )}
        </div>
    )
}