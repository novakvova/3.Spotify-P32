import React, { useEffect, useRef, useState } from 'react'
import imgLogoSonora042 from '../assets/home/logo-sonora.png'
import { Menu, X } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { logout, selectCurrentUser, selectIsAuthenticated } from '../store/slices/authSlice'
import { selectLanguage, toggleLanguage } from '../store/slices/languageSlice'

export const Header: React.FC = () => {
    const dispatch = useAppDispatch()
    const isAuthenticated = useAppSelector(selectIsAuthenticated)
    const user = useAppSelector(selectCurrentUser)
    const lang = useAppSelector(selectLanguage)
    const isEn = lang === 'en'
    const [openPremium, setOpenPremium] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const PURPLE_BG = '#280a3a'
    const premiumRef = useRef<HTMLDivElement>(null)
    const navigate = useNavigate()

    const displayName = user?.fullName || user?.username || user?.email || (isEn ? 'Profile' : 'Профіль')
    const userInitial = displayName.charAt(0).toUpperCase()

    const PREMIUM_PLANS = [
        {
            title: 'Individual',
            desc: isEn ? '1 account for one person' : '1 акаунт для однієї людини',
            redirectlink: '/premium',
        },
        {
            title: 'Duo',
            desc: isEn ? '2 accounts for couples under one roof' : '2 акаунти для пар, що мешкають разом',
            redirectlink: '/premium/duo',
        },
        {
            title: 'Family',
            desc: isEn ? 'Up to 6 accounts for family members under one roof' : "До 6 акаунтів для членів сім'ї, що мешкають разом",
            redirectlink: '/premium/family',
        },
        {
            title: 'Student',
            desc: isEn ? '1 account, discount for eligible students' : '1 акаунт, знижка для студентів',
            redirectlink: '/premium/student',
        },
        {
            title: 'Kids+',
            desc: isEn ? 'Up to 3 accounts for kids under one roof' : 'До 3 акаунтів для дітей, що мешкають разом',
            redirectlink: '/premium/kids',
        },
    ]

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (premiumRef.current && !premiumRef.current.contains(e.target as Node)) {
                setOpenPremium(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <header className="w-full relative z-40" style={{ backgroundColor: PURPLE_BG }}>
            <div
                className="mx-auto flex items-center justify-between px-4 sm:px-8 lg:px-16 xl:px-40 py-2.5"
                style={{ maxWidth: 1440, height: 75 }}
            >
                <Link to="/" className="relative shrink-0" style={{ width: 115, height: 25 }}>
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <img
                            alt="Sonora"
                            className="absolute max-w-none"
                            style={{
                                height: '480%',
                                left: '-2.4%',
                                top: '-164.21%',
                                width: '104.35%',
                            }}
                            src={imgLogoSonora042}
                        />
                    </div>
                </Link>

                <nav className="hidden lg:flex gap-6 xl:gap-12 items-center justify-end xl:justify-center text-white shrink-0">
                    <div ref={premiumRef} className="relative shrink-0">
                        <button
                            type="button"
                            onClick={() => setOpenPremium((v) => !v)}
                            className="cursor-pointer flex flex-col font-semibold justify-center text-base text-left hover:opacity-80 transition-opacity"
                        >
                            <span className="leading-normal whitespace-nowrap">
                                {isEn ? 'Premium Plans' : 'Підписки Premium'}
                            </span>
                        </button>

                        {openPremium && (
                            <div className="absolute left-0 top-10 w-80 sm:w-96 shadow-xl z-50">
                                {PREMIUM_PLANS.map((plan) => (
                                    <button
                                        key={plan.title}
                                        type="button"
                                        onClick={() => {
                                            navigate(plan.redirectlink)
                                            setOpenPremium(false)
                                        }}
                                        className="h-24 w-full transition-colors flex flex-col gap-3.5 items-start justify-center px-3.5 text-left text-white cursor-pointer hover:brightness-125"
                                        style={{ backgroundColor: PURPLE_BG }}
                                    >
                                        <span className="font-bold text-base leading-6">
                                            {plan.title}
                                        </span>
                                        <span className="font-normal text-sm leading-5">
                                            {plan.desc}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <Link to="/support" className="flex flex-col font-semibold justify-center shrink-0 text-base cursor-pointer hover:opacity-80 transition-opacity">
                        <span className="leading-normal">{isEn ? 'Support' : 'Підтримка'}</span>
                    </Link>

                    <Link to="/download" className="flex flex-col font-semibold justify-center shrink-0 text-base cursor-pointer hover:opacity-80 transition-opacity">
                        <span className="leading-normal">{isEn ? 'Download' : 'Завантажити'}</span>
                    </Link>

                    {isAuthenticated ? (
                        <>
                            <Link
                                to="/me"
                                className="flex items-center gap-2.5 font-semibold shrink-0 text-base cursor-pointer hover:opacity-80 transition-opacity"
                            >
                                <span
                                    className="rounded-full flex items-center justify-center font-bold text-sm text-black bg-white shrink-0"
                                    style={{ width: 32, height: 32 }}
                                >
                                    {userInitial}
                                </span>
                                <span className="leading-normal">{displayName}</span>
                            </Link>

                            <button
                                type="button"
                                onClick={() => dispatch(logout())}
                                className="flex flex-col font-semibold justify-center shrink-0 text-base cursor-pointer hover:opacity-80 transition-opacity"
                            >
                                <span className="leading-normal">{isEn ? 'Log out' : 'Вийти'}</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/register" className="flex flex-col font-semibold justify-center shrink-0 text-base cursor-pointer hover:opacity-80 transition-opacity">
                                <span className="leading-normal">{isEn ? 'Sign up' : 'Зареєструватися'}</span>
                            </Link>

                            <Link to="/login" className="flex flex-col font-semibold justify-center shrink-0 text-base cursor-pointer hover:opacity-80 transition-opacity">
                                <span className="leading-normal">{isEn ? 'Log in' : 'Увійти'}</span>
                            </Link>
                        </>
                    )}

                    <button
                        type="button"
                        onClick={() => dispatch(toggleLanguage())}
                        className="flex flex-col font-normal justify-center shrink-0 text-sm text-right cursor-pointer hover:opacity-80 transition-opacity"
                    >
                        <span className="leading-5">{isEn ? 'Eng' : 'Укр'}</span>
                    </button>
                </nav>

                <button
                    type="button"
                    onClick={() => setMobileMenuOpen((v) => !v)}
                    className="lg:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                    aria-label={isEn ? 'Menu' : 'Меню'}
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {mobileMenuOpen && (
                <div
                    className="lg:hidden border-t border-white/10 px-6 py-5 flex flex-col gap-4 text-white"
                    style={{ backgroundColor: PURPLE_BG }}
                >
                    <button
                        type="button"
                        onClick={() => setOpenPremium((v) => !v)}
                        className="flex items-center justify-between font-semibold text-base text-left py-1 cursor-pointer"
                    >
                        <span>{isEn ? 'Premium Plans' : 'Підписки Premium'}</span>
                        <span className="text-xs opacity-70">{openPremium ? '▲' : '▼'}</span>
                    </button>
                    {openPremium && (
                        <div className="flex flex-col gap-2 pl-3 border-l border-white/20">
                            {PREMIUM_PLANS.map((plan) => (
                                <Link
                                    key={plan.title}
                                    to={plan.redirectlink}
                                    onClick={() => {
                                        setOpenPremium(false)
                                        setMobileMenuOpen(false)
                                    }}
                                    className="text-left py-1.5"
                                >
                                    <p className="font-bold text-sm">{plan.title}</p>
                                    <p className="text-xs opacity-80">{plan.desc}</p>
                                </Link>
                            ))}
                        </div>
                    )}
                    <Link
                        to="/support"
                        onClick={() => setMobileMenuOpen(false)}
                        className="font-semibold text-base py-1 cursor-pointer"
                    >
                        {isEn ? 'Support' : 'Підтримка'}
                    </Link>
                    <Link
                        to="/download"
                        onClick={() => setMobileMenuOpen(false)}
                        className="font-semibold text-base py-1 cursor-pointer"
                    >
                        {isEn ? 'Download' : 'Завантажити'}
                    </Link>
                    {isAuthenticated ? (
                        <>
                            <Link
                                to="/me"
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center gap-2.5 font-semibold text-base py-1 cursor-pointer"
                            >
                                <span
                                    className="rounded-full flex items-center justify-center font-bold text-sm text-black bg-white shrink-0"
                                    style={{ width: 28, height: 28 }}
                                >
                                    {userInitial}
                                </span>
                                <span>{displayName}</span>
                            </Link>
                            <button
                                type="button"
                                onClick={() => {
                                    dispatch(logout())
                                    setMobileMenuOpen(false)
                                }}
                                className="font-semibold text-base py-1 text-left cursor-pointer"
                            >
                                {isEn ? 'Log out' : 'Вийти'}
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/register"
                                onClick={() => setMobileMenuOpen(false)}
                                className="font-semibold text-base py-1 cursor-pointer"
                            >
                                {isEn ? 'Sign up' : 'Зареєструватися'}
                            </Link>
                            <Link
                                to="/login"
                                onClick={() => setMobileMenuOpen(false)}
                                className="font-semibold text-base py-1 cursor-pointer"
                            >
                                {isEn ? 'Log in' : 'Увійти'}
                            </Link>
                        </>
                    )}
                    <button
                        type="button"
                        onClick={() => dispatch(toggleLanguage())}
                        className="text-sm opacity-80 pt-1 border-t border-white/10 text-left cursor-pointer hover:opacity-100"
                    >
                        {isEn ? 'Language: Eng' : 'Мова: Укр'}
                    </button>
                </div>
            )}
        </header>
    )
}
