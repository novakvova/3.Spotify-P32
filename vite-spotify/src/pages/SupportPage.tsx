import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Footer } from '../components/Footer'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { logout, selectCurrentUser, selectIsAuthenticated } from '../store/slices/authSlice'
import { toggleLanguage } from '../store/slices/languageSlice'
import imgLogoSonora from '../assets/home/logo-sonora.png'
import imgCard from '../assets/support/card.svg'
import imgPerson from '../assets/support/person.svg'
import imgSettings from '../assets/support/settings.svg'
import imgBlock from '../assets/support/block.svg'
import imgDevices from '../assets/support/devices.svg'
import imgLock from '../assets/support/lock.svg'
import imgArrowDown from '../assets/support/arrow-down.svg'
import imgArrowWhite from '../assets/support/arrow-white.svg'

interface ArticleRef {
    to?: string
}

interface SubSection {
    id: string
    articles: ArticleRef[]
}

interface HelpCategory {
    id: string
    icon: string
    subSections: SubSection[]
}

const HELP_CATEGORIES: HelpCategory[] = [
    {
        id: 'payments',
        icon: imgCard,
        subSections: [
            { id: 'recommended', articles: [{}, {}] },
            {
                id: 'manage-payments',
                articles: [{ to: '/support/payment-methods' }, {}, {}],
            },
            {
                id: 'payment-methods',
                articles: [{ to: '/support/payment-methods' }, {}],
            },
            { id: 'billing-help', articles: [{}, {}] },
        ],
    },
    {
        id: 'account',
        icon: imgPerson,
        subSections: [{ id: 'account-login', articles: [{}, {}, {}] }],
    },
    {
        id: 'premium',
        icon: imgSettings,
        subSections: [
            {
                id: 'premium-plans',
                articles: [
                    { to: '/premium' },
                    { to: '/premium/duo' },
                    { to: '/premium/family' },
                    { to: '/premium/student' },
                    { to: '/premium/kids' },
                ],
            },
        ],
    },
    {
        id: 'features',
        icon: imgBlock,
        subSections: [{ id: 'app-features', articles: [{}, {}] }],
    },
    {
        id: 'devices',
        icon: imgDevices,
        subSections: [{ id: 'devices-help', articles: [{}, { to: '/support/payment-methods' }] }],
    },
    {
        id: 'security',
        icon: imgLock,
        subSections: [{ id: 'security-help', articles: [{}, { to: '/about' }] }],
    },
]

const DEFAULT_OPEN_SUBSECTIONS: Record<string, boolean> = {
    'manage-payments': true,
    'payment-methods': true,
    'account-login': true,
    'premium-plans': true,
    'app-features': true,
    'devices-help': true,
    'security-help': true,
}

const QUICK_HELP_INDEXES = [0, 1, 2, 3, 4] as const

export const SupportHeader: React.FC = () => {
    const { t } = useTranslation()
    const dispatch = useAppDispatch()
    const isAuthenticated = useAppSelector(selectIsAuthenticated)
    const user = useAppSelector(selectCurrentUser)
    const displayName = user?.fullName || user?.username || user?.email || t('support.profile')
    const userInitial = displayName.charAt(0).toUpperCase()

    return (
        <header className="w-full bg-sonora-dark">
            <div className="max-w-7xl mx-auto h-20 flex items-center justify-between px-4 sm:px-8 lg:px-16 xl:px-40 gap-3">
                <div className="flex items-center gap-6 sm:gap-8 shrink-0">
                    <Link to="/player" className="relative shrink-0 w-31 h-5.5 overflow-hidden">
                        <img
                            alt="Sonora"
                            className="absolute max-w-none w-36 h-36 -top-13.5 -left-2.5"
                            src={imgLogoSonora}
                        />
                    </Link>

                    <span className="hidden md:inline-block font-semibold text-base text-white cursor-default">
                        {t('support.installApp')}
                    </span>
                </div>

                <div className="flex items-center gap-3 sm:gap-8 md:gap-12 shrink-0">
                    {isAuthenticated ? (
                        <>
                            <Link
                                to="/me"
                                className="flex items-center gap-2.5 font-semibold text-base text-white hover:opacity-80 transition-opacity"
                            >
                                <span className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-black bg-white shrink-0">
                                    {userInitial}
                                </span>
                                <span className="hidden sm:inline">{displayName}</span>
                            </Link>
                            <button
                                type="button"
                                onClick={() => dispatch(logout())}
                                className="px-4 sm:w-28 h-9 sm:h-11 rounded-full bg-sonora-purple flex items-center justify-center font-semibold text-xs sm:text-sm text-white cursor-pointer hover:opacity-90 transition-opacity whitespace-nowrap"
                            >
                                {t('support.logOut')}
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/register"
                                className="font-semibold text-sm sm:text-base text-white hover:opacity-80 transition-opacity whitespace-nowrap"
                            >
                                {t('support.signUp')}
                            </Link>
                            <Link
                                to="/login"
                                className="px-4 sm:w-28 h-9 sm:h-11 rounded-full bg-sonora-purple flex items-center justify-center font-semibold text-xs sm:text-sm text-white hover:opacity-90 transition-opacity whitespace-nowrap"
                            >
                                {t('support.logIn')}
                            </Link>
                        </>
                    )}

                    <button
                        type="button"
                        onClick={() => dispatch(toggleLanguage())}
                        className="font-normal text-sm text-white cursor-pointer hover:opacity-80 transition-opacity shrink-0"
                    >
                        {t('support.langShort')}
                    </button>
                </div>
            </div>
        </header>
    )
}

export default function SupportPage() {
    const { t } = useTranslation()
    const [aiQuery, setAiQuery] = useState('')
    const [aiSubmitted, setAiSubmitted] = useState(false)
    const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({})
    const [openSubSections, setOpenSubSections] = useState<Record<string, boolean>>(DEFAULT_OPEN_SUBSECTIONS)

    const hasQuery = aiQuery.trim().length > 0

    const toggleCategory = (id: string) => {
        setOpenCategories((prev) => ({ ...prev, [id]: !prev[id] }))
    }

    const toggleSubSection = (id: string) => {
        setOpenSubSections((prev) => ({ ...prev, [id]: !prev[id] }))
    }

    const handleSendQuery = (e: React.FormEvent) => {
        e.preventDefault()
        if (!hasQuery) return
        setAiSubmitted(true)
    }

    return (
        <div className="min-h-screen w-full bg-white flex flex-col justify-between text-sonora-dark">
            <SupportHeader />

            <main className="flex-1 w-full">
                <section className="max-w-6xl mx-auto px-4 sm:px-8 pt-14 sm:pt-16 pb-12">
                    <h1 className="font-extrabold text-center mb-10 leading-tight">
                        <span className="text-4xl">{t('support.title')} </span>
                        <span className="text-5xl">Sonora</span>
                    </h1>

                    <div className="max-w-3xl mx-auto">
                        <form
                            onSubmit={handleSendQuery}
                            className="relative flex flex-col justify-between p-6 min-h-44 border-2 border-sonora-dark rounded-3xl"
                        >
                            <div className="relative w-full">
                                {!aiQuery && (
                                    <span className="absolute left-0 top-0 pointer-events-none select-none font-bold text-base leading-6 text-sonora-dark">
                                        {t('support.aiPlaceholder')}
                                    </span>
                                )}
                                <textarea
                                    value={aiQuery}
                                    onChange={(e) => {
                                        setAiQuery(e.target.value)
                                        if (aiSubmitted) setAiSubmitted(false)
                                    }}
                                    rows={3}
                                    className="relative w-full resize-none bg-transparent font-bold text-base leading-6 text-sonora-dark outline-none"
                                />
                            </div>

                            <div className="flex items-center justify-end mt-3">
                                <button
                                    type="submit"
                                    disabled={!hasQuery}
                                    className={`w-36 h-10 rounded-full bg-sonora-purple font-semibold text-sm text-white transition-opacity ${
                                        hasQuery ? 'opacity-100 cursor-pointer' : 'opacity-50 cursor-default'
                                    }`}
                                >
                                    {t('support.send')}
                                </button>
                            </div>
                        </form>

                        <p className="mt-3 text-base font-normal leading-8">
                            {t('support.aiNote')}
                        </p>

                        {aiSubmitted && (
                            <div className="mt-4 p-5 text-base rounded-2xl border border-sonora-light bg-purple-50">
                                <p className="font-bold mb-1">{t('support.receivedTitle')}</p>
                                <p className="font-normal mb-3">{t('support.receivedText')}</p>
                                <Link
                                    to="/support/payment-methods"
                                    className="font-bold underline text-sonora-purple"
                                >
                                    {t('support.receivedLink')}
                                </Link>
                            </div>
                        )}
                    </div>
                </section>

                <section className="max-w-6xl mx-auto px-4 sm:px-8 pt-6 pb-20">
                    <div className="max-w-3xl mx-auto mb-12">
                        <h2 className="font-semibold text-3xl leading-tight">
                            {t('support.browseTitle')}
                        </h2>
                    </div>

                    <div className="flex flex-col gap-10">
                        {HELP_CATEGORIES.map((category) => {
                            const isOpen = !!openCategories[category.id]
                            return (
                                <div key={category.id} className="w-full flex flex-col">
                                    <button
                                        type="button"
                                        onClick={() => toggleCategory(category.id)}
                                        className="w-full flex items-center justify-between gap-5 cursor-pointer text-left py-1 hover:opacity-80 transition-opacity"
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className="relative shrink-0 w-6 h-6 flex items-center justify-center">
                                                <img
                                                    src={category.icon}
                                                    alt=""
                                                    className="block max-w-none w-full h-full object-contain"
                                                />
                                            </div>
                                            <span className="font-bold text-xl leading-9 text-sonora-dark">
                                                {t(`support.categories.${category.id}.title`)}
                                            </span>
                                        </div>

                                        <div
                                            className={`relative shrink-0 w-6 h-2.5 transition-transform duration-200 ${
                                                isOpen ? 'rotate-180' : ''
                                            }`}
                                        >
                                            <img
                                                src={imgArrowDown}
                                                alt=""
                                                className="block w-full h-full"
                                            />
                                        </div>
                                    </button>

                                    {isOpen && (
                                        <div className="flex flex-col gap-8 pl-6 sm:pl-11 pt-8">
                                            {category.subSections.map((sub) => {
                                                const isSubOpen = !!openSubSections[sub.id]
                                                const base = `support.categories.${category.id}.subs.${sub.id}`
                                                return (
                                                    <div key={sub.id} className="w-full flex flex-col">
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleSubSection(sub.id)}
                                                            className="w-full flex items-center justify-between cursor-pointer text-left py-2 hover:opacity-80 transition-opacity"
                                                        >
                                                            <span className="font-bold text-xl leading-8 text-sonora-dark">
                                                                {t(`${base}.title`)}
                                                            </span>
                                                            <div
                                                                className={`relative shrink-0 w-6 h-2.5 transition-transform duration-200 ${
                                                                    isSubOpen ? 'rotate-180' : ''
                                                                }`}
                                                            >
                                                                <img
                                                                    src={imgArrowDown}
                                                                    alt=""
                                                                    className="block w-full h-full"
                                                                />
                                                            </div>
                                                        </button>

                                                        {isSubOpen && (
                                                            <div className="flex flex-col gap-5 pt-4">
                                                                {sub.articles.map((article, idx) => {
                                                                    const text = t(`${base}.articles.${idx}`)
                                                                    return article.to ? (
                                                                        <Link
                                                                            key={idx}
                                                                            to={article.to}
                                                                            className="font-medium text-xl leading-8 text-sonora-dark hover:underline transition-opacity"
                                                                        >
                                                                            {text}
                                                                        </Link>
                                                                    ) : (
                                                                        <span
                                                                            key={idx}
                                                                            className="font-medium text-xl leading-8 text-sonora-dark cursor-default"
                                                                        >
                                                                            {text}
                                                                        </span>
                                                                    )
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </section>

                <section className="w-full py-10 bg-sonora-light min-h-96">
                    <div className="max-w-6xl mx-auto px-4 sm:px-8 flex flex-col gap-10">
                        <h2 className="font-extrabold text-3xl leading-tight text-white">
                            {t('support.quickHelpTitle')}
                        </h2>

                        <div className="flex flex-col gap-8">
                            {QUICK_HELP_INDEXES.map((index) => (
                                <div
                                    key={index}
                                    className="w-full flex items-center justify-between text-white cursor-default"
                                >
                                    <span className="font-medium text-xl leading-9">
                                        {t(`support.quickHelpItems.${index}`)}
                                    </span>
                                    <div className="shrink-0 w-6 h-6 flex items-center justify-center">
                                        <img
                                            src={imgArrowWhite}
                                            alt=""
                                            className="w-6 h-2.5 -rotate-90"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="max-w-6xl mx-auto px-4 sm:px-8 py-20 text-center flex flex-col items-center">
                    <h2 className="font-extrabold text-4xl leading-tight text-sonora-dark mb-8">
                        {t('support.communityTitle')}
                    </h2>

                    <p className="font-bold text-xl max-w-4xl leading-6 text-sonora-dark mb-10">
                        {t('support.communityText')}
                    </p>

                    <Link
                        to="/community"
                        className="w-64 h-12 rounded-full bg-sonora-purple flex items-center justify-center font-semibold text-base text-white cursor-pointer no-underline hover:opacity-90 transition-opacity"
                    >
                        {t('support.communityCta')}
                    </Link>
                </section>
            </main>

            <Footer />
        </div>
    )
}
