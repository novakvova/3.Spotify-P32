import { Link, NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Home, Music, Layers, Mic2, Disc } from 'lucide-react'
import { useGetAlbumsQuery } from '../services/albums/albumsApi'
import { useGetArtistsQuery } from '../services/artists/artistsApi'

import imgLibrary from '../assets/player/library.svg'

const NAV_ITEMS = [
    { to: '/player', labelKey: 'webPlayer.home', icon: Home },
    { to: '/songs', labelKey: 'catalog.songsTitle', icon: Music },
    { to: '/genres', labelKey: 'catalog.genresTitle', icon: Layers },
    { to: '/artists', labelKey: 'catalog.artistsTitle', icon: Mic2 },
    { to: '/albums', labelKey: 'catalog.albumsTitle', icon: Disc },
]

export default function Sidebar() {
    const { t } = useTranslation()
    const location = useLocation()
    const { data: albums } = useGetAlbumsQuery()
    const { data: artists } = useGetArtistsQuery()

    return (
        <aside className="hidden md:flex flex-col items-center shrink-0 select-none overflow-y-auto w-20 bg-sonora-panel rounded-xl pt-5 pb-6 px-3">
            <div className="flex flex-col items-center w-full gap-4">
                <div
                    className="relative shrink-0 w-6 h-6"
                    title={t('webPlayer.yourLibrary')}
                >
                    <img alt="" className="block w-full h-full" src={imgLibrary} />
                </div>

                <Link
                    to="/songs"
                    className="w-8 h-8 rounded-full bg-sonora-warm flex items-center justify-center shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                    title={t('catalog.songsTitle')}
                >
                    <div className="relative w-3.5 h-3.5">
                        <div className="absolute inset-x-0 top-1.5 h-0.5 bg-white rounded-xs" />
                        <div className="absolute inset-y-0 left-1.5 w-0.5 bg-white rounded-xs" />
                    </div>
                </Link>

                <div className="w-full border-t border-white/15 my-1" />

                {NAV_ITEMS.map(({ to, labelKey, icon: Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        title={t(labelKey)}
                        className={({ isActive }) =>
                            `w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-white transition-all hover:scale-105 ${
                                isActive ? 'bg-sonora-light' : 'bg-sonora-warm'
                            }`
                        }
                    >
                        <Icon size={22} strokeWidth={2.2} />
                    </NavLink>
                ))}

                {artists && artists.length > 0 && (
                    <>
                        <div className="w-full border-t border-white/15 my-1" />
                        {artists.slice(0, 4).map((artist) => {
                            const isActive = location.pathname === `/artists/${artist.id}`
                            return (
                                <Link
                                    key={`artist-${artist.id}`}
                                    to={`/artists/${artist.id}`}
                                    title={artist.name}
                                    className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 font-bold text-lg text-white transition-transform hover:scale-105 ${
                                        isActive
                                            ? 'bg-sonora-light ring-2 ring-white'
                                            : 'bg-gradient-to-br from-sonora-purple to-sonora-pink'
                                    }`}
                                >
                                    {artist.name[0]?.toUpperCase() ?? '?'}
                                </Link>
                            )
                        })}
                    </>
                )}

                {albums && albums.length > 0 && (
                    <>
                        {albums.slice(0, 4).map((album) => {
                            const isActive = location.pathname === `/albums/${album.id}`
                            return (
                                <Link
                                    key={`album-${album.id}`}
                                    to={`/albums/${album.id}`}
                                    title={album.title}
                                    className={`w-12 h-12 rounded-md flex items-center justify-center shrink-0 font-bold text-base text-white transition-transform hover:scale-105 ${
                                        isActive
                                            ? 'bg-sonora-light ring-2 ring-white'
                                            : 'bg-gradient-to-br from-sonora-warm to-sonora-light'
                                    }`}
                                >
                                    <Disc size={22} />
                                </Link>
                            )
                        })}
                    </>
                )}
            </div>
        </aside>
    )
}
