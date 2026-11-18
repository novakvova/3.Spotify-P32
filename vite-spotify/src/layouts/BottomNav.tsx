import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Home, Music, Layers, Mic2, Disc } from 'lucide-react'

export default function BottomNav() {
    const { t } = useTranslation()
    return (
        <nav className="md:hidden fixed bottom-0 left-0 w-full h-16 bg-sonora-dark border-t border-white/15 flex items-center justify-around z-50 px-1">
            <NavLink to="/player" end className={({ isActive }) => `flex flex-col items-center gap-1 text-xs flex-1 ${isActive ? 'text-sonora-light' : 'text-white/80'}`}>
                <Home size={20} />
                <span className="truncate">{t('webPlayer.home')}</span>
            </NavLink>
            <NavLink to="/songs" className={({ isActive }) => `flex flex-col items-center gap-1 text-xs flex-1 ${isActive ? 'text-sonora-light' : 'text-white/80'}`}>
                <Music size={20} />
                <span className="truncate">{t('catalog.songsTitle')}</span>
            </NavLink>
            <NavLink to="/genres" className={({ isActive }) => `flex flex-col items-center gap-1 text-xs flex-1 ${isActive ? 'text-sonora-light' : 'text-white/80'}`}>
                <Layers size={20} />
                <span className="truncate">{t('catalog.genresTitle')}</span>
            </NavLink>
            <NavLink to="/artists" className={({ isActive }) => `flex flex-col items-center gap-1 text-xs flex-1 ${isActive ? 'text-sonora-light' : 'text-white/80'}`}>
                <Mic2 size={20} />
                <span className="truncate">{t('catalog.artistsNav')}</span>
            </NavLink>
            <NavLink to="/albums" className={({ isActive }) => `flex flex-col items-center gap-1 text-xs flex-1 ${isActive ? 'text-sonora-light' : 'text-white/80'}`}>
                <Disc size={20} />
                <span className="truncate">{t('catalog.albumsTitle')}</span>
            </NavLink>
        </nav>
    )
}
