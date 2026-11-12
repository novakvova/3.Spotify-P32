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

// Текст береться з i18n (support.categories), тут лишаються ідентифікатори, іконки і посилання.
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
    iconHeight: number
    subSections: SubSection[]
}

const HELP_CATEGORIES: HelpCategory[] = [
    {
        id: 'payments',
        icon: imgCard,
        iconHeight: 20,
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
        iconHeight: 25,
        subSections: [{ id: 'account-login', articles: [{}, {}, {}] }],
    },
    {
        id: 'premium',
        icon: imgSettings,
        iconHeight: 25,
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
        iconHeight: 25,
        subSections: [{ id: 'app-features', articles: [{}, {}] }],
    },
    {
        id: 'devices',
        icon: imgDevices,
        iconHeight: 20,
        subSections: [{ id: 'devices-help', articles: [{}, { to: '/support/payment-methods' }] }],
    },
    {
        id: 'security',
        icon: imgLock,
        iconHeight: 25,
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
        <header className="w-full" style={{ backgroundColor: '#280a3a' }}>
            <div
                className="mx-auto flex items-center justify-between px-4 sm:px-8 lg:px-16 xl:px-40"
                style={{ maxWidth: 1440, height: 75 }}
            >
                <div className="flex items-center gap-8">
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
                                src={imgLogoSonora}
                            />
                        </div>
                    </Link>

                    <span className="hidden sm:inline-block font-semibold text-base text-white cursor-default">
                        {t('support.installApp')}
                    </span>
                </div>

                <div className="flex items-center gap-6 sm:gap-12">
                    {isAuthenticated ? (
                        <>
                            <Link
                                to="/me"
                                className="flex items-center gap-2.5 font-semibold text-base text-white hover:opacity-80 transition-opacity"
                            >
                                <span
                                    className="rounded-full flex items-center justify-center font-bold text-sm text-black bg-white shrink-0"
                                    style={{ width: 32, height: 32 }}
                                >
                                    {userInitial}
                                </span>
                                <span>{displayName}</span>
                            </Link>
                            <button
                                type="button"
                                onClick={() => dispatch(logout())}
                                className="flex items-center justify-center font-semibold text-sm text-white cursor-pointer hover:opacity-90 transition-opacity"
                                style={{
                                    backgroundColor: '#6829c6',
                                    width: 120,
                                    height: 45,
                                    borderRadius: 35,
                                }}
                            >
                                {t('support.logOut')}
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/register"
                                className="font-semibold text-base text-white hover:opacity-80 transition-opacity"
                            >
                                {t('support.signUp')}
                            </Link>
                            <Link
                                to="/login"
                                className="flex items-center justify-center font-semibold text-sm text-white hover:opacity-90 transition-opacity"
                                style={{
                                    backgroundColor: '#6829c6',
                                    width: 120,
                                    height: 45,
                                    borderRadius: 35,
                                }}
                            >
                                {t('support.logIn')}
                            </Link>
                        </>
                    )}

                    <button
                        type="button"
                        onClick={() => dispatch(toggleLanguage())}
                        className="font-normal text-sm text-white cursor-pointer hover:opacity-80 transition-opacity"
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
        <div className="min-h-screen w-full bg-white flex flex-col justify-between" style={{ color: '#280a3a' }}>
            <SupportHeader />

            <main className="flex-1 w-full">
                <section className="mx-auto px-4 sm:px-8 pt-14 sm:pt-16 pb-12" style={{ maxWidth: 1101 }}>
                    <h1 className="font-extrabold text-center mb-10" style={{ lineHeight: '55px' }}>
                        <span style={{ fontSize: 40 }}>{t('support.title')} </span>
                        <span style={{ fontSize: 48 }}>Sonora</span>
                    </h1>

                    <div className="mx-auto" style={{ maxWidth: 725 }}>
                        <form
                            onSubmit={handleSendQuery}
                            className="relative flex flex-col justify-between p-6"
                            style={{
                                minHeight: 180,
                                border: '2px solid #280a3a',
                                borderRadius: 30,
                            }}
                        >
                            <div className="relative w-full">
                                {!aiQuery && (
                                    <span
                                        className="absolute left-0 top-0 pointer-events-none select-none font-bold text-base"
                                        style={{ color: '#280a3a', lineHeight: '25px' }}
                                    >
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
                                    className="relative w-full resize-none bg-transparent font-bold text-base outline-none"
                                    style={{
                                        color: '#280a3a',
                                        lineHeight: '25px',
                                    }}
                                />
                            </div>

                            <div className="flex items-center justify-end mt-3">
                                <button
                                    type="submit"
                                    disabled={!hasQuery}
                                    className="font-semibold text-sm text-white transition-opacity"
                                    style={{
                                        backgroundColor: '#6829c6',
                                        width: 150,
                                        height: 40,
                                        borderRadius: 35,
                                        opacity: hasQuery ? 1 : 0.5,
                                        cursor: hasQuery ? 'pointer' : 'default',
                                    }}
                                >
                                    {t('support.send')}
                                </button>
                            </div>
                        </form>

                        <p className="mt-3 text-base font-normal" style={{ lineHeight: '30px' }}>
                            {t('support.aiNote')}
                        </p>

                        {aiSubmitted && (
                            <div
                                className="mt-4 p-5 text-base"
                                style={{
                                    borderRadius: 20,
                                    border: '1px solid #aa71ff',
                                    backgroundColor: '#f8f4ff',
                                }}
                            >
                                <p className="font-bold mb-1">{t('support.receivedTitle')}</p>
                                <p className="font-normal mb-3">{t('support.receivedText')}</p>
                                <Link
                                    to="/support/payment-methods"
                                    className="font-bold underline"
                                    style={{ color: '#6829c6' }}
                                >
                                    {t('support.receivedLink')}
                                </Link>
                            </div>
                        )}
                    </div>
                </section>

                <section className="mx-auto px-4 sm:px-8 pt-6 pb-20" style={{ maxWidth: 1101 }}>
                    <div className="mx-auto mb-12" style={{ maxWidth: 725 }}>
                        <h2 className="font-semibold" style={{ fontSize: 30, lineHeight: '50px' }}>
                            {t('support.browseTitle')}
                        </h2>
                    </div>

                    <div className="flex flex-col" style={{ gap: 40 }}>
                        {HELP_CATEGORIES.map((category) => {
                            const isOpen = !!openCategories[category.id]
                            return (
                                <div key={category.id} className="w-full flex flex-col">
                                    <button
                                        type="button"
                                        onClick={() => toggleCategory(category.id)}
                                        className="w-full flex items-center justify-between cursor-pointer text-left py-1 hover:opacity-80 transition-opacity"
                                        style={{ gap: 20 }}
                                    >
                                        <div className="flex items-center" style={{ gap: 20 }}>
                                            <div
                                                className="relative shrink-0 flex items-center justify-center"
                                                style={{ width: 25, height: category.iconHeight }}
                                            >
                                                <img
                                                    src={category.icon}
                                                    alt=""
                                                    className="block max-w-none w-full h-full"
                                                />
                                            </div>
                                            <span
                                                className="font-bold text-xl"
                                                style={{ lineHeight: '35px', color: '#280a3a' }}
                                            >
                                                {t(`support.categories.${category.id}.title`)}
                                            </span>
                                        </div>

                                        <div
                                            className="relative shrink-0 transition-transform duration-200"
                                            style={{
                                                width: 25,
                                                height: 10,
                                                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                            }}
                                        >
                                            <img
                                                src={imgArrowDown}
                                                alt=""
                                                className="block w-full h-full"
                                            />
                                        </div>
                                    </button>

                                    {isOpen && (
                                        <div
                                            className="flex flex-col pl-6 sm:pl-11 pt-8"
                                            style={{ gap: 32 }}
                                        >
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
                                                            <span
                                                                className="font-bold text-xl"
                                                                style={{ lineHeight: '30px', color: '#280a3a' }}
                                                            >
                                                                {t(`${base}.title`)}
                                                            </span>
                                                            <div
                                                                className="relative shrink-0 transition-transform duration-200"
                                                                style={{
                                                                    width: 25,
                                                                    height: 10,
                                                                    transform: isSubOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                                                }}
                                                            >
                                                                <img
                                                                    src={imgArrowDown}
                                                                    alt=""
                                                                    className="block w-full h-full"
                                                                />
                                                            </div>
                                                        </button>

                                                        {isSubOpen && (
                                                            <div
                                                                className="flex flex-col pt-4"
                                                                style={{ gap: 20 }}
                                                            >
                                                                {sub.articles.map((article, idx) => {
                                                                    const text = t(`${base}.articles.${idx}`)
                                                                    return article.to ? (
                                                                        <Link
                                                                            key={idx}
                                                                            to={article.to}
                                                                            className="font-medium text-xl hover:underline transition-opacity"
                                                                            style={{ lineHeight: '30px', color: '#280a3a' }}
                                                                        >
                                                                            {text}
                                                                        </Link>
                                                                    ) : (
                                                                        <span
                                                                            key={idx}
                                                                            className="font-medium text-xl cursor-default"
                                                                            style={{ lineHeight: '30px', color: '#280a3a' }}
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

                <section className="w-full py-10" style={{ backgroundColor: '#aa71ff', minHeight: 400 }}>
                    <div className="mx-auto px-4 sm:px-8 flex flex-col" style={{ maxWidth: 1101, gap: 40 }}>
                        <h2
                            className="font-extrabold text-white"
                            style={{ fontSize: 30, lineHeight: '50px' }}
                        >
                            {t('support.quickHelpTitle')}
                        </h2>

                        <div className="flex flex-col" style={{ gap: 35 }}>
                            {QUICK_HELP_INDEXES.map((index) => (
                                <div
                                    key={index}
                                    className="w-full flex items-center justify-between text-white cursor-default"
                                >
                                    <span className="font-medium text-xl" style={{ lineHeight: '35px' }}>
                                        {t(`support.quickHelpItems.${index}`)}
                                    </span>
                                    <div
                                        className="shrink-0 flex items-center justify-center"
                                        style={{ width: 25, height: 25 }}
                                    >
                                        <img
                                            src={imgArrowWhite}
                                            alt=""
                                            style={{
                                                width: 25,
                                                height: 10,
                                                transform: 'rotate(-90deg)',
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="mx-auto px-4 sm:px-8 py-20 text-center flex flex-col items-center" style={{ maxWidth: 1100 }}>
                    <h2
                        className="font-extrabold mb-8"
                        style={{ fontSize: 40, lineHeight: '55px', color: '#280a3a' }}
                    >
                        {t('support.communityTitle')}
                    </h2>

                    <p
                        className="font-bold text-xl mb-10"
                        style={{ maxWidth: 914, lineHeight: '25px', color: '#280a3a' }}
                    >
                        {t('support.communityText')}
                    </p>

                    <Link
                        to="/community"
                        className="flex items-center justify-center font-semibold text-base text-white cursor-pointer no-underline"
                        style={{
                            backgroundColor: '#6829c6',
                            width: 255,
                            height: 50,
                            borderRadius: 35,
                        }}
                    >
                        {t('support.communityCta')}
                    </Link>
                </section>
            </main>

            <Footer />
        </div>
    )
}
