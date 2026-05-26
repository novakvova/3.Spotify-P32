import { useSearchParams, Link } from 'react-router-dom'
import { useGlobalSearchQuery } from '../services/search/searchApi'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { playSong, togglePlay, selectCurrentSong, selectIsPlaying } from '../store/slices/playerSlice'
import type { ISong } from '../types/ISong'

export default function SearchPage() {
    const [searchParams] = useSearchParams()
    const query = searchParams.get('q') ?? ''
    const dispatch = useAppDispatch()
    const currentSong = useAppSelector(selectCurrentSong)
    const isPlaying = useAppSelector(selectIsPlaying)

    const { data, isLoading } = useGlobalSearchQuery(query, {
        skip: query.trim().length < 2,
    })

    const handlePlay = (song: ISong, queue: ISong[]) => {
        if (currentSong?.id === song.id) dispatch(togglePlay())
        else dispatch(playSong({ song, queue }))
    }

    if (!query) return (
        <div className="max-w-4xl">
            <h1 className="text-3xl font-extrabold mb-2" style={{ color: 'var(--text)' }}>Пошук</h1>
            <p style={{ color: 'var(--text-3)' }}>Введіть запит для пошуку</p>
        </div>
    )

    if (isLoading) return (
        <div className="flex items-center justify-center h-48">
            <p style={{ color: 'var(--text-3)' }}>Пошук...</p>
        </div>
    )

    const hasResults = data && (
        data.songs.length > 0 || data.artists.length > 0 || data.albums.length > 0
    )

    return (
        <div className="max-w-4xl">
            <h1 className="text-3xl font-extrabold mb-1" style={{ color: 'var(--text)' }}>
                Результати пошуку
            </h1>
            <p className="text-sm mb-8" style={{ color: 'var(--text-3)' }}>
                За запитом: <span style={{ color: 'var(--accent)' }}>"{query}"</span>
            </p>

            {!hasResults && (
                <div className="rounded-xl p-6 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                    <p className="text-2xl mb-2">🔍</p>
                    <p style={{ color: 'var(--text-2)' }}>Нічого не знайдено</p>
                </div>
            )}

            {data && data.songs.length > 0 && (
                <section className="mb-8">
                    <h2 className="text-lg font-bold mb-3" style={{ color: 'var(--text)' }}>
                        Пісні <span className="text-sm font-normal" style={{ color: 'var(--text-3)' }}>({data.songs.length})</span>
                    </h2>
                    <div className="flex flex-col gap-1">
                        {data.songs.map((song, i) => {
                            const active = currentSong?.id === song.id
                            return (
                                <div
                                    key={song.id}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group cursor-default"
                                    style={{ background: active ? 'var(--bg-hover)' : 'transparent' }}
                                    onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--bg-hover)' }}
                                    onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
                                    onDoubleClick={() => handlePlay(song, data.songs)}
                                >
                                    <div className="w-6 text-center flex-shrink-0">
                    <span className="text-xs group-hover:hidden" style={{ color: active ? 'var(--accent)' : 'var(--text-3)' }}>
                      {active && isPlaying ? '♫' : i + 1}
                    </span>
                                        <button onClick={() => handlePlay(song, data.songs)} className="hidden group-hover:block text-sm" style={{ color: 'var(--text)' }}>
                                            {active && isPlaying ? '⏸' : '▶'}
                                        </button>
                                    </div>
                                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--bg-input)' }}>🎵</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate" style={{ color: active ? 'var(--accent)' : 'var(--text)' }}>{song.name}</p>
                                        <p className="text-xs truncate" style={{ color: 'var(--text-3)' }}>{song.artist_name ?? '—'}</p>
                                    </div>
                                    <p className="hidden sm:block text-xs" style={{ color: 'var(--text-3)' }}>{song.album_title ?? '—'}</p>
                                </div>
                            )
                        })}
                    </div>
                </section>
            )}

            {data && data.artists.length > 0 && (
                <section className="mb-8">
                    <h2 className="text-lg font-bold mb-3" style={{ color: 'var(--text)' }}>
                        Виконавці <span className="text-sm font-normal" style={{ color: 'var(--text-3)' }}>({data.artists.length})</span>
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {data.artists.map(artist => (
                            <Link key={artist.id} to={`/artists/${artist.id}`}
                                  className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all hover:scale-105"
                                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                            >
                                <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold" style={{ background: 'var(--accent)', color: '#000' }}>
                                    {artist.name[0].toUpperCase()}
                                </div>
                                <p className="text-sm font-medium truncate w-full text-center" style={{ color: 'var(--text)' }}>{artist.name}</p>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {data && data.albums.length > 0 && (
                <section className="mb-8">
                    <h2 className="text-lg font-bold mb-3" style={{ color: 'var(--text)' }}>
                        Альбоми <span className="text-sm font-normal" style={{ color: 'var(--text-3)' }}>({data.albums.length})</span>
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {data.albums.map(album => (
                            <Link key={album.id} to={`/albums/${album.id}`}
                                  className="flex flex-col gap-2 p-4 rounded-xl transition-all hover:scale-105"
                                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                            >
                                <div className="w-full aspect-square rounded-lg flex items-center justify-center text-3xl" style={{ background: 'var(--bg-hover)' }}>💿</div>
                                <p className="text-sm font-bold truncate" style={{ color: 'var(--text)' }}>{album.title}</p>
                                <p className="text-xs" style={{ color: 'var(--text-3)' }}>{album.releaseYear}</p>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </div>
    )
}