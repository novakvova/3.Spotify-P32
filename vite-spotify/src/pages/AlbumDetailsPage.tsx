import { useParams, useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useGetAlbumByIdQuery } from '../services/albums/albumsApi'
import { useGetSongsQuery } from '../services/songs/songsApi'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
    playSong,
    togglePlay,
    selectCurrentSong,
    selectIsPlaying,
} from '../store/slices/playerSlice'
import type { ISong } from '../types/ISong'
import { Play, Pause, ArrowLeft, Disc, Music } from 'lucide-react'
import { useGetArtistByIdQuery } from '../services/artists/artistsApi.ts'
import MediaImage from '../components/MediaImage'

export default function AlbumDetailsPage() {
    const { t } = useTranslation()
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

    const albumSongs = songsData?.content
        ? songsData.content.filter(
              (song: ISong) => song.album_title?.toLowerCase() === album?.title?.toLowerCase()
          )
        : []

    const finalArtistName = artist?.name ?? albumSongs[0]?.artist_name ?? t('catalog.unknownArtist')

    const handlePlayAll = () => {
        if (albumSongs.length > 0) {
            dispatch(playSong({ song: albumSongs[0], queue: albumSongs }))
        }
    }

    const handlePlaySong = (song: ISong) => {
        if (currentSong?.id === song.id) dispatch(togglePlay())
        else dispatch(playSong({ song, queue: albumSongs }))
    }

    if (isAlbumLoading || isSongsLoading || isArtistLoading)
        return (
            <div className="flex items-center justify-center h-48">
                <p className="animate-pulse text-sm text-sonora-muted">
                    {t('catalog.albumLoading')}
                </p>
            </div>
        )

    if (!album) return <p className="text-center py-12 text-sm opacity-60 text-white">{t('catalog.albumNotFound')}</p>

    return (
        <div className="w-full pb-10 select-none">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-xs font-bold mb-6 opacity-80 hover:opacity-100 transition-all cursor-pointer text-white"
            >
                <ArrowLeft size={16} /> {t('catalog.back')}
            </button>

            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-8">
                <MediaImage
                    src={album.coverUrl}
                    alt={album.title}
                    className="w-40 h-40 md:w-48 md:h-48 rounded-xl overflow-hidden shadow-xl flex items-center justify-center shrink-0 bg-linear-to-br from-sonora-purple to-sonora-light"
                    fallback={<Disc size={72} className="text-white/80" />}
                />
                <div className="text-center md:text-left min-w-0">
                    <p className="text-xs font-black uppercase tracking-widest opacity-60 text-white">
                        {t('catalog.albumBadge')}
                    </p>
                    <h1 className="text-3xl md:text-5xl font-black tracking-tight my-1 truncate text-white">
                        {album.title}
                    </h1>
                    <p className="text-sm font-semibold opacity-90 flex items-center justify-center md:justify-start gap-2 text-sonora-lavender">
                        {artist && (
                            <MediaImage
                                src={artist.imageUrl}
                                alt={finalArtistName}
                                className="w-6 h-6 rounded-full overflow-hidden shrink-0 bg-sonora-warm flex items-center justify-center text-xs font-bold text-white"
                                fallback={<span>{finalArtistName[0]?.toUpperCase() ?? '?'}</span>}
                            />
                        )}
                        <Link
                            to={`/artists/${album.artistId}`}
                            className="hover:underline transition-colors font-bold text-sonora-light"
                        >
                            {finalArtistName}
                        </Link>
                        <span className="opacity-40">•</span>
                        <span className="font-normal text-sonora-muted">
                            {album.releaseYear}
                        </span>
                        <span className="opacity-40">•</span>
                        <span className="font-normal text-sonora-muted">
                            {t('catalog.tracksCount', { count: albumSongs.length })}
                        </span>
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={handlePlayAll}
                    disabled={albumSongs.length === 0}
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white bg-sonora-light transition-transform hover:scale-105 active:scale-95 shadow-md disabled:opacity-40 cursor-pointer"
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
                            onClick={() => handlePlaySong(song)}
                            className={`flex items-center gap-4 px-4 py-2.5 rounded-lg group transition-colors cursor-pointer ${
                                active ? 'bg-sonora-warm/50' : 'bg-transparent hover:bg-white/5'
                            }`}
                        >
                            <span
                                className={`text-xs font-semibold w-5 text-center ${
                                    active ? 'text-sonora-light' : 'text-sonora-muted'
                                }`}
                            >
                                {active && isPlaying ? '♫' : i + 1}
                            </span>
                            <MediaImage
                                src={song.coverUrl || album.coverUrl}
                                alt={song.name}
                                className="w-9 h-9 rounded-md overflow-hidden bg-white/10 flex items-center justify-center shrink-0"
                                fallback={
                                    <Music
                                        size={14}
                                        className={active ? 'text-sonora-light' : 'text-sonora-muted'}
                                    />
                                }
                            />
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
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handlePlaySong(song)
                                }}
                                className="hidden group-hover:block transition-transform active:scale-90 text-white"
                            >
                                {active && isPlaying ? (
                                    <Pause size={14} fill="currentColor" />
                                ) : (
                                    <Play size={14} fill="currentColor" />
                                )}
                            </button>
                        </div>
                    )
                })}
            </div>

            {albumSongs.length === 0 && (
                <p className="text-center py-12 text-sm opacity-40 text-white">{t('catalog.albumNoTracks')}</p>
            )}
        </div>
    )
}
