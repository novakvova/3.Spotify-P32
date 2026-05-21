import { NavLink } from 'react-router-dom'
import { Home, Music, Layers, Mic2, Disc } from 'lucide-react'

export default function BottomNav() {
    return (
        <nav
            className="md:hidden fixed bottom-0 left-0 w-full h-16 flex items-center justify-around border-t z-50 px-1"
            style={{ background: 'var(--sidebar-bg)', borderColor: 'var(--border)' }}
        >
            <NavLink to="/" end className={({ isActive }) => `flex flex-col items-center gap-1 text-[10px] xs:text-xs flex-1 ${isActive ? 'text-[var(--accent)]' : 'text-[var(--text-2)]'}`}>
                <Home size={20} />
                <span className="truncate">Головна</span>
            </NavLink>
            <NavLink to="/songs" className={({ isActive }) => `flex flex-col items-center gap-1 text-[10px] xs:text-xs flex-1 ${isActive ? 'text-[var(--accent)]' : 'text-[var(--text-2)]'}`}>
                <Music size={20} />
                <span className="truncate">Пісні</span>
            </NavLink>
            <NavLink to="/genres" className={({ isActive }) => `flex flex-col items-center gap-1 text-[10px] xs:text-xs flex-1 ${isActive ? 'text-[var(--accent)]' : 'text-[var(--text-2)]'}`}>
                <Layers size={20} />
                <span className="truncate">Жанри</span>
            </NavLink>
            <NavLink to="/artists" className={({ isActive }) => `flex flex-col items-center gap-1 text-[10px] xs:text-xs flex-1 ${isActive ? 'text-[var(--accent)]' : 'text-[var(--text-2)]'}`}>
                <Mic2 size={20} />
                <span className="truncate">Артисти</span>
            </NavLink>
            <NavLink to="/albums" className={({ isActive }) => `flex flex-col items-center gap-1 text-[10px] xs:text-xs flex-1 ${isActive ? 'text-[var(--accent)]' : 'text-[var(--text-2)]'}`}>
                <Disc size={20} />
                <span className="truncate">Альбоми</span>
            </NavLink>
        </nav>
    )
}