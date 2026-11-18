import { useSearchParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Disc, Music } from 'lucide-react'
import { useGlobalSearchQuery } from '../services/search/searchApi'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
    playSong,
    togglePlay,
    selectCurrentSong,
    selectIsPlaying,
} from '../store/slices/playerSlice'
import type { ISong } from '../types/ISong'

export default function SearchPage() {
    const { t } = useTranslation()
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

    if (!query)
        return (
            <div className="w-full">
                <h1 className="text-3xl font-extrabold mb-2 text-white">
                    {t('catalog.searchTitle')}
                </h1>
                <p className="text-sonora-muted">{t('catalog.searchEnterQuery')}</p>
            </div>
        )

    if (isLoading)
        return (
            <div className="flex items-center justify-center h-48">
                <p className="text-sonora-muted">{t('catalog.searching')}</p>
            </div>
        )

    const hasResults =
        data && (data.songs.length > 0 || data.artists.length > 0 || data.albums.length > 0)

    return (
        <div className="w-full">
            <h1 className="text-3xl font-extrabold mb-1 text-white">
                {t('catalog.searchResults')}
            </h1>
            <p className="text-sm mb-8 text-sonora-muted">
                {t('catalog.searchForQuery')} <span className="text-sonora-light">"{query}"</span>
            </p>

            {!hasResults && (
                <div className="rounded-xl p-6 text-center bg-sonora-panel border border-white/10">
                    <p className="text-2xl mb-2">🔍</p>
                    <p className="text-sonora-lavender">{t('catalog.nothingFound')}</p>
                </div>
            )}

            {data && data.songs.length > 0 && (
                <section className="mb-8">
                    <h2 className="text-lg font-bold mb-3 text-white">
                        {t('catalog.songsTitle')}{' '}
                        <span className="text-sm font-normal text-sonora-muted">
                            ({data.songs.length})
                        </span>
                    </h2>
                    <div className="flex flex-col gap-1">
                        {data.songs.map((song, i) => {
                            const active = currentSong?.id === song.id
                            return (
                                <div
                                    key={song.id}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group cursor-pointer ${
                                        active ? 'bg-sonora-warm/50' : 'bg-transparent hover:bg-sonora-warm/30'
                                    }`}
                                    onClick={() => handlePlay(song, data.songs)}
                                >
                                    <div className="w-6 text-center shrink-0">
                                        <span
                                            className={`text-xs group-hover:hidden ${
                                                active ? 'text-sonora-light' : 'text-sonora-muted'
                                            }`}
                                        >
                                            {active && isPlaying ? '♫' : i + 1}
                                        </span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handlePlay(song, data.songs)
                                            }}
                                            className="hidden group-hover:block text-sm text-white"
                                        >
                                            {active && isPlaying ? '⏸' : '▶'}
                                        </button>
                                    </div>
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-white bg-sonora-warm">
                                        <Music size={18} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p
                                            className={`text-sm font-medium truncate ${
                                                active ? 'text-sonora-light' : 'text-white'
                                            }`}
                                        >
                                            {song.name}
                                        </p>
                                        <p className="text-xs truncate text-sonora-muted">
                                            {song.artist_name ?? '—'}
                                        </p>
                                    </div>
                                    <p className="hidden sm:block text-xs text-sonora-muted">
                                        {song.album_title ?? '—'}
                                    </p>
                                </div>
                            )
                        })}
                    </div>
                </section>
            )}

            {data && data.artists.length > 0 && (
                <section className="mb-8">
                    <h2 className="text-lg font-bold mb-3 text-white">
                        {t('catalog.artistsTitle')}{' '}
                        <span className="text-sm font-normal text-sonora-muted">
                            ({data.artists.length})
                        </span>
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
                        {data.artists.map((artist) => (
                            <Link
                                key={artist.id}
                                to={`/artists/${artist.id}`}
                                className="flex flex-col items-start gap-2 transition-all group"
                            >
                                <div className="w-full aspect-square rounded-full flex items-center justify-center text-4xl font-black text-white shadow-md transition-transform group-hover:scale-105 bg-linear-to-br from-sonora-purple to-sonora-pink">
                                    {artist.name[0]?.toUpperCase() ?? '?'}
                                </div>
                                <p className="text-base font-bold truncate w-full text-white">
                                    {artist.name}
                                </p>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {data && data.albums.length > 0 && (
                <section className="mb-8">
                    <h2 className="text-lg font-bold mb-3 text-white">
                        {t('catalog.albumsTitle')}{' '}
                        <span className="text-sm font-normal text-sonora-muted">
                            ({data.albums.length})
                        </span>
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
                        {data.albums.map((album) => (
                            <Link
                                key={album.id}
                                to={`/albums/${album.id}`}
                                className="flex flex-col gap-2 transition-all group"
                            >
                                <div className="w-full aspect-square rounded-lg flex items-center justify-center shadow-md transition-transform group-hover:scale-105 bg-linear-to-br from-sonora-purple to-sonora-light">
                                    <Disc size={44} className="text-white/80" />
                                </div>
                                <p className="text-base font-bold truncate text-white">
                                    {album.title}
                                </p>
                                <p className="text-xs text-sonora-muted">
                                    {album.releaseYear}
                                </p>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </div>
    )
}
