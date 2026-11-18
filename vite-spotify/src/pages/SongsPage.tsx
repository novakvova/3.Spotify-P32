import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useGetSongsQuery, useSearchSongsQuery } from '../services/songs/songsApi'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { playSong, togglePlay, selectCurrentSong, selectIsPlaying } from '../store/slices/playerSlice'
import type { ISong } from '../types/ISong'
import { useEffect, useState } from 'react'

export default function SongsPage() {
    const { t } = useTranslation()
    const dispatch = useAppDispatch()
    const currentSong = useAppSelector(selectCurrentSong)
    const isPlaying = useAppSelector(selectIsPlaying)

    const [page, setPage] = useState(0)

    const [searchParams] = useSearchParams()
    const search = searchParams.get('search') ?? ''
    const genre = searchParams.get('genre') ? Number(searchParams.get('genre')) : undefined

    const { data: pageData, isLoading: isPageLoading } = useGetSongsQuery(
        { page, size: 20, genre },
        { skip: !!search }
    )
    const { data: searchData, isLoading: isSearchLoading } = useSearchSongsQuery(
        search,
        { skip: !search }
    )
    const songs = search ? (searchData ?? []) : (pageData?.content ?? [])
    const isLoading = search ? isSearchLoading : isPageLoading
    useEffect(() => {
        setPage(0)
    }, [search, genre])

    const handlePlay = (song: ISong) => {
        if (currentSong?.id === song.id) dispatch(togglePlay())
        else dispatch(playSong({ song, queue: songs }))
    }

    if (isLoading)
        return (
            <div className="flex items-center justify-center h-48">
                <p className="text-sonora-muted">{t('catalog.loading')}</p>
            </div>
        )

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <h1 className="text-3xl font-extrabold text-white">
                    {search ? t('catalog.resultsFor', { search }) : t('catalog.songsTitle')}
                </h1>
            </div>

            <div className="flex items-center gap-4 px-4 pb-2 mb-1 text-xs font-semibold uppercase tracking-wider border-b border-white/10 text-sonora-muted">
                <span className="w-10 shrink-0 text-center">#</span>
                <span className="flex-1 min-w-0">{t('catalog.colTitle')}</span>
                <span className="w-40 shrink-0 hidden sm:block">{t('catalog.colAlbum')}</span>
                <span className="w-36 shrink-0 hidden md:block">{t('catalog.colGenres')}</span>
            </div>

            <div className="flex flex-col">
                {songs.map((song, i) => {
                    const active = currentSong?.id === song.id
                    return (
                        <div
                            key={song.id}
                            className={`flex items-center gap-4 px-4 py-3 rounded-lg group transition-colors cursor-default ${
                                active ? 'bg-sonora-warm/50' : 'bg-transparent hover:bg-sonora-warm/30'
                            }`}
                            onDoubleClick={() => handlePlay(song)}
                        >
                            <div className="w-10 shrink-0 flex justify-center">
                                <button
                                    onClick={() => handlePlay(song)}
                                    className={`w-7 h-7 flex items-center justify-center rounded text-sm ${
                                        active ? 'text-sonora-light' : 'text-sonora-lavender'
                                    }`}
                                >
                                    {active && isPlaying ? (
                                        '⏸'
                                    ) : active ? (
                                        '▶'
                                    ) : (
                                        <>
                                            <span className="group-hover:hidden text-xs text-sonora-muted">{i + 1}</span>
                                            <span className="hidden group-hover:block">▶</span>
                                        </>
                                    )}
                                </button>
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

                            <p className="w-40 shrink-0 hidden sm:block text-sm truncate text-sonora-muted">
                                {song.album_title ?? '—'}
                            </p>

                            <div className="w-36 shrink-0 hidden md:flex gap-1 flex-wrap">
                                {song.genres_names?.slice(0, 2).map((g) => (
                                    <span
                                        key={g}
                                        className="text-xs px-2 py-0.5 rounded-full bg-sonora-dark text-sonora-lavender"
                                    >
                                        {g}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )
                })}
                {!search && pageData && pageData.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-4 mt-6">
                        <button
                            disabled={pageData.first}
                            onClick={() => setPage((p) => p - 1)}
                            className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-30 transition-all hover:scale-105 bg-sonora-panel text-white border border-white/10"
                        >
                            {t('catalog.prev')}
                        </button>
                        <span className="text-sm text-sonora-muted">
                            {pageData.number + 1} / {pageData.totalPages}
                        </span>
                        <button
                            disabled={pageData.last}
                            onClick={() => setPage((p) => p + 1)}
                            className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-30 transition-all hover:scale-105 bg-sonora-panel text-white border border-white/10"
                        >
                            {t('catalog.next')}
                        </button>
                    </div>
                )}
            </div>

            {songs.length === 0 && (
                <p className="text-center py-12 text-sonora-muted">
                    {t('catalog.nothingFound')}
                </p>
            )}
        </div>
    )
}
