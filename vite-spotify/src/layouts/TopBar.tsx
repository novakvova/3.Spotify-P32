import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { logout, selectCurrentUser, selectIsAuthenticated } from '../store/slices/authSlice'
import { toggleLanguage } from '../store/slices/languageSlice'
import { playSong, togglePlay, selectCurrentSong, selectIsPlaying } from '../store/slices/playerSlice'
import { useGlobalSearchQuery } from '../services/search/searchApi'
import { useGetSongsQuery } from '../services/songs/songsApi'
import { useGetAlbumsQuery } from '../services/albums/albumsApi'
import { useGetArtistsQuery } from '../services/artists/artistsApi'
import type { ISong } from '../types/ISong'
import { X, LogOut, Music, Disc, Play, Pause } from 'lucide-react'

import imgLogoCircle from '../assets/player/logo-circle.png'
import imgHome from '../assets/player/home.svg'
import imgSearchGlass from '../assets/player/search-glass.svg'
import imgDividerLine from '../assets/player/divider-line.svg'
import imgBrowseMenu from '../assets/player/browse-menu.svg'
import imgBell from '../assets/player/bell.svg'
import imgFriendsGroup from '../assets/player/friends-group.svg'
import imgAvatarCircle from '../assets/player/avatar-circle.svg'

export default function TopBar() {
    const { t } = useTranslation()
    const [query, setQuery] = useState('')
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const searchWrapperRef = useRef<HTMLDivElement>(null)
    const navigate = useNavigate()
    const location = useLocation()

    const dispatch = useAppDispatch()
    const isAuth = useAppSelector(selectIsAuthenticated)
    const user = useAppSelector(selectCurrentUser)
    const currentSong = useAppSelector(selectCurrentSong)
    const isPlaying = useAppSelector(selectIsPlaying)

    const trimmedQuery = query.trim()
    const qLower = trimmedQuery.toLowerCase()

    const { data: globalSearchData, isFetching: isSearching } = useGlobalSearchQuery(trimmedQuery, {
        skip: trimmedQuery.length < 1,
    })
    const { data: cachedSongsPage } = useGetSongsQuery({ page: 0, size: 50 })
    const { data: cachedAlbums } = useGetAlbumsQuery()
    const { data: cachedArtists } = useGetArtistsQuery()

    const suggestedSongs =
        globalSearchData?.songs && globalSearchData.songs.length > 0
            ? globalSearchData.songs.slice(0, 4)
            : (cachedSongsPage?.content ?? [])
                  .filter(
                      (s) =>
                          qLower.length > 0 &&
                          (s.name.toLowerCase().includes(qLower) ||
                              (s.artist_name ?? '').toLowerCase().includes(qLower))
                  )
                  .slice(0, 4)

    const suggestedArtists =
        globalSearchData?.artists && globalSearchData.artists.length > 0
            ? globalSearchData.artists.slice(0, 3)
            : (cachedArtists ?? [])
                  .filter((a) => qLower.length > 0 && a.name.toLowerCase().includes(qLower))
                  .slice(0, 3)

    const suggestedAlbums =
        globalSearchData?.albums && globalSearchData.albums.length > 0
            ? globalSearchData.albums.slice(0, 3)
            : (cachedAlbums ?? [])
                  .filter((al) => qLower.length > 0 && al.title.toLowerCase().includes(qLower))
                  .slice(0, 3)

    const hasSuggestions =
        suggestedSongs.length > 0 || suggestedArtists.length > 0 || suggestedAlbums.length > 0

    const displayName = user?.fullName || user?.username || user?.email || 'L'
    const userInitial = displayName.charAt(0).toUpperCase()

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target as Node)) {
                setIsDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (!trimmedQuery) return
        setIsDropdownOpen(false)

        if (location.pathname === '/songs') {
            navigate(`/songs?search=${encodeURIComponent(trimmedQuery)}`)
        } else if (location.pathname === '/artists') {
            navigate(`/artists?search=${encodeURIComponent(trimmedQuery)}`)
        } else if (location.pathname === '/albums') {
            navigate(`/albums?search=${encodeURIComponent(trimmedQuery)}`)
        } else {
            navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`)
        }
    }

    useEffect(() => {
        const searchParam = new URLSearchParams(location.search).get('search')
        const queryParam = new URLSearchParams(location.search).get('q')
        setQuery(searchParam || queryParam || '')
    }, [location])

    const handleClearSearch = () => {
        setQuery('')
        setIsDropdownOpen(false)
        if (location.pathname === '/songs') {
            navigate('/songs')
        } else if (location.pathname === '/artists') {
            navigate('/artists')
        } else if (location.pathname === '/albums') {
            navigate('/albums')
        } else if (location.pathname === '/search') {
            navigate('/player')
        }
    }

    const handlePlaySuggestedSong = (song: ISong) => {
        if (currentSong?.id === song.id) {
            dispatch(togglePlay())
        } else {
            dispatch(playSong({ song, queue: suggestedSongs }))
        }
    }

    return (
        <header className="w-full h-16 sm:h-20 bg-sonora-dark font-inter flex items-center justify-between px-3 sm:px-5 gap-2 sm:gap-4 shrink-0 select-none relative z-50">
            <Link to="/player" className="relative shrink-0 block w-9 h-9 sm:w-12 sm:h-12">
                <img
                    alt="Sonora"
                    className="w-full h-full object-cover block"
                    src={imgLogoCircle}
                />
            </Link>

            <div className="flex items-center justify-center flex-1 min-w-0 max-w-2xl mx-1 sm:mx-4 gap-2.5">
                <Link
                    to="/player"
                    className="hidden sm:flex w-12 h-12 rounded-full border border-solid border-white items-center justify-center p-3 shrink-0 cursor-pointer hover:opacity-85 transition-opacity"
                    title={t('webPlayer.home')}
                >
                    <div className="relative shrink-0 w-5 h-5">
                        <img alt="" className="block w-full h-full" src={imgHome} />
                    </div>
                </Link>

                <div ref={searchWrapperRef} className="relative flex-1 min-w-0 max-w-lg">
                    <form
                        onSubmit={handleSearch}
                        className="w-full h-10 sm:h-14 rounded-full border border-solid border-white bg-sonora-dark flex items-center justify-center overflow-hidden px-3 sm:px-5 py-2 sm:py-3.5 gap-2 sm:gap-3.5"
                    >
                        <button
                            type="submit"
                            className="relative shrink-0 w-4 h-4 sm:w-5 sm:h-5 cursor-pointer hover:opacity-80 transition-opacity"
                            title={t('catalog.searchBtn')}
                        >
                            <img alt="" className="block w-full h-full" src={imgSearchGlass} />
                        </button>

                        <input
                            type="text"
                            value={query}
                            onFocus={() => setIsDropdownOpen(true)}
                            onChange={(e) => {
                                setQuery(e.target.value)
                                setIsDropdownOpen(true)
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Escape') setIsDropdownOpen(false)
                            }}
                            placeholder={t('webPlayer.searchPlaceholder')}
                            className="flex-1 bg-transparent outline-none font-semibold text-xs sm:text-base leading-6 text-white placeholder:text-white min-w-0"
                        />

                        {query && (
                            <button
                                type="button"
                                onClick={handleClearSearch}
                                className="p-1 rounded-full opacity-70 hover:opacity-100 hover:bg-white/10 transition-all text-white cursor-pointer shrink-0"
                            >
                                <X size={16} strokeWidth={2.5} />
                            </button>
                        )}

                        <div className="hidden sm:flex items-center justify-center shrink-0 h-6">
                            <div className="rotate-90 w-6 h-0.5">
                                <img alt="" className="block w-full h-full" src={imgDividerLine} />
                            </div>
                        </div>

                        <Link
                            to="/genres"
                            onClick={() => setIsDropdownOpen(false)}
                            className="hidden sm:block relative shrink-0 w-6 h-5 cursor-pointer hover:opacity-80 transition-opacity"
                            title={t('webPlayer.browseGenres')}
                        >
                            <img alt="" className="block w-full h-full" src={imgBrowseMenu} />
                        </Link>
                    </form>

                    {isDropdownOpen && trimmedQuery.length >= 1 && (
                        <div className="absolute left-0 right-0 mt-2 max-h-96 p-3 rounded-2xl bg-sonora-dark shadow-2xl overflow-y-auto z-50 border border-white/20">
                            {isSearching && !hasSuggestions && (
                                <p className="text-sm text-white/70 px-3 py-3">
                                    {t('catalog.searching')}
                                </p>
                            )}

                            {!isSearching && !hasSuggestions && (
                                <p className="text-sm text-white/70 px-3 py-3">
                                    {t('catalog.nothingFound')}
                                </p>
                            )}

                            {suggestedSongs.length > 0 && (
                                <div className="mb-3">
                                    <p className="text-xs font-bold uppercase tracking-wider text-white/60 px-2.5 mb-1.5">
                                        {t('catalog.songsTitle')}
                                    </p>
                                    {suggestedSongs.map((song) => {
                                        const active = currentSong?.id === song.id
                                        return (
                                            <button
                                                key={`sug-song-${song.id}`}
                                                type="button"
                                                onClick={() => handlePlaySuggestedSong(song)}
                                                className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl hover:bg-white/10 transition-colors text-left cursor-pointer"
                                            >
                                                <div
                                                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-white ${
                                                        active ? 'bg-sonora-light' : 'bg-sonora-warm'
                                                    }`}
                                                >
                                                    {active && isPlaying ? (
                                                        <Pause size={16} fill="currentColor" />
                                                    ) : active ? (
                                                        <Play size={16} fill="currentColor" />
                                                    ) : (
                                                        <Music size={16} />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p
                                                        className={`text-sm font-semibold truncate ${
                                                            active ? 'text-sonora-light' : 'text-white'
                                                        }`}
                                                    >
                                                        {song.name}
                                                    </p>
                                                    <p className="text-xs text-white/70 truncate">
                                                        {song.artist_name ?? '—'}
                                                    </p>
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>
                            )}

                            {suggestedArtists.length > 0 && (
                                <div className="mb-3">
                                    <p className="text-xs font-bold uppercase tracking-wider text-white/60 px-2.5 mb-1.5">
                                        {t('catalog.artistsTitle')}
                                    </p>
                                    {suggestedArtists.map((artist) => (
                                        <Link
                                            key={`sug-artist-${artist.id}`}
                                            to={`/artists/${artist.id}`}
                                            onClick={() => setIsDropdownOpen(false)}
                                            className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl hover:bg-white/10 transition-colors"
                                        >
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sonora-purple to-sonora-pink flex items-center justify-center shrink-0 font-bold text-sm text-white">
                                                {artist.name[0]?.toUpperCase() ?? '?'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-white truncate">
                                                    {artist.name}
                                                </p>
                                                <p className="text-xs text-white/70 truncate">
                                                    {t('webPlayer.artistRole')}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}

                            {suggestedAlbums.length > 0 && (
                                <div className="mb-2">
                                    <p className="text-xs font-bold uppercase tracking-wider text-white/60 px-2.5 mb-1.5">
                                        {t('catalog.albumsTitle')}
                                    </p>
                                    {suggestedAlbums.map((album) => (
                                        <Link
                                            key={`sug-album-${album.id}`}
                                            to={`/albums/${album.id}`}
                                            onClick={() => setIsDropdownOpen(false)}
                                            className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl hover:bg-white/10 transition-colors"
                                        >
                                            <div className="w-9 h-9 rounded-lg bg-sonora-warm flex items-center justify-center shrink-0 text-white">
                                                <Disc size={16} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-white truncate">
                                                    {album.title}
                                                </p>
                                                <p className="text-xs text-white/70 truncate">
                                                    {album.releaseYear}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={handleSearch}
                                className="w-full mt-1 py-2 px-3 rounded-xl bg-sonora-warm text-xs font-bold text-center text-white transition-colors hover:opacity-90 cursor-pointer"
                            >
                                {t('catalog.searchResults')}: &quot;{trimmedQuery}&quot; →
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center shrink-0 gap-2.5 sm:gap-5">
                <button
                    type="button"
                    onClick={() => dispatch(toggleLanguage())}
                    className="text-xs sm:text-sm font-semibold text-white cursor-pointer hover:opacity-80 transition-opacity"
                >
                    {t('header.langShort')}
                </button>

                {isAuth ? (
                    <>
                        <button
                            type="button"
                            className="hidden sm:block relative shrink-0 w-5 h-5 cursor-pointer hover:opacity-80 transition-opacity"
                            title={t('webPlayer.notifications')}
                        >
                            <img alt="" className="block w-full h-full" src={imgBell} />
                        </button>

                        <Link
                            to="/community"
                            className="hidden sm:block relative shrink-0 w-5 h-5 cursor-pointer hover:opacity-80 transition-opacity"
                            title={t('webPlayer.community')}
                        >
                            <img alt="" className="block w-full h-full" src={imgFriendsGroup} />
                        </Link>

                        <Link
                            to="/me"
                            className="relative w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                            title={t('webPlayer.profile')}
                        >
                            <img alt="" className="absolute inset-0 block w-full h-full" src={imgAvatarCircle} />
                            <span className="relative z-10 font-bold text-base sm:text-xl leading-none text-white text-center">
                                {userInitial}
                            </span>
                        </Link>

                        <button
                            type="button"
                            onClick={() => dispatch(logout())}
                            className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                            title={t('profile.logOut')}
                        >
                            <LogOut size={18} />
                        </button>
                    </>
                ) : (
                    <>
                        <Link
                            to="/register"
                            className="font-semibold text-white text-xs sm:text-base hover:opacity-80 transition-opacity whitespace-nowrap"
                        >
                            {t('header.signUp')}
                        </Link>

                        <Link
                            to="/login"
                            className="font-bold text-xs sm:text-base bg-white text-sonora-dark flex items-center justify-center px-3 sm:px-6 py-1.5 sm:py-2 rounded-full hover:scale-105 transition-transform whitespace-nowrap"
                        >
                            {t('header.logIn')}
                        </Link>
                    </>
                )}
            </div>
        </header>
    )
}
