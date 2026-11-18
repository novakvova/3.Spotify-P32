import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useGetGenresQuery } from '../services/genres/genresApi'
import { useGetSongsQuery } from '../services/songs/songsApi'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { playSong, togglePlay, selectCurrentSong, selectIsPlaying } from '../store/slices/playerSlice'
import type { ISong } from '../types/ISong'
import { Play, Pause, ArrowLeft, Layers, Music } from 'lucide-react'

export default function GenreDetailsPage() {
    const { t } = useTranslation()
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const dispatch = useAppDispatch()

    const currentSong = useAppSelector(selectCurrentSong)
    const isPlaying = useAppSelector(selectIsPlaying)

    const { data: genres } = useGetGenresQuery()
    const currentGenre = genres?.find((g) => g.id === Number(id))

    const { data: songsData, isLoading } = useGetSongsQuery({ page: 0, size: 100 })

    const genreSongs = songsData?.content
        ? songsData.content.filter((song: ISong) =>
              song.genres_names?.some((gName) => gName.toLowerCase() === currentGenre?.name?.toLowerCase())
          )
        : []

    const handlePlaySong = (song: ISong) => {
        if (currentSong?.id === song.id) dispatch(togglePlay())
        else dispatch(playSong({ song, queue: genreSongs }))
    }

    if (isLoading)
        return (
            <div className="flex items-center justify-center h-48">
                <p className="animate-pulse text-sm text-sonora-muted">{t('catalog.genreLoading')}</p>
            </div>
        )

    if (!currentGenre) return <p className="text-center py-12 text-sm opacity-60 text-white">{t('catalog.genreNotFound')}</p>

    return (
        <div className="w-full pb-10 select-none">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-xs font-bold mb-6 opacity-80 hover:opacity-100 transition-all text-white"
            >
                <ArrowLeft size={16} /> {t('catalog.back')}
            </button>

            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-8">
                <div className="w-40 h-40 md:w-48 md:h-48 rounded-2xl shadow-xl flex items-center justify-center shrink-0 bg-white/5 border border-white/5 text-sonora-light">
                    <Layers size={54} className="opacity-40" />
                </div>
                <div className="text-center md:text-left min-w-0">
                    <p className="text-xs font-black uppercase tracking-widest opacity-60 text-white">{t('catalog.genreBadge')}</p>
                    <h1 className="text-3xl md:text-5xl font-black tracking-tight my-1 truncate text-white">
                        {currentGenre.name}
                    </h1>
                    <p className="text-xs opacity-70 max-w-xl mt-1 leading-relaxed text-sonora-lavender">
                        {currentGenre.description ?? t('catalog.genreNoDesc')}
                    </p>
                </div>
            </div>

            <h2 className="text-lg font-bold mb-4 tracking-tight text-white">{t('catalog.genreSongsTitle')}</h2>

            <div className="flex flex-col gap-0.5">
                {genreSongs.map((song, i) => {
                    const active = currentSong?.id === song.id
                    return (
                        <div
                            key={song.id}
                            onDoubleClick={() => handlePlaySong(song)}
                            className={`flex items-center gap-4 px-4 py-2.5 rounded-lg group hover:bg-white/5 transition-colors cursor-pointer ${
                                active ? 'bg-sonora-warm/50' : 'bg-transparent'
                            }`}
                        >
                            <span
                                className={`text-xs font-semibold w-5 text-center ${
                                    active ? 'text-sonora-light' : 'text-sonora-muted'
                                }`}
                            >
                                {active && isPlaying ? '♫' : i + 1}
                            </span>
                            <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center shrink-0">
                                <Music size={14} className={active ? 'text-sonora-light' : 'text-sonora-muted'} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p
                                    className={`text-sm font-semibold truncate ${
                                        active ? 'text-sonora-light' : 'text-white'
                                    }`}
                                >
                                    {song.name}
                                </p>
                                <p className="text-xs truncate opacity-60 text-sonora-muted">
                                    {song.artist_name ?? '—'}
                                </p>
                            </div>
                            <button
                                onClick={() => handlePlaySong(song)}
                                className="hidden group-hover:block transition-transform active:scale-90 text-white"
                            >
                                {active && isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                            </button>
                        </div>
                    )
                })}
            </div>

            {genreSongs.length === 0 && (
                <p className="text-center py-12 text-sm opacity-40 text-white">{t('catalog.genreNoSongs')}</p>
            )}
        </div>
    )
}
