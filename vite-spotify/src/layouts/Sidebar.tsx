import { useState, useEffect, useRef } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { logout, selectCurrentUser, selectIsAuthenticated } from '../store/slices/authSlice'
import { toggleTheme, selectTheme } from '../store/slices/themeSlice'
import { toggleLanguage, selectLanguage } from '../store/slices/languageSlice'
import {
    Home, Music, Layers, Mic2, Disc,
    Sun, Moon, LogOut,
} from 'lucide-react'
import imgSonoraCircle from '../assets/home/sonoraCircleLogo.png'

const NAV = [
    { to: '/',        label: 'Головна',   icon: Home },
    { to: '/songs',   label: 'Пісні',     icon: Music },
    { to: '/genres',  label: 'Жанри',     icon: Layers },
    { to: '/artists', label: 'Виконавці', icon: Mic2 },
    { to: '/albums',  label: 'Альбоми',   icon: Disc },
]

function hasCustomAvatar(image: string | null | undefined): boolean {
    return !!image && !image.includes('default.jpg')
}

export default function Sidebar() {
    const dispatch = useAppDispatch()
    const isAuth = useAppSelector(selectIsAuthenticated)
    const user = useAppSelector(selectCurrentUser)
    const theme = useAppSelector(selectTheme)
    const lang = useAppSelector(selectLanguage)

    const [width, setWidth] = useState(220)
    const [isResizing, setIsResizing] = useState(false)
    const sidebarRef = useRef<HTMLDivElement>(null)

    const startResizing = (e: React.MouseEvent) => {
        e.preventDefault()
        setIsResizing(true)
    }

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing) return
            let newWidth = e.clientX
            if (newWidth < 180) newWidth = 180
            if (newWidth > 400) newWidth = 400
            setWidth(newWidth)
        }
        const handleMouseUp = () => setIsResizing(false)

        if (isResizing) {
            window.addEventListener('mousemove', handleMouseMove)
            window.addEventListener('mouseup', handleMouseUp)
            document.body.classList.add('cursor-grabbing-active')
        } else {
            document.body.classList.remove('cursor-grabbing-active')
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
            document.body.classList.remove('cursor-grabbing-active')
        }
    }, [isResizing])

    return (
        <aside
            ref={sidebarRef}
            className="hidden md:flex flex-col h-full px-3 py-5 border-r select-none relative group"
            style={{ background: 'var(--sidebar-bg)', borderColor: 'var(--border)', width }}
        >
            <Link to="/" className="flex items-center gap-2.5 px-3 mb-8">
                <img
                    src={imgSonoraCircle}
                    alt="Sonora"
                    className="w-8 h-8 object-contain shrink-0"
                />
                <span className="font-bold text-base tracking-wider" style={{ fontFamily: 'Syne', color: 'var(--text)' }}>
                    Sonora
                </span>
            </Link>

            <nav className="flex flex-col gap-1 flex-1">
                {NAV.map(({ to, label, icon: Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={to === '/'}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
                        style={({ isActive }) => ({
                            background: isActive ? 'var(--accent)' : 'transparent',
                            color: isActive ? '#000' : 'var(--text-2)',
                        })}
                    >
                        <Icon size={18} strokeWidth={2.2} />
                        {width > 200 && <span className="truncate">{label}</span>}
                    </NavLink>
                ))}
            </nav>

            <div className="flex items-center justify-center gap-2 mb-4">
                <button
                    onClick={() => dispatch(toggleTheme())}
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    style={{ background: 'var(--bg-hover)', color: 'var(--text)', border: '1px solid var(--border)' }}
                    title={theme === 'dark' ? 'Світла тема' : 'Темна тема'}
                >
                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                <button
                    onClick={() => dispatch(toggleLanguage())}
                    className="h-10 px-3 rounded-full flex items-center justify-center text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    style={{ background: 'var(--bg-hover)', color: 'var(--text)', border: '1px solid var(--border)' }}
                >
                    {lang === 'uk' ? 'Укр' : 'Eng'}
                </button>
            </div>

            <div className="border-t pt-4" style={{ borderColor: 'var(--border)' }}>
                {isAuth && user ? (
                    <Link
                        to="/me"
                        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-all"
                        style={{ color: 'var(--text)' }}
                        onClick={e => e.stopPropagation()}
                    >
                        {hasCustomAvatar(user.image) ? (
                            <img
                                src={user.image!}
                                alt="avatar"
                                className="w-8 h-8 rounded-full object-cover flex-shrink-0 border"
                                style={{ borderColor: 'var(--border)' }}
                            />
                        ) : (
                            <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                                style={{ background: 'var(--accent)', color: '#000' }}
                            >
                                {user.username?.[0]?.toUpperCase() ?? '?'}
                            </div>
                        )}
                        {width > 200 && (
                            <span className="text-sm font-medium truncate flex-1">{user.username}</span>
                        )}
                        <button
                            onClick={e => { e.preventDefault(); dispatch(logout()) }}
                            className="p-1 rounded-md text-red-500 opacity-60 hover:opacity-100 hover:bg-red-500/10 transition-all"
                            title="Вийти"
                        >
                            <LogOut size={16} />
                        </button>
                    </Link>
                ) : (
                    <div className="flex flex-col gap-2 px-1">
                        <NavLink
                            to="/login"
                            className="text-center py-2 rounded-lg text-sm font-medium border transition-all hover:bg-white/5"
                            style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}
                        >
                            {width > 200 ? 'Увійти' : '→'}
                        </NavLink>
                        {width > 200 && (
                            <NavLink
                                to="/register"
                                className="text-center py-2 rounded-lg text-sm font-bold transition-all text-black"
                                style={{ background: 'var(--accent)' }}
                            >
                                Реєстрація
                            </NavLink>
                        )}
                    </div>
                )}
            </div>

            <div
                onMouseDown={startResizing}
                className={`absolute top-0 right-0 w-1.5 h-full transition-colors duration-200 z-50 ${
                    isResizing ? 'cursor-grabbing' : 'bg-transparent cursor-grab'
                }`}
                style={{ backgroundColor: isResizing ? 'var(--accent)' : undefined }}
            />
        </aside>
    )
}
