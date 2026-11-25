import { useParams, useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useGetArtistByIdQuery } from '../services/artists/artistsApi'
import { useGetSongsQuery } from '../services/songs/songsApi'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
    playSong,
    togglePlay,
    selectCurrentSong,
    selectIsPlaying,
} from '../store/slices/playerSlice'
import type { ISong } from '../types/ISong'
import { Play, Pause, ArrowLeft, Music, Disc } from 'lucide-react'
import { useGetAlbumsQuery } from '../services/albums/albumsApi.ts'
import MediaImage from '../components/MediaImage'
import { resolveSongCover } from '../utils/format'

export default function ArtistDetailsPage() {
    const { t } = useTranslation()
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const dispatch = useAppDispatch()

    const currentSong = useAppSelector(selectCurrentSong)
    const isPlaying = useAppSelector(selectIsPlaying)

    const { data: artist, isLoading: isArtistLoading } = useGetArtistByIdQuery(Number(id))
    const { data: songsData, isLoading: isSongsLoading } = useGetSongsQuery({ page: 0, size: 100 })
    const { data: albumsData, isLoading: isAlbumsLoading } = useGetAlbumsQuery()

    const artistSongs = songsData?.content
        ? songsData.content.filter(
              (song: ISong) => song.artist_name?.toLowerCase() === artist?.name?.toLowerCase()
          )
        : []

    const artistAlbums = albumsData
        ? albumsData.filter((album) => album.artistId === Number(id))
        : []

    const handlePlaySong = (song: ISong) => {
        if (currentSong?.id === song.id) dispatch(togglePlay())
        else dispatch(playSong({ song, queue: artistSongs }))
    }

    if (isArtistLoading || isSongsLoading || isAlbumsLoading)
        return (
            <div className="flex items-center justify-center h-48">
                <p className="animate-pulse text-sm text-sonora-muted">
                    {t('catalog.artistLoading')}
                </p>
            </div>
        )

    if (!artist) return <p className="text-center py-12 text-sm opacity-60 text-white">{t('catalog.artistNotFound')}</p>

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
                    src={artist.imageUrl}
                    alt={artist.name}
                    className="w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden shadow-xl flex items-center justify-center shrink-0 text-white font-black text-5xl bg-linear-to-br from-sonora-purple to-sonora-pink"
                    fallback={<span>{artist.name[0]?.toUpperCase() ?? '?'}</span>}
                />
                <div className="text-center md:text-left min-w-0">
                    <p className="text-xs font-black uppercase tracking-widest opacity-60 text-white">
                        {t('catalog.artistBadge')}
                    </p>
                    <h1 className="text-3xl md:text-5xl font-black tracking-tight my-1 truncate text-white">
                        {artist.name}
                    </h1>
                    <p className="text-xs font-medium opacity-60 text-sonora-muted">
                        {t('catalog.artistBirthYear', {
                            year: artist.birthDate ? new Date(artist.birthDate).getFullYear() : '—',
                        })}
                    </p>
                </div>
            </div>

            {artistAlbums.length > 0 && (
                <section className="mb-10">
                    <h2 className="text-xl font-bold mb-4 tracking-tight text-white">
                        {t('catalog.artistDiscography')}
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
                        {artistAlbums.map((album) => (
                            <Link
                                key={album.id}
                                to={`/albums/${album.id}`}
                                className="flex flex-col gap-2 transition-all group"
                            >
                                <MediaImage
                                    src={album.coverUrl}
                                    alt={album.title}
                                    className="w-full aspect-square rounded-lg overflow-hidden flex items-center justify-center shadow-md transition-transform group-hover:scale-105 bg-linear-to-br from-sonora-purple to-sonora-light"
                                    fallback={<Disc size={44} className="text-white/80" />}
                                />
                                <p className="font-bold text-sm truncate transition-colors text-white">
                                    {album.title}
                                </p>
                                <p className="text-xs opacity-60 text-sonora-muted">
                                    {t('catalog.yearSuffix', { year: album.releaseYear })}
                                </p>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            <section>
                <h2 className="text-xl font-bold mb-4 tracking-tight text-white">
                    {t('catalog.artistPopularTracks')}
                </h2>
                <div className="flex flex-col gap-0.5">
                    {artistSongs.map((song, i) => {
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
                                    src={resolveSongCover(song, albumsData)}
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
                                        {song.album_title ?? t('catalog.artistSingle')}
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
            </section>

            {artistSongs.length === 0 && (
                <p className="text-center py-12 text-sm opacity-40 text-white">{t('catalog.artistNoTracks')}</p>
            )}
        </div>
    )
}
