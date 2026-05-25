import { Link } from 'react-router-dom'
import { useGetGenresQuery } from '../services/genres/genresApi'
import { useGetSongsQuery } from '../services/songs/songsApi'
import { useGetArtistsQuery } from '../services/artists/artistsApi'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { selectCurrentUser, selectIsAuthenticated } from '../store/slices/authSlice'
import { playSong, togglePlay, selectCurrentSong, selectIsPlaying } from '../store/slices/playerSlice'
import type { ISong } from '../types/ISong'
import { Play, Pause, Music, HelpCircle } from 'lucide-react'

export default function HomePage() {
    const dispatch = useAppDispatch()
    const isAuth = useAppSelector(selectIsAuthenticated)
    const user = useAppSelector(selectCurrentUser)
    const currentSong = useAppSelector(selectCurrentSong)
    const isPlaying = useAppSelector(selectIsPlaying)

    const { data: genresData } = useGetGenresQuery()
    const { data: songsData } = useGetSongsQuery({ page: 0, size: 6 })
    const { data: artistsData } = useGetArtistsQuery()

    const genres = genresData ?? []
    const songs = songsData?.content ?? []
    const artists = artistsData?.slice(0, 6) ?? []

    const handlePlay = (song: ISong) => {
        if (currentSong?.id === song.id) dispatch(togglePlay())
        else dispatch(playSong({ song, queue: songs }))
    }

    return (
        <div className="max-w-4xl pb-12 select-none">
            <section className="mb-10 bg-gradient-to-r from-white/5 to-transparent p-6 rounded-2xl border border-white/5">
                <p className="text-xs font-bold tracking-widest uppercase mb-1.5" style={{ color: 'var(--accent)' }}>
                    {isAuth ? 'Ласкаво просимо назад' : 'Музика без меж'}
                </p>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2" style={{ color: 'var(--text)' }}>
                    {isAuth ? `Привіт, ${user?.username} 👋` : 'Твій особистий музичний простір'}
                </h1>
                <p className="text-sm max-w-md mb-5 opacity-70" style={{ color: 'var(--text-2)' }}>
                    Слухай улюблену музику, відкривай нові жанри та найкращих виконавців
                </p>
                <Link
                    to="/songs"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-all hover:scale-105 active:scale-95 shadow-md"
                    style={{ background: 'var(--accent)', color: '#000' }}
                >
                    <Play size={14} fill="#000" /> Слухати зараз
                </Link>
            </section>

            {songs.length > 0 && (
                <section className="mb-10">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>Популярні треки</h2>
                        <Link to="/songs" className="text-xs font-bold hover:underline transition-all" style={{ color: 'var(--accent)' }}>
                            Дивитись всі →
                        </Link>
                    </div>

                    <div className="flex flex-col gap-0.5">
                        {songs.map((song, i) => {
                            const active = currentSong?.id === song.id
                            return (
                                <div
                                    key={song.id}
                                    className="flex items-center gap-3 px-3 py-2 rounded-xl transition-all group cursor-pointer"
                                    style={{ background: active ? 'var(--bg-hover)' : 'transparent' }}
                                    onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--bg-hover)' }}
                                    onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
                                    onDoubleClick={() => handlePlay(song)}
                                >
                                    <div className="w-6 text-center flex-shrink-0 flex items-center justify-center">
                                        <span className="text-xs font-semibold group-hover:hidden" style={{ color: active ? 'var(--accent)' : 'var(--text-3)' }}>
                                            {active && isPlaying ? '♫' : i + 1}
                                        </span>
                                        <button onClick={() => handlePlay(song)} className="hidden group-hover:block text-white transition-transform active:scale-90" style={{ color: 'var(--text)' }}>
                                            {active && isPlaying ? <Pause size={12} fill="currentColor"/> : <Play size={12} fill="currentColor"/>}
                                        </button>
                                    </div>

                                    <div className="w-9 h-9 rounded bg-white/5 flex items-center justify-center flex-shrink-0">
                                        <Music size={16} style={{ color: active ? 'var(--accent)' : 'var(--text-3)' }} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold truncate" style={{ color: active ? 'var(--accent)' : 'var(--text)' }}>
                                            {song.name}
                                        </p>
                                        <p className="text-xs truncate opacity-70" style={{ color: 'var(--text-3)' }}>
                                            {song.artist_name ?? '—'}
                                        </p>
                                    </div>

                                    <p className="hidden sm:block text-xs truncate max-w-32 opacity-60" style={{ color: 'var(--text-3)' }}>
                                        {song.album_title ?? '—'}
                                    </p>
                                </div>
                            )
                        })}
                    </div>
                </section>
            )}

            {genres.length > 0 && (
                <section className="mb-10">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>Популярні жанри</h2>
                        <Link to="/genres" className="text-xs font-bold hover:underline" style={{ color: 'var(--accent)' }}>
                            Всі жанри →
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                        {genres.slice(0, 10).map((g) => (
                            <Link
                                key={g.id}
                                to={`/genres/${g.id}`}
                                className="p-4 rounded-xl font-bold text-xs transition-all hover:scale-[1.03] active:scale-98 text-center bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 shadow-sm"
                                style={{ color: 'var(--text)' }}
                            >
                                {g.name}
                            </Link>
                        ))}
                    </div>
                </section>
            )}
            {artists.length > 0 && (
                <section className="mb-10">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>Виконавці</h2>
                        <Link to="/artists" className="text-xs font-bold hover:underline" style={{ color: 'var(--accent)' }}>
                            Всі виконавці →
                        </Link>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                        {artists.map((artist) => (
                            <Link
                                key={artist.id}
                                to={`/artists/${artist.id}`}
                                className="flex flex-col items-center gap-3 p-3 rounded-xl transition-all hover:bg-white/[0.04] group cursor-pointer"
                            >
                                <div
                                    className="w-16 h-16 rounded-full flex items-center justify-center text-lg font-black transition-transform group-hover:scale-105 shadow-md relative overflow-hidden"
                                    style={{ background: 'var(--accent)', color: '#000' }}
                                >
                                    {artist.name[0].toUpperCase()}
                                </div>
                                <p className="text-xs font-bold truncate w-full text-center" style={{ color: 'var(--text)' }}>
                                    {artist.name}
                                </p>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
            {songs.length === 0 && genres.length === 0 && artists.length === 0 && (
                <div className="rounded-2xl p-8 text-sm text-center border border-white/5 bg-white/[0.01]">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                        <HelpCircle size={22} style={{ color: 'var(--text-3)' }} />
                    </div>
                    <p className="font-bold text-base mb-1" style={{ color: 'var(--text)' }}>Даних поки немає</p>
                    <p className="opacity-60 mb-3 text-xs">Запусти бекенд або додай треки через панель інтеграції</p>
                    <a
                        href="http://localhost:8434/swagger-ui.html"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block text-xs font-bold hover:underline"
                        style={{ color: 'var(--accent)' }}
                    >
                        Відкрити Swagger →
                    </a>
                </div>
            )}
        </div>
    )
}