import { useParams, useNavigate, Link } from 'react-router-dom'
import { useGetArtistByIdQuery } from '../services/artists/artistsApi'
import { useGetSongsQuery } from '../services/songs/songsApi'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { playSong, togglePlay, selectCurrentSong, selectIsPlaying } from '../store/slices/playerSlice'
import type { ISong } from '../types/ISong'
import {Play, Pause, ArrowLeft, Music, Disc} from 'lucide-react'
import {useGetAlbumsQuery} from "../services/albums/albumsApi.ts";

export default function ArtistDetailsPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const dispatch = useAppDispatch()

    const currentSong = useAppSelector(selectCurrentSong)
    const isPlaying = useAppSelector(selectIsPlaying)

    const { data: artist, isLoading: isArtistLoading } = useGetArtistByIdQuery(Number(id))

    const { data: songsData, isLoading: isSongsLoading } = useGetSongsQuery({ page: 0, size: 100 })

    const { data: albumsData, isLoading: isAlbumsLoading } = useGetAlbumsQuery()
    const artistSongs = songsData?.content ? songsData.content.filter((song: ISong) =>
        song.artist_name?.toLowerCase() === artist?.name?.toLowerCase()
    ) : []

    const artistAlbums = albumsData ? albumsData.filter(album => album.artistId === Number(id)) : []
    const handlePlaySong = (song: ISong) => {
        if (currentSong?.id === song.id) dispatch(togglePlay())
        else dispatch(playSong({ song, queue: artistSongs }))
    }

    if (isArtistLoading || isSongsLoading || isAlbumsLoading) return (
        <div className="flex items-center justify-center h-48">
            <p className="animate-pulse text-sm" style={{ color: 'var(--text-3)' }}>Завантаження профілю виконавця...</p>
        </div>
    )

    if (!artist) return <p className="text-center py-12 text-sm opacity-60">Виконавця не знайдено</p>

    return (
        <div className="max-w-4xl pb-10 select-none">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-xs font-bold mb-6 opacity-80 hover:opacity-100 transition-all" style={{ color: 'var(--text)' }}>
                <ArrowLeft size={16} /> Назад
            </button>

            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-8">
                <div className="w-40 h-40 md:w-48 md:h-48 rounded-full shadow-xl flex items-center justify-center flex-shrink-0 bg-[var(--accent)] text-black font-black text-4xl">
                    {artist.name[0].toUpperCase()}
                </div>
                <div className="text-center md:text-left min-w-0">
                    <p className="text-xs font-black uppercase tracking-widest opacity-60">Виконавець</p>
                    <h1 className="text-3xl md:text-5xl font-black tracking-tight my-1 truncate" style={{ color: 'var(--text)' }}>
                        {artist.name}
                    </h1>
                    <p className="text-xs font-medium opacity-60" style={{ color: 'var(--text-3)' }}>
                        Рік народження/заснування: {artist.birthDate ? new Date(artist.birthDate).getFullYear() : '—'}
                    </p>
                </div>
            </div>

            {artistAlbums.length > 0 && (
                <section className="mb-10">
                    <h2 className="text-xl font-bold mb-4 tracking-tight" style={{ color: 'var(--text)' }}>Альбоми дискографії</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {artistAlbums.map((album) => (
                            <Link
                                key={album.id}
                                to={`/albums/${album.id}`}
                                className="flex flex-col gap-2 p-4 rounded-xl transition-all bg-white/[0.01] hover:bg-white/[0.04] border border-white/5 group"
                            >
                                <div className="w-full aspect-square rounded-lg flex items-center justify-center bg-white/5 relative overflow-hidden">
                                    <Disc size={36} className="opacity-40 transition-transform duration-500 group-hover:rotate-90" style={{ color: 'var(--text-2)' }} />
                                </div>
                                <p className="font-bold text-sm truncate group-hover:text-[var(--accent)] transition-colors" style={{ color: 'var(--text)' }}>
                                    {album.title}
                                </p>
                                <p className="text-xs opacity-60" style={{ color: 'var(--text-3)' }}>
                                    {album.releaseYear} рік
                                </p>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
            <section>
                <h2 className="text-xl font-bold mb-4 tracking-tight" style={{ color: 'var(--text)' }}>Популярні треки</h2>
                <div className="flex flex-col gap-0.5">
                    {artistSongs.map((song, i) => {
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
                                        {song.album_title ?? 'Сингл'}
                                    </p>
                                </div>
                                <button onClick={() => handlePlaySong(song)} className="hidden group-hover:block transition-transform active:scale-90" style={{ color: 'var(--text)' }}>
                                    {active && isPlaying ? <Pause size={14} fill="currentColor"/> : <Play size={14} fill="currentColor"/>}
                                </button>
                            </div>
                        )
                    })}
                </div>
            </section>

            {artistSongs.length === 0 && (
                <p className="text-center py-12 text-sm opacity-40">У цього виконавця поки немає завантажених треків.</p>
            )}
        </div>
    )
}