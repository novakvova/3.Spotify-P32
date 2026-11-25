import { useEffect } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
    LayoutDashboard,
    Users,
    Music,
    Disc,
    Mic2,
    Layers,
    Shield,
    ArrowLeft,
    LogOut,
    Lock,
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
    isJwtTokenValid,
    logout,
    selectCurrentUser,
    selectIsAdmin,
    selectIsAuthenticated,
} from '../store/slices/authSlice'
import { toggleLanguage } from '../store/slices/languageSlice'
import { useGetProfileQuery } from '../services/auth/authApi'
import PlayerBar from './PlayerBar'
import imgLogoCircle from '../assets/player/logo-circle.png'

const ADMIN_NAV_ITEMS = [
    { to: '/admin', labelKey: 'admin.nav.dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/users', labelKey: 'admin.nav.users', icon: Users, end: false },
    { to: '/admin/songs', labelKey: 'admin.nav.songs', icon: Music, end: false },
    { to: '/admin/albums', labelKey: 'admin.nav.albums', icon: Disc, end: false },
    { to: '/admin/artists', labelKey: 'admin.nav.artists', icon: Mic2, end: false },
    { to: '/admin/genres', labelKey: 'admin.nav.genres', icon: Layers, end: false },
    { to: '/admin/roles', labelKey: 'admin.nav.roles', icon: Shield, end: false },
] as const

export default function AdminLayout() {
    const { t } = useTranslation()
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const isAuthenticated = useAppSelector(selectIsAuthenticated)
    const isAdminFromStore = useAppSelector(selectIsAdmin)
    const user = useAppSelector(selectCurrentUser)

    const { data: profile, isLoading: isProfileLoading } = useGetProfileQuery(undefined, {
        skip: !isAuthenticated,
    })

    useEffect(() => {
        if (isAuthenticated && !isJwtTokenValid(localStorage.getItem('token'))) {
            dispatch(logout())
        }
    }, [isAuthenticated, dispatch])

    const hasAdminInProfile = Boolean(
        profile?.roles?.some((r) => r.toLowerCase().includes('admin'))
    )
    const isAdmin = isAdminFromStore || hasAdminInProfile

    const displayName =
        user?.fullName || profile?.username || user?.username || user?.email || 'A'
    const userInitial = displayName.charAt(0).toUpperCase()

    if (isAuthenticated && !isAdmin && isProfileLoading) {
        return (
            <div className="min-h-screen w-full bg-sonora-dark font-inter text-white flex items-center justify-center">
                <p className="text-sm text-sonora-muted animate-pulse">
                    {t('admin.common.loading')}
                </p>
            </div>
        )
    }

    if (!isAuthenticated || !isAdmin) {
        return (
            <div className="min-h-screen w-full bg-sonora-dark font-inter text-white flex flex-col items-center justify-center px-4 py-12">
                <div className="w-full max-w-md bg-sonora-panel border border-white/15 rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl">
                    <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-sonora-purple to-sonora-pink flex items-center justify-center mb-5 shadow-lg">
                        <Lock size={28} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-extrabold text-white mb-2">
                        {t('admin.accessDeniedTitle')}
                    </h1>
                    <p className="text-sm text-sonora-lavender leading-relaxed mb-7">
                        {t('admin.accessDeniedDesc')}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 w-full">
                        <Link
                            to="/login"
                            className="flex-1 py-3 px-5 rounded-full bg-white text-sonora-dark font-bold text-sm text-center hover:opacity-90 transition-opacity"
                        >
                            {t('admin.goToLogin')}
                        </Link>
                        <Link
                            to="/player"
                            className="flex-1 py-3 px-5 rounded-full border border-white/30 text-white font-bold text-sm text-center hover:bg-white/10 transition-colors"
                        >
                            {t('admin.goToPlayer')}
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen w-full flex flex-col bg-sonora-dark font-inter text-white pb-28">
            <header className="sticky top-0 z-40 w-full h-16 sm:h-20 bg-sonora-dark/95 backdrop-blur-xs border-b border-white/10 px-4 sm:px-6 flex items-center justify-between gap-3 select-none">
                <div className="flex items-center gap-3 min-w-0">
                    <Link to="/player" className="shrink-0 w-9 h-9 sm:w-11 sm:h-11 block">
                        <img
                            src={imgLogoCircle}
                            alt="Sonora"
                            className="w-full h-full object-cover block"
                        />
                    </Link>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="font-extrabold text-base sm:text-lg text-white truncate">
                                {t('admin.panelTitle')}
                            </span>
                            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sonora-light/20 text-sonora-light border border-sonora-light/30">
                                <Shield size={11} />
                                ADMIN
                            </span>
                        </div>
                        <p className="hidden md:block text-xs text-sonora-muted truncate">
                            {t('admin.panelSubtitle')}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
                    <Link
                        to="/player"
                        className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-sonora-warm/60 hover:bg-sonora-warm text-xs sm:text-sm font-semibold text-white transition-colors"
                    >
                        <ArrowLeft size={15} />
                        <span className="hidden sm:inline">{t('admin.backToPlayer')}</span>
                    </Link>

                    <button
                        type="button"
                        onClick={() => dispatch(toggleLanguage())}
                        className="text-xs sm:text-sm font-semibold text-white/90 hover:text-white cursor-pointer px-2 py-1"
                    >
                        {t('header.langShort')}
                    </button>

                    <Link
                        to="/me"
                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-linear-to-br from-sonora-purple to-sonora-light flex items-center justify-center font-bold text-sm text-white shrink-0 hover:opacity-90 transition-opacity"
                        title={displayName}
                    >
                        {userInitial}
                    </Link>

                    <button
                        type="button"
                        onClick={() => {
                            dispatch(logout())
                            navigate('/login')
                        }}
                        className="p-2 rounded-full text-white/75 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                        title={t('profile.logOut')}
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </header>

            <div className="w-full flex-1 flex flex-col lg:flex-row lg:items-stretch px-3 sm:px-5 pt-3 sm:pt-4 gap-3 sm:gap-4">
                <nav className="flex lg:hidden items-center gap-2 overflow-x-auto bg-sonora-panel p-2 rounded-2xl border border-white/10 shrink-0">
                    {ADMIN_NAV_ITEMS.map(({ to, labelKey, icon: Icon, end }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={end}
                            className={({ isActive }) =>
                                `inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-colors shrink-0 ${
                                    isActive
                                        ? 'bg-sonora-light text-white shadow-sm'
                                        : 'text-sonora-lavender hover:bg-white/5 hover:text-white'
                                }`
                            }
                        >
                            <Icon size={16} />
                            <span>{t(labelKey)}</span>
                        </NavLink>
                    ))}
                </nav>

                <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-sonora-panel rounded-2xl p-4 border border-white/10 select-none">
                    <div className="sticky top-24 flex flex-col gap-1.5">
                        {ADMIN_NAV_ITEMS.map(({ to, labelKey, icon: Icon, end }) => (
                            <NavLink
                                key={to}
                                to={to}
                                end={end}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                                        isActive
                                            ? 'bg-linear-to-r from-sonora-purple to-sonora-light text-white shadow-md'
                                            : 'text-sonora-lavender hover:bg-white/5 hover:text-white'
                                    }`
                                }
                            >
                                <Icon size={18} />
                                <span>{t(labelKey)}</span>
                            </NavLink>
                        ))}
                    </div>
                </aside>

                <main className="flex-1 min-w-0 flex flex-col bg-sonora-panel rounded-2xl p-4 sm:p-6 md:p-8 border border-white/10">
                    <Outlet />
                </main>
            </div>

            <PlayerBar />
        </div>
    )
}
