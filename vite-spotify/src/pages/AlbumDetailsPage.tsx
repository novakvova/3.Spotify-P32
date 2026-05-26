import {useParams, useNavigate, Link} from 'react-router-dom'
import { useGetAlbumByIdQuery } from '../services/albums/albumsApi'
import { useGetSongsQuery } from '../services/songs/songsApi'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { playSong, togglePlay, selectCurrentSong, selectIsPlaying } from '../store/slices/playerSlice'
import type { ISong } from '../types/ISong'
import { Play, Pause, ArrowLeft, Disc, Music } from 'lucide-react'
import {useGetArtistByIdQuery} from "../services/artists/artistsApi.ts";

export default function AlbumDetailsPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const dispatch = useAppDispatch()

    const currentSong = useAppSelector(selectCurrentSong)
    const isPlaying = useAppSelector(selectIsPlaying)

    const { data: album, isLoading: isAlbumLoading } = useGetAlbumByIdQuery(Number(id))
    const { data: artist, isLoading: isArtistLoading } = useGetArtistByIdQuery(
        Number(album?.artistId),
        { skip: !album?.artistId }
    )
    const { data: songsData, isLoading: isSongsLoading } = useGetSongsQuery({ page: 0, size: 100 })

    const albumSongs = songsData?.content ? songsData.content.filter((song: ISong) =>
        song.album_title?.toLowerCase() === album?.title?.toLowerCase()
    ) : []

    const finalArtistName = artist?.name ?? albumSongs[0]?.artist_name ?? 'Невідомий виконавець'
    const handlePlayAll = () => {
        if (albumSongs.length > 0) {
            dispatch(playSong({ song: albumSongs[0], queue: albumSongs }))
        }
    }

    const handlePlaySong = (song: ISong) => {
        if (currentSong?.id === song.id) dispatch(togglePlay())
        else dispatch(playSong({ song, queue: albumSongs }))
    }

    if (isAlbumLoading || isSongsLoading || isArtistLoading) return (
        <div className="flex items-center justify-center h-48">
            <p className="animate-pulse text-sm" style={{ color: 'var(--text-3)' }}>Завантаження альбому...</p>
        </div>
    )

    if (!album) return <p className="text-center py-12 text-sm opacity-60">Альбом не знайдено</p>

    return (
        <div className="max-w-4xl pb-10 select-none">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-xs font-bold mb-6 opacity-80 hover:opacity-100 transition-all"
                style={{ color: 'var(--text)' }}
            >
                <ArrowLeft size={16} /> Назад
            </button>

            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-8">
                <div className="w-40 h-40 md:w-48 md:h-48 rounded-xl shadow-xl flex items-center justify-center flex-shrink-0 bg-white/5 border border-white/5">
                    <Disc size={64} className="opacity-30 text-[var(--text-2)]" />
                </div>
                <div className="text-center md:text-left min-w-0">
                    <p className="text-xs font-black uppercase tracking-widest opacity-60">Альбом</p>
                    <h1 className="text-3xl md:text-5xl font-black tracking-tight my-1 truncate" style={{ color: 'var(--text)' }}>
                        {album.title}
                    </h1>
                    <p className="text-sm font-semibold opacity-90 flex items-center gap-1.5" style={{ color: 'var(--text-2)' }}>
                        <Link
                            to={`/artists/${album.artistId}`}
                            className="hover:underline transition-colors font-bold"
                            style={{ color: 'var(--accent)' }}
                        >
                            {finalArtistName}
                        </Link>
                        <span className="opacity-40">•</span>
                        <span className="text-[var(--text-3)] font-normal">{albumSongs.length} треків</span>
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={handlePlayAll}
                    disabled={albumSongs.length === 0}
                    className="w-12 h-12 rounded-full flex items-center justify-center bg-[var(--accent)] text-black transition-transform hover:scale-105 active:scale-95 shadow-md disabled:opacity-40"
                >
                    <Play size={20} fill="currentColor" className="ml-0.5" />
                </button>
            </div>

            <div className="flex flex-col gap-0.5">
                {albumSongs.map((song, i) => {
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
                            <button
                                onClick={() => handlePlaySong(song)}
                                className="hidden group-hover:block transition-transform active:scale-90"
                                style={{ color: 'var(--text)' }}
                            >
                                {active && isPlaying ? <Pause size={14} fill="currentColor"/> : <Play size={14} fill="currentColor"/>}
                            </button>
                        </div>
                    )
                })}
            </div>

            {albumSongs.length === 0 && (
                <p className="text-center py-12 text-sm opacity-40">В цьому альбомі поки немає треків.</p>
            )}
        </div>
    )
}