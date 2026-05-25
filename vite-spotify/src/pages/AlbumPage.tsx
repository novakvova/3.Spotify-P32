import { useParams } from 'react-router-dom'
import { useGetAlbumByIdQuery } from '../services/albums/albumsApi'
import { useGetSongsByAlbumQuery } from '../services/songs/songsApi'
import { Disc } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { playSong, togglePlay, selectCurrentSong, selectIsPlaying } from '../store/slices/playerSlice'

export default function AlbumPage() {
    const { id } = useParams()
    const dispatch = useAppDispatch()
    const currentSong = useAppSelector(selectCurrentSong)
    const isPlaying = useAppSelector(selectIsPlaying)

    const { data: album, isLoading: albumLoading } = useGetAlbumByIdQuery(Number(id))
    const { data: songs, isLoading: songsLoading } = useGetSongsByAlbumQuery(Number(id))

    const handlePlay = (song) => {
        if (currentSong?.id === song.id) dispatch(togglePlay())
        else dispatch(playSong({ song, queue: songs }))
    }

    if (albumLoading || songsLoading) return (
        <div className="flex items-center justify-center h-48">
            <p style={{ color: 'var(--text-3)' }}>Завантаження...</p>
        </div>
    )

    return (
        <div className="max-w-4xl pb-10">
            {/* ALBUM HEADER */}
            <div className="flex items-center gap-6 mb-10">
                <div className="w-40 h-40 rounded-lg flex items-center justify-center shadow-lg"
                     style={{ background: 'var(--bg-hover)' }}>
                    <Disc size={80} className="opacity-40" style={{ color: 'var(--text-2)' }} />
                </div>

                <div>
                    <p className="text-sm uppercase font-semibold opacity-60" style={{ color: 'var(--text-3)' }}>
                        Альбом
                    </p>
                    <h1 className="text-4xl font-black mt-1" style={{ color: 'var(--text)' }}>
                        {album.title}
                    </h1>
                    <p className="text-sm mt-2" style={{ color: 'var(--text-2)' }}>
                        Рік випуску: {album.releaseYear}
                    </p>
                </div>
            </div>

            {/* SONG LIST */}
            <div
                className="grid gap-4 px-4 pb-2 mb-1 text-xs font-semibold uppercase tracking-wider border-b"
                style={{ gridTemplateColumns: '40px 1fr 140px', color: 'var(--text-3)', borderColor: 'var(--border)' }}
            >
                <span>#</span>
                <span>Назва</span>
                <span>Жанри</span>
            </div>

            <div className="flex flex-col">
                {songs.map((song, i) => {
                    const active = currentSong?.id === song.id
                    return (
                        <div
                            key={song.id}
                            className="grid gap-4 px-4 py-3 rounded-lg items-center group transition-colors cursor-default"
                            style={{
                                gridTemplateColumns: '40px 1fr 140px',
                                background: active ? 'var(--bg-hover)' : 'transparent',
                            }}
                            onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--bg-hover)' }}
                            onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
                            onDoubleClick={() => handlePlay(song)}
                        >
                            <div className="flex justify-center">
                                <button
                                    onClick={() => handlePlay(song)}
                                    className="w-7 h-7 flex items-center justify-center rounded text-sm"
                                    style={{ color: active ? 'var(--accent)' : 'var(--text-2)' }}
                                >
                                    {active && isPlaying ? '⏸' : active ? '▶' : (
                                        <>
                                            <span className="group-hover:hidden text-xs" style={{ color: 'var(--text-3)' }}>{i + 1}</span>
                                            <span className="hidden group-hover:block">▶</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="min-w-0">
                                <p className="text-sm font-medium truncate" style={{ color: active ? 'var(--accent)' : 'var(--text)' }}>
                                    {song.name}
                                </p>
                                <p className="text-xs truncate" style={{ color: 'var(--text-3)' }}>
                                    {song.artist_name}
                                </p>
                            </div>

                            <div className="flex gap-1 flex-wrap">
                                {song.genres_names?.slice(0, 2).map((g) => (
                                    <span
                                        key={g}
                                        className="text-xs px-2 py-0.5 rounded-full"
                                        style={{ background: 'var(--bg-input)', color: 'var(--text-2)' }}
                                    >
                                        {g}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
