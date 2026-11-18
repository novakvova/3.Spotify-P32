import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Play, Pause, Disc, Music, Mic2, Layers } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
    playSong,
    togglePlay,
    selectCurrentSong,
    selectIsPlaying,
} from '../store/slices/playerSlice'
import { useGetAlbumsQuery } from '../services/albums/albumsApi'
import { useGetArtistsQuery } from '../services/artists/artistsApi'
import { useGetSongsQuery } from '../services/songs/songsApi'
import { useGetGenresQuery } from '../services/genres/genresApi'
import type { ISong } from '../types/ISong'

const CARD_GRADIENT_CLASSES = [
    'bg-gradient-to-br from-sonora-purple to-sonora-light',
    'bg-gradient-to-br from-sonora-warm to-sonora-pink',
    'bg-gradient-to-br from-purple-900 to-purple-600',
    'bg-gradient-to-br from-purple-700 to-pink-500',
    'bg-gradient-to-br from-purple-950 to-purple-500',
    'bg-gradient-to-br from-fuchsia-800 to-purple-400',
]

export default function WebPlayerPage() {
    const { t } = useTranslation()
    const dispatch = useAppDispatch()
    const currentSong = useAppSelector(selectCurrentSong)
    const isPlaying = useAppSelector(selectIsPlaying)

    const [activeTab, setActiveTab] = useState<'all' | 'music' | 'podcasts' | 'audiobooks'>('all')

    const {
        data: albumsData,
        isLoading: isAlbumsLoading,
        isError: isAlbumsError,
    } = useGetAlbumsQuery()
    const {
        data: artistsData,
        isLoading: isArtistsLoading,
        isError: isArtistsError,
    } = useGetArtistsQuery()
    const {
        data: songsPage,
        isLoading: isSongsLoading,
        isError: isSongsError,
    } = useGetSongsQuery({ page: 0, size: 50 })
    const { data: genresData } = useGetGenresQuery()

    const songs = songsPage?.content ?? []
    const albums = albumsData ?? []
    const artists = artistsData ?? []
    const genres = genresData ?? []

    const isLoading = isAlbumsLoading || isArtistsLoading || isSongsLoading
    const hasAuthError =
        (isAlbumsError || isArtistsError || isSongsError) &&
        albums.length === 0 &&
        songs.length === 0 &&
        artists.length === 0

    const TABS: Array<{
        key: 'all' | 'music' | 'podcasts' | 'audiobooks'
        label: string
    }> = [
        { key: 'all', label: t('webPlayer.tabs.all') },
        { key: 'music', label: t('catalog.songsTitle') },
        { key: 'podcasts', label: t('catalog.albumsTitle') },
        { key: 'audiobooks', label: t('catalog.artistsTitle') },
    ]

    const handlePlaySong = (song: ISong, queue: ISong[]) => {
        if (currentSong?.id === song.id) {
            dispatch(togglePlay())
        } else {
            dispatch(playSong({ song, queue }))
        }
    }

    const handlePlayAlbum = (e: React.MouseEvent, albumTitle: string) => {
        e.preventDefault()
        e.stopPropagation()
        const albumSongs = songs.filter(
            (s) => s.album_title?.toLowerCase() === albumTitle.toLowerCase()
        )
        const targetQueue = albumSongs.length > 0 ? albumSongs : songs
        if (targetQueue[0]) {
            handlePlaySong(targetQueue[0], targetQueue)
        }
    }

    const getArtistNameForAlbum = (artistId: number, albumTitle: string) => {
        const foundArtist = artists.find((a) => a.id === artistId)
        if (foundArtist) return foundArtist.name
        const matchingSong = songs.find(
            (s) => s.album_title?.toLowerCase() === albumTitle.toLowerCase()
        )
        return matchingSong?.artist_name ?? t('catalog.unknownArtist')
    }

    const featuredArtist = artists[0]

    return (
        <div className="w-full flex flex-col">
            <div className="flex items-center flex-wrap gap-2.5">
                {TABS.map((tab) => {
                    const isActive = activeTab === tab.key
                    return (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => setActiveTab(tab.key)}
                            className={`h-9 rounded-full flex items-center justify-center text-white text-sm leading-5 font-normal cursor-pointer transition-colors px-5 ${
                                isActive ? 'bg-sonora-light' : 'bg-sonora-warm'
                            }`}
                        >
                            {tab.label}
                        </button>
                    )
                })}
            </div>

            {isLoading && (
                <div className="flex items-center justify-center py-20">
                    <p className="text-white/80 text-base animate-pulse">{t('catalog.loading')}</p>
                </div>
            )}

            {!isLoading && hasAuthError && (
                <div className="flex flex-col items-center justify-center text-center py-16 px-6 rounded-xl my-8 bg-white/5 border border-white/15 gap-4">
                    <p className="text-lg font-bold text-white">
                        {t('catalog.albumsError')}
                    </p>
                    <Link
                        to="/login"
                        className="px-8 py-3 rounded-full bg-sonora-light font-bold text-sm text-white transition-transform hover:scale-105"
                    >
                        {t('header.logIn')}
                    </Link>
                </div>
            )}

            {!isLoading && !hasAuthError && (activeTab === 'all' || activeTab === 'podcasts') && (
                <section className="mt-5">
                    <div className="flex items-center justify-between">
                        <h2 className="font-bold text-xl leading-8 text-white">
                            {t('webPlayer.followedAlbums')}
                        </h2>
                        <Link
                            to="/albums"
                            className="text-sm font-semibold text-white/80 hover:text-white hover:underline"
                        >
                            {t('catalog.albumsTitle')} →
                        </Link>
                    </div>

                    {albums.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 w-full mt-5 gap-5">
                            {(activeTab === 'podcasts' ? albums : albums.slice(0, 6)).map((album, idx) => {
                                const artistName = getArtistNameForAlbum(album.artistId, album.title)
                                const gradientClass = CARD_GRADIENT_CLASSES[idx % CARD_GRADIENT_CLASSES.length]
                                return (
                                    <Link
                                        key={album.id}
                                        to={`/albums/${album.id}`}
                                        className="flex flex-col items-start group cursor-pointer w-full"
                                    >
                                        <div
                                            className={`relative overflow-hidden w-full aspect-square rounded-xl ${gradientClass} flex flex-col items-center justify-center p-4 text-center shadow-md transition-transform duration-200 group-hover:scale-105`}
                                        >
                                            <Disc size={54} className="text-white/80 mb-2 transition-transform duration-500 group-hover:rotate-90" />
                                            <span className="font-bold text-sm text-white line-clamp-2 px-1">
                                                {album.title}
                                            </span>
                                            <span className="text-xs text-white/75 mt-1">
                                                {album.releaseYear}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={(e) => handlePlayAlbum(e, album.title)}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-3 right-3 w-11 h-11 rounded-full bg-sonora-dark text-white flex items-center justify-center shadow-lg cursor-pointer"
                                            >
                                                <Play size={20} fill="currentColor" className="ml-0.5" />
                                            </button>
                                        </div>

                                        <div className="flex flex-col items-start w-full mt-3.5 gap-1">
                                            <p className="font-bold text-base leading-6 text-white truncate w-full">
                                                {album.title}
                                            </p>
                                            <p className="font-normal text-sm leading-5 text-white/85 truncate w-full">
                                                {artistName}
                                            </p>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-white/70 mt-4">{t('catalog.albumsEmpty')}</p>
                    )}
                </section>
            )}

            {!isLoading && !hasAuthError && (activeTab === 'all' || activeTab === 'music') && (
                <section className="mt-8">
                    <div className="flex items-center justify-between">
                        {featuredArtist && activeTab === 'all' ? (
                            <Link
                                to={`/artists/${featuredArtist.id}`}
                                className="flex items-center group gap-4"
                            >
                                <div className="relative shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-sonora-purple to-sonora-pink flex items-center justify-center font-bold text-xl text-white">
                                    {featuredArtist.name[0]?.toUpperCase() ?? '?'}
                                </div>

                                <div className="flex flex-col items-start">
                                    <p className="font-normal text-base leading-6 text-white/90">
                                        {t('webPlayer.similarTo')}
                                    </p>
                                    <p className="font-bold text-xl leading-7 text-white group-hover:underline">
                                        {featuredArtist.name}
                                    </p>
                                </div>
                            </Link>
                        ) : (
                            <h2 className="font-bold text-xl leading-8 text-white">
                                {t('catalog.songsTitle')}
                            </h2>
                        )}

                        <Link
                            to="/songs"
                            className="text-sm font-semibold text-white/80 hover:text-white hover:underline"
                        >
                            {t('catalog.songsTitle')} →
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 w-full mt-6 gap-5">
                        {(activeTab === 'music' ? songs : songs.slice(0, 4)).map((song, idx) => {
                            const isActive = currentSong?.id === song.id
                            const gradientClass = CARD_GRADIENT_CLASSES[(idx + 2) % CARD_GRADIENT_CLASSES.length]
                            return (
                                <div
                                    key={song.id}
                                    onClick={() => handlePlaySong(song, songs)}
                                    className="flex flex-col items-start group cursor-pointer w-full"
                                >
                                    <div
                                        className={`relative overflow-hidden w-full aspect-square rounded-xl ${gradientClass} flex flex-col items-center justify-center p-4 text-center shadow-md transition-transform duration-200 group-hover:scale-105 ${
                                            isActive ? 'ring-2 ring-white' : ''
                                        }`}
                                    >
                                        <Music size={48} className="text-white/85 mb-2" />
                                        <span className="font-bold text-sm text-white line-clamp-2 px-1">
                                            {song.name}
                                        </span>
                                        {song.album_title && (
                                            <span className="text-xs text-white/75 mt-1 truncate max-w-full px-2">
                                                {song.album_title}
                                            </span>
                                        )}
                                        <div
                                            className={`transition-opacity absolute bottom-3 right-3 w-11 h-11 rounded-full bg-sonora-dark text-white flex items-center justify-center shadow-lg ${
                                                isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                            }`}
                                        >
                                            {isActive && isPlaying ? (
                                                <Pause size={20} fill="currentColor" />
                                            ) : (
                                                <Play size={20} fill="currentColor" className="ml-0.5" />
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-start w-full mt-3.5 gap-1">
                                        <p
                                            className={`font-bold text-base leading-6 truncate w-full ${
                                                isActive ? 'text-sonora-pink' : 'text-white'
                                            }`}
                                        >
                                            {song.name}
                                        </p>
                                        <p className="font-normal text-sm leading-5 text-white/85 truncate w-full">
                                            {song.artist_name ?? '—'}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}

                        {activeTab === 'all' &&
                            artists.slice(0, 2).map((artist, idx) => {
                                const gradientClass = CARD_GRADIENT_CLASSES[(idx + 4) % CARD_GRADIENT_CLASSES.length]
                                return (
                                    <Link
                                        key={artist.id}
                                        to={`/artists/${artist.id}`}
                                        className="flex flex-col items-start group cursor-pointer w-full"
                                    >
                                        <div
                                            className={`relative overflow-hidden w-full aspect-square rounded-full ${gradientClass} flex flex-col items-center justify-center shadow-md transition-transform duration-200 group-hover:scale-105`}
                                        >
                                            <span className="font-black text-5xl text-white">
                                                {artist.name[0]?.toUpperCase() ?? '?'}
                                            </span>
                                        </div>

                                        <div className="flex flex-col items-start w-full mt-3.5 gap-1">
                                            <p className="font-bold text-base leading-6 text-white truncate w-full">
                                                {artist.name}
                                            </p>
                                            <p className="font-normal text-sm leading-5 text-white/85 truncate w-full">
                                                {t('webPlayer.artistRole')}
                                            </p>
                                        </div>
                                    </Link>
                                )
                            })}
                    </div>
                </section>
            )}

            {!isLoading && !hasAuthError && (activeTab === 'all' || activeTab === 'audiobooks') && artists.length > 0 && (
                <section className="mt-8">
                    <div className="flex items-center justify-between">
                        <h2 className="font-bold text-xl leading-8 text-white">
                            {t('catalog.artistsTitle')}
                        </h2>
                        <Link
                            to="/artists"
                            className="text-sm font-semibold text-white/80 hover:text-white hover:underline"
                        >
                            {t('catalog.artistsTitle')} →
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 w-full mt-5 gap-5">
                        {artists.map((artist, idx) => {
                            const gradientClass = CARD_GRADIENT_CLASSES[idx % CARD_GRADIENT_CLASSES.length]
                            return (
                                <Link
                                    key={artist.id}
                                    to={`/artists/${artist.id}`}
                                    className="flex flex-col items-start group cursor-pointer w-full"
                                >
                                    <div
                                        className={`relative overflow-hidden w-full aspect-square rounded-full ${gradientClass} flex flex-col items-center justify-center shadow-md transition-transform duration-200 group-hover:scale-105`}
                                    >
                                        <Mic2 size={32} className="text-white/60 mb-1" />
                                        <span className="font-black text-3xl text-white">
                                            {artist.name[0]?.toUpperCase() ?? '?'}
                                        </span>
                                    </div>

                                    <div className="flex flex-col items-start w-full mt-3.5 gap-1">
                                        <p className="font-bold text-base leading-6 text-white truncate w-full">
                                            {artist.name}
                                        </p>
                                        <p className="font-normal text-sm leading-5 text-white/85 truncate w-full">
                                            {t('webPlayer.artistRole')}
                                        </p>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </section>
            )}

            {!isLoading && !hasAuthError && activeTab === 'all' && genres.length > 0 && (
                <section className="mt-8">
                    <div className="flex items-center justify-between">
                        <h2 className="font-bold text-xl leading-8 text-white">
                            {t('catalog.genresTitle')}
                        </h2>
                        <Link
                            to="/genres"
                            className="text-sm font-semibold text-white/80 hover:text-white hover:underline"
                        >
                            {t('catalog.genresTitle')} →
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 w-full mt-4 gap-4">
                        {genres.map((g, idx) => (
                            <Link
                                key={g.id}
                                to={`/genres/${g.id}`}
                                className={`p-4 rounded-xl flex items-center gap-3 transition-transform hover:scale-105 ${
                                    CARD_GRADIENT_CLASSES[idx % CARD_GRADIENT_CLASSES.length]
                                }`}
                            >
                                <Layers size={20} className="text-white shrink-0" />
                                <span className="font-bold text-sm text-white truncate">
                                    {g.name}
                                </span>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </div>
    )
}
