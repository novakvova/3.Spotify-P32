import { useState } from 'react'
import { useNavigate, NavLink } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { logout, selectCurrentUser, selectIsAuthenticated } from '../store/slices/authSlice'
import { toggleTheme, selectTheme } from '../store/slices/themeSlice'
import { Search, X, Sun, Moon, LogOut, User } from 'lucide-react'

export default function TopBar() {
    const [query, setQuery] = useState('')
    const navigate = useNavigate()

    const dispatch = useAppDispatch()
    const isAuth = useAppSelector(selectIsAuthenticated)
    const user = useAppSelector(selectCurrentUser)
    const theme = useAppSelector(selectTheme)

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (query.trim()) navigate(`/songs?search=${encodeURIComponent(query.trim())}`)
    }

    return (
        <header
            className="flex items-center justify-between px-4 md:px-6 border-b flex-shrink-0 select-none gap-3 md:gap-4"
            style={{
                background: 'var(--bg)',
                borderColor: 'var(--border)',
                height: 56, // Повертаємо стандартну висоту Spotify
            }}
        >
            {/* Аватарка/Профіль (ТІЛЬКИ НА МОБІЛКАХ) */}
            <div className="md:hidden flex items-center gap-2 flex-shrink-0">
                {isAuth && user ? (
                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border"
                        style={{ background: 'var(--accent)', color: '#000', borderColor: 'var(--border)' }}
                        title={user.username}
                    >
                        {user?.username?.[0]?.toUpperCase() ?? '?'}
                    </div>
                ) : (
                    <NavLink to="/login" style={{ color: 'var(--text)' }} title="Увійти">
                        <User size={20} className="opacity-80 hover:opacity-100" />
                    </NavLink>
                )}
            </div>

            {/* Форма Пошуку (На ПК на весь екран + кнопка Знайти, на мобілках — компактна) */}
            <form onSubmit={handleSearch} className="flex items-center gap-2 md:gap-3 flex-1 w-full">
                <div
                    className="flex items-center gap-2 flex-1 px-4 py-1.5 rounded-full transition-all focus-within:ring-1 focus-within:ring-[var(--accent)]"
                    style={{ background: 'var(--bg-input)', border: '1px solid var(--border)' }}
                >
                    <Search size={16} strokeWidth={2.2} style={{ color: 'var(--text-3)' }} />
                    <input
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Пошук пісень, виконавців, альбомів..."
                        className="flex-1 bg-transparent outline-none text-sm py-0.5"
                        style={{ color: 'var(--text)' }}
                    />
                    {query && (
                        <button
                            type="button"
                            onClick={() => setQuery('')}
                            className="p-1 rounded-full opacity-60 hover:opacity-100 hover:bg-white/10 transition-all"
                            style={{ color: 'var(--text)' }}
                        >
                            <X size={14} strokeWidth={2.5} />
                        </button>
                    )}
                </div>

                {/* Кнопка "Знайти" — відображається завжди на ПК, а на мобілках ховається */}
                <button
                    type="submit"
                    className="hidden md:block px-5 py-2 rounded-full text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98] flex-shrink-0"
                    style={{ background: 'var(--accent)', color: '#000' }}
                >
                    Знайти
                </button>
            </form>

            {/* Блок керування темою та виходом (ТІЛЬКИ НА МОБІЛКАХ) */}
            <div className="md:hidden flex items-center gap-2 flex-shrink-0">
                <button
                    onClick={() => dispatch(toggleTheme())}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                    style={{ background: 'var(--bg-hover)', color: 'var(--text)', border: '1px solid var(--border)' }}
                >
                    {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
                </button>

                {isAuth && (
                    <button
                        onClick={() => dispatch(logout())}
                        className="p-1.5 rounded-md text-red-500 bg-red-500/5 border border-red-500/10"
                        title="Вийти"
                    >
                        <LogOut size={15} />
                    </button>
                )}
            </div>
        </header>
    )
}