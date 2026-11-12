import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Footer } from '../components/Footer'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { logout, selectCurrentUser, selectIsAuthenticated } from '../store/slices/authSlice'
import { selectLanguage, toggleLanguage } from '../store/slices/languageSlice'
import imgLogoSonora from '../assets/home/logo-sonora.png'
import imgCard from '../assets/support/card.svg'
import imgPerson from '../assets/support/person.svg'
import imgSettings from '../assets/support/settings.svg'
import imgBlock from '../assets/support/block.svg'
import imgDevices from '../assets/support/devices.svg'
import imgLock from '../assets/support/lock.svg'
import imgArrowDown from '../assets/support/arrow-down.svg'
import imgArrowWhite from '../assets/support/arrow-white.svg'

interface SubSection {
    id: string
    titleUk: string
    titleEn: string
    articles: { labelUk: string; labelEn: string; to?: string }[]
}

interface HelpCategory {
    id: string
    titleUk: string
    titleEn: string
    icon: string
    iconHeight: number
    subSections: SubSection[]
}

const HELP_CATEGORIES: HelpCategory[] = [
    {
        id: 'payments',
        titleUk: 'Платежі й виставлення рахунків',
        titleEn: 'Payments & billing',
        icon: imgCard,
        iconHeight: 20,
        subSections: [
            {
                id: 'recommended',
                titleUk: 'Рекомендовані теми',
                titleEn: 'Recommended topics',
                articles: [
                    { labelUk: 'Допомога в разі помилки оплати', labelEn: 'Failed payment help' },
                    { labelUk: 'Стягнуто забагато коштів', labelEn: 'Charged too much' },
                ],
            },
            {
                id: 'manage-payments',
                titleUk: 'Керування платежами',
                titleEn: 'Manage payments',
                articles: [
                    { labelUk: 'Підтримувані способи оплати', labelEn: 'Supported payment methods', to: '/support/payment-methods' },
                    { labelUk: 'Оплата Sonora за допомогою PayPal', labelEn: 'Paying for Sonora with PayPal' },
                    { labelUk: 'Оплата Sonora за допомогою Google Play Billing', labelEn: 'Paying for Sonora with Google Play Billing' },
                ],
            },
            {
                id: 'payment-methods',
                titleUk: 'Способи оплати',
                titleEn: 'Payment methods',
                articles: [
                    { labelUk: 'Підтримувані способи оплати', labelEn: 'Supported payment methods', to: '/support/payment-methods' },
                    { labelUk: 'Як змінити платіжні дані', labelEn: 'How to update payment details' },
                ],
            },
            {
                id: 'billing-help',
                titleUk: 'Довідка щодо списання коштів',
                titleEn: 'Charge help',
                articles: [
                    { labelUk: 'Політика відшкодування', labelEn: 'Refund policy' },
                    { labelUk: 'Перевірка квитанцій та рахунків', labelEn: 'Check receipts and invoices' },
                ],
            },
        ],
    },
    {
        id: 'account',
        titleUk: 'Керуйте своїм акаунтом',
        titleEn: 'Manage your account',
        icon: imgPerson,
        iconHeight: 25,
        subSections: [
            {
                id: 'account-login',
                titleUk: 'Вхід та безпека акаунту',
                titleEn: 'Login & account security',
                articles: [
                    { labelUk: 'Не вдається увійти в акаунт Sonora', labelEn: 'Can’t log in to Sonora account' },
                    { labelUk: 'Скидання або зміна пароля', labelEn: 'Reset or change password' },
                    { labelUk: 'Налаштування профілю', labelEn: 'Profile settings' },
                ],
            },
        ],
    },
    {
        id: 'premium',
        titleUk: 'Преміум підписки',
        titleEn: 'Premium plans',
        icon: imgSettings,
        iconHeight: 25,
        subSections: [
            {
                id: 'premium-plans',
                titleUk: 'Доступні плани Premium',
                titleEn: 'Available Premium plans',
                articles: [
                    { labelUk: 'Підписка Premium Individual', labelEn: 'Premium Individual plan', to: '/premium' },
                    { labelUk: 'Підписка Premium Duo', labelEn: 'Premium Duo plan', to: '/premium/duo' },
                    { labelUk: 'Підписка Premium Family', labelEn: 'Premium Family plan', to: '/premium/family' },
                    { labelUk: 'Підписка Premium Student', labelEn: 'Premium Student plan', to: '/premium/student' },
                    { labelUk: 'Підписка Sonora Kids+', labelEn: 'Sonora Kids+ plan', to: '/premium/kids' },
                ],
            },
        ],
    },
    {
        id: 'features',
        titleUk: 'Функції в додатку',
        titleEn: 'In-app features',
        icon: imgBlock,
        iconHeight: 25,
        subSections: [
            {
                id: 'app-features',
                titleUk: 'Основні можливості',
                titleEn: 'Core features',
                articles: [
                    { labelUk: 'Пошук треків, альбомів та виконавців', labelEn: 'Search songs, albums, and artists' },
                    { labelUk: 'Перегляд музичних жанрів', labelEn: 'Browse music genres' },
                ],
            },
        ],
    },
    {
        id: 'devices',
        titleUk: 'Пристрої та усунення несправностей',
        titleEn: 'Devices & troubleshooting',
        icon: imgDevices,
        iconHeight: 20,
        subSections: [
            {
                id: 'devices-help',
                titleUk: 'Підтримувані платформи',
                titleEn: 'Supported platforms',
                articles: [
                    { labelUk: 'Використання вебпрогравача Sonora', labelEn: 'Using Sonora Web Player' },
                    { labelUk: 'Підтримувані способи оплати', labelEn: 'Supported payment methods', to: '/support/payment-methods' },
                ],
            },
        ],
    },
    {
        id: 'security',
        titleUk: 'Безпека й конфіденційність',
        titleEn: 'Safety & privacy',
        icon: imgLock,
        iconHeight: 25,
        subSections: [
            {
                id: 'security-help',
                titleUk: 'Захист даних',
                titleEn: 'Data protection',
                articles: [
                    { labelUk: 'Захист вашого облікового запису', labelEn: 'Protecting your account' },
                    { labelUk: 'Про компанію Sonora', labelEn: 'About Sonora', to: '/about' },
                ],
            },
        ],
    },
]

const QUICK_HELP_ITEMS = [
    { uk: 'Не вдається увійти в акаунт Spotify', en: 'Can’t log in to Spotify account' },
    { uk: 'Допомога в разі помилки оплати', en: 'Failed payment help' },
    { uk: 'Стягнуто забагато коштів', en: 'Charged too much' },
    { uk: 'Запрошуйте або вилучайте учасників підписки Family', en: 'Invite or remove Family plan members' },
    { uk: 'Як змінити платіжні дані', en: 'How to update payment details' },
]

export const SupportHeader: React.FC = () => {
    const dispatch = useAppDispatch()
    const isAuthenticated = useAppSelector(selectIsAuthenticated)
    const user = useAppSelector(selectCurrentUser)
    const lang = useAppSelector(selectLanguage)
    const isEn = lang === 'en'
    const displayName = user?.fullName || user?.username || user?.email || (isEn ? 'Profile' : 'Профіль')
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
                        {isEn ? 'Install App' : 'Установити додаток'}
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
                                {isEn ? 'Log out' : 'Вийти'}
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/register"
                                className="font-semibold text-base text-white hover:opacity-80 transition-opacity"
                            >
                                {isEn ? 'Sign up' : 'Зареєструватися'}
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
                                {isEn ? 'Log in' : 'Увійти'}
                            </Link>
                        </>
                    )}

                    <button
                        type="button"
                        onClick={() => dispatch(toggleLanguage())}
                        className="font-normal text-sm text-white cursor-pointer hover:opacity-80 transition-opacity"
                    >
                        {isEn ? 'Eng' : 'Укр'}
                    </button>
                </div>
            </div>
        </header>
    )
}

export default function SupportPage() {
    const lang = useAppSelector(selectLanguage)
    const isEn = lang === 'en'
    const [aiQuery, setAiQuery] = useState('')
    const [aiSubmitted, setAiSubmitted] = useState(false)
    const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({})
    const [openSubSections, setOpenSubSections] = useState<Record<string, boolean>>({
        'manage-payments': true,
        'payment-methods': true,
        'account-login': true,
        'premium-plans': true,
        'app-features': true,
        'devices-help': true,
        'security-help': true,
    })

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
                        <span style={{ fontSize: 40 }}>{isEn ? 'Support ' : 'Підтримка '}</span>
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
                                        {isEn ? 'How can I help you?' : 'Чим я можу допомогти?'}
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
                                    {isEn ? 'Send request' : 'Надіслати запит'}
                                </button>
                            </div>
                        </form>

                        <p className="mt-3 text-base font-normal" style={{ lineHeight: '30px' }}>
                            {isEn ? 'You are using an AI-powered tool' : 'Ви використовуєте інструмент на основі ШІ'}
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
                                <p className="font-bold mb-1">
                                    {isEn ? 'Your request has been received!' : 'Ваш запит прийнято в обробку!'}
                                </p>
                                <p className="font-normal mb-3">
                                    {isEn
                                        ? 'While we review your inquiry, check out our help article on payments and payment methods:'
                                        : 'Поки ми перевіряємо деталі вашого звернення, перегляньте довідкову статтю щодо платежів та способів оплати:'}
                                </p>
                                <Link
                                    to="/support/payment-methods"
                                    className="font-bold underline"
                                    style={{ color: '#6829c6' }}
                                >
                                    {isEn
                                        ? 'Go to “Supported payment methods”'
                                        : 'Перейти до статті «Підтримувані способи оплати»'}
                                </Link>
                            </div>
                        )}
                    </div>
                </section>

                <section className="mx-auto px-4 sm:px-8 pt-6 pb-20" style={{ maxWidth: 1101 }}>
                    <div className="mx-auto mb-12" style={{ maxWidth: 725 }}>
                        <h2 className="font-semibold" style={{ fontSize: 30, lineHeight: '50px' }}>
                            {isEn ? 'Browse help articles' : 'Огляд довідкових статей'}
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
                                                {isEn ? category.titleEn : category.titleUk}
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
                                                                {isEn ? sub.titleEn : sub.titleUk}
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
                                                                {sub.articles.map((article) => {
                                                                    const text = isEn ? article.labelEn : article.labelUk
                                                                    return article.to ? (
                                                                        <Link
                                                                            key={article.labelUk}
                                                                            to={article.to}
                                                                            className="font-medium text-xl hover:underline transition-opacity"
                                                                            style={{ lineHeight: '30px', color: '#280a3a' }}
                                                                        >
                                                                            {text}
                                                                        </Link>
                                                                    ) : (
                                                                        <span
                                                                            key={article.labelUk}
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
                            {isEn ? 'Quick help' : 'Експрес-довідка'}
                        </h2>

                        <div className="flex flex-col" style={{ gap: 35 }}>
                            {QUICK_HELP_ITEMS.map((item) => (
                                <div
                                    key={item.uk}
                                    className="w-full flex items-center justify-between text-white cursor-default"
                                >
                                    <span className="font-medium text-xl" style={{ lineHeight: '35px' }}>
                                        {isEn ? item.en : item.uk}
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
                        {isEn ? 'Visit our community' : 'Завітайте до нашої спільноти'}
                    </h2>

                    <p
                        className="font-bold text-xl mb-10"
                        style={{ maxWidth: 914, lineHeight: '25px', color: '#280a3a' }}
                    >
                        {isEn
                            ? 'Have questions? Find answers from our worldwide community of expert fans'
                            : 'Маєте запитання? Знайдіть на них відповіді, порадившись із нашою спільнотою досвідчених фанів з усього світу'}
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
                        {isEn ? 'Go to community' : 'Перейти в спільноту'}
                    </Link>
                </section>
            </main>

            <Footer />
        </div>
    )
}
