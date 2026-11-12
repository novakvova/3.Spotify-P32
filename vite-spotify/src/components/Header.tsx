import React, { useEffect, useRef, useState } from 'react'
import imgLogoSonora042 from '../assets/home/logo-sonora.png'
import { Menu, X } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { logout, selectCurrentUser, selectIsAuthenticated } from '../store/slices/authSlice'
import { toggleLanguage } from '../store/slices/languageSlice'

export const Header: React.FC = () => {
    const dispatch = useAppDispatch()
    const { t } = useTranslation()
    const isAuthenticated = useAppSelector(selectIsAuthenticated)
    const user = useAppSelector(selectCurrentUser)
    const [openPremium, setOpenPremium] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const PURPLE_BG = '#280a3a'
    const premiumRef = useRef<HTMLDivElement>(null)
    const navigate = useNavigate()

    const displayName = user?.fullName || user?.username || user?.email || t('header.profile')
    const userInitial = displayName.charAt(0).toUpperCase()

    const PREMIUM_PLANS = [
        {
            title: 'Individual',
            desc: t('header.planDesc.individual'),
            redirectlink: '/premium',
        },
        {
            title: 'Duo',
            desc: t('header.planDesc.duo'),
            redirectlink: '/premium/duo',
        },
        {
            title: 'Family',
            desc: t('header.planDesc.family'),
            redirectlink: '/premium/family',
        },
        {
            title: 'Student',
            desc: t('header.planDesc.student'),
            redirectlink: '/premium/student',
        },
        {
            title: 'Kids+',
            desc: t('header.planDesc.kids'),
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
                                {t('header.premiumPlans')}
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
                        <span className="leading-normal">{t('header.support')}</span>
                    </Link>

                    <Link to="/download" className="flex flex-col font-semibold justify-center shrink-0 text-base cursor-pointer hover:opacity-80 transition-opacity">
                        <span className="leading-normal">{t('header.download')}</span>
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
                                <span className="leading-normal">{t('header.logOut')}</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/register" className="flex flex-col font-semibold justify-center shrink-0 text-base cursor-pointer hover:opacity-80 transition-opacity">
                                <span className="leading-normal">{t('header.signUp')}</span>
                            </Link>

                            <Link to="/login" className="flex flex-col font-semibold justify-center shrink-0 text-base cursor-pointer hover:opacity-80 transition-opacity">
                                <span className="leading-normal">{t('header.logIn')}</span>
                            </Link>
                        </>
                    )}

                    <button
                        type="button"
                        onClick={() => dispatch(toggleLanguage())}
                        className="flex flex-col font-normal justify-center shrink-0 text-sm text-right cursor-pointer hover:opacity-80 transition-opacity"
                    >
                        <span className="leading-5">{t('header.langShort')}</span>
                    </button>
                </nav>

                <button
                    type="button"
                    onClick={() => setMobileMenuOpen((v) => !v)}
                    className="lg:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                    aria-label={t('header.menu')}
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
                        <span>{t('header.premiumPlans')}</span>
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
                        {t('header.support')}
                    </Link>
                    <Link
                        to="/download"
                        onClick={() => setMobileMenuOpen(false)}
                        className="font-semibold text-base py-1 cursor-pointer"
                    >
                        {t('header.download')}
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
                                {t('header.logOut')}
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/register"
                                onClick={() => setMobileMenuOpen(false)}
                                className="font-semibold text-base py-1 cursor-pointer"
                            >
                                {t('header.signUp')}
                            </Link>
                            <Link
                                to="/login"
                                onClick={() => setMobileMenuOpen(false)}
                                className="font-semibold text-base py-1 cursor-pointer"
                            >
                                {t('header.logIn')}
                            </Link>
                        </>
                    )}
                    <button
                        type="button"
                        onClick={() => dispatch(toggleLanguage())}
                        className="text-sm opacity-80 pt-1 border-t border-white/10 text-left cursor-pointer hover:opacity-100"
                    >
                        {t('header.langMenu')}
                    </button>
                </div>
            )}
        </header>
    )
}
