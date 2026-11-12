import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Footer } from '../components/Footer'
import { SupportHeader } from './SupportPage'
import { useAppSelector } from '../store/hooks'
import { selectLanguage } from '../store/slices/languageSlice'
import imgArrowDown from '../assets/support/arrow-down.svg'
import imgArrowWhite from '../assets/support/arrow-white.svg'

const RELATED_ARTICLES = [
    { uk: 'Допомога в разі помилки оплати', en: 'Failed payment help' },
    { uk: 'Зміна платіжних даних', en: 'Updating payment details' },
    { uk: 'Перехід на іншу підписку Premium', en: 'Switching to another Premium plan' },
    { uk: 'Зміна налаштувань країни або регіону', en: 'Changing country or region settings' },
    { uk: 'Політика відшкодування', en: 'Refund policy' },
]

export default function SupportPaymentMethodsPage() {
    const lang = useAppSelector(selectLanguage)
    const isEn = lang === 'en'
    const [aiQuery, setAiQuery] = useState('')
    const [aiSubmitted, setAiSubmitted] = useState(false)
    const hasQuery = aiQuery.trim().length > 0

    const handleSendQuery = (e: React.FormEvent) => {
        e.preventDefault()
        if (!hasQuery) return
        setAiSubmitted(true)
    }

    return (
        <div className="min-h-screen w-full bg-white flex flex-col justify-between" style={{ color: '#280a3a' }}>
            <SupportHeader />

            <main className="flex-1 w-full">
                <div className="mx-auto px-4 sm:px-8 pt-7 pb-12" style={{ maxWidth: 727 }}>
                    <div className="flex items-center gap-2 mb-8">
                        <Link
                            to="/support"
                            className="font-semibold text-base hover:underline"
                            style={{ color: '#280a3a' }}
                        >
                            {isEn ? 'Home' : 'Головна'}
                        </Link>
                        <img
                            src={imgArrowDown}
                            alt=""
                            style={{
                                width: 15,
                                height: 8,
                                transform: 'rotate(-90deg)',
                            }}
                        />
                    </div>

                    <div className="mb-12">
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
                                className="mt-4 p-4 text-base text-white"
                                style={{
                                    borderRadius: 20,
                                    backgroundColor: '#aa71ff',
                                }}
                            >
                                <p className="font-bold">
                                    {isEn
                                        ? 'Your request has been sent to Sonora Support!'
                                        : 'Ваш запит надіслано до служби підтримки Sonora!'}
                                </p>
                            </div>
                        )}
                    </div>

                    <div
                        className="w-full flex items-center justify-between px-7 py-4 mb-8 cursor-default text-white"
                        style={{
                            minHeight: 84,
                            backgroundColor: '#aa71ff',
                            borderRadius: 30,
                        }}
                    >
                        <div className="flex items-center gap-5">
                            <div className="relative shrink-0" style={{ width: 50, height: 50 }}>
                                <div
                                    className="absolute"
                                    style={{
                                        left: 10,
                                        top: 0,
                                        width: 40,
                                        height: 40,
                                        borderRadius: 12,
                                        backgroundColor: '#6829c6',
                                        transform: 'rotate(12deg)',
                                    }}
                                />
                                <div
                                    className="absolute flex items-center justify-center"
                                    style={{
                                        left: 0,
                                        top: 8,
                                        width: 40,
                                        height: 40,
                                        borderRadius: 12,
                                        backgroundColor: '#280a3a',
                                    }}
                                >
                                    <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 25 25"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M2.08333 25C2.08333 25 0 25 0 22.9167C0 20.8333 2.08333 14.5833 12.5 14.5833C22.9167 14.5833 25 20.8333 25 22.9167C25 25 22.9167 25 22.9167 25H2.08333ZM12.5 12.5C14.1576 12.5 15.7473 11.8415 16.9194 10.6694C18.0915 9.49731 18.75 7.9076 18.75 6.25C18.75 4.5924 18.0915 3.00269 16.9194 1.83058C15.7473 0.65848 14.1576 0 12.5 0C10.8424 0 9.25268 0.65848 8.08058 1.83058C6.90848 3.00269 6.25 4.5924 6.25 6.25C6.25 7.9076 6.90848 9.49731 8.08058 10.6694C9.25268 11.8415 10.8424 12.5 12.5 12.5Z"
                                            fill="white"
                                        />
                                    </svg>
                                </div>
                            </div>

                            <div className="flex flex-col text-white">
                                <span className="font-bold text-base" style={{ lineHeight: '24px' }}>
                                    {isEn ? 'Manage account' : 'Керування акаунтом'}
                                </span>
                                <span className="font-normal text-base" style={{ lineHeight: '24px' }}>
                                    {isEn ? 'Profile, payments, and more' : 'Профіль, оплата тощо'}
                                </span>
                            </div>
                        </div>

                        <img
                            src={imgArrowWhite}
                            alt=""
                            style={{
                                width: 22,
                                height: 10,
                                transform: 'rotate(-90deg)',
                            }}
                        />
                    </div>

                    <article
                        className="p-7 sm:p-10 mb-12 flex flex-col justify-between text-white"
                        style={{
                            minHeight: 600,
                            backgroundColor: '#aa71ff',
                            borderRadius: 30,
                        }}
                    >
                        <div className="flex flex-col gap-8">
                            <h1
                                className="font-extrabold text-white"
                                style={{ fontSize: 36, lineHeight: '45px' }}
                            >
                                {isEn ? 'Supported payment methods' : 'Підтримувані способи оплати'}
                            </h1>

                            <p className="font-bold text-xl text-white" style={{ lineHeight: '28px' }}>
                                {isEn
                                    ? 'There are several ways to pay for Sonora Premium'
                                    : 'Існує кілька способів оплати підписки Sonora Premium'}
                            </p>

                            <p className="text-base text-white" style={{ lineHeight: '25px' }}>
                                <span className="font-bold">{isEn ? 'Note.' : 'Примітка.'}</span>{' '}
                                {isEn
                                    ? 'We offer different payment methods depending on the country or region you are in.'
                                    : 'Ми пропонуємо різні способи оплати залежно від країни чи регіону, у яких ви перебуваєте.'}
                            </p>

                            <div className="flex flex-col gap-3 text-base text-white" style={{ lineHeight: '25px' }}>
                                <p className="font-semibold">
                                    {isEn
                                        ? 'To view available payment methods for your location:'
                                        : 'Щоб переглянути доступні способи оплати для вашого місцезнаходження:'}
                                </p>
                                <ol className="list-decimal pl-5 flex flex-col gap-1 font-normal">
                                    <li>
                                        {isEn ? 'Open ' : 'Відкрийте сторінку '}
                                        <Link
                                            to="/premium"
                                            className="underline font-bold text-white hover:opacity-85"
                                        >
                                            http://sonora.com/premium
                                        </Link>
                                        .
                                    </li>
                                    <li>{isEn ? 'Choose a Premium plan.' : 'Виберіть підписку Premium.'}</li>
                                </ol>
                            </div>

                            <p className="text-base font-normal text-white" style={{ lineHeight: '25px' }}>
                                {isEn
                                    ? 'All payment methods for your account in your location will be listed on the next page.'
                                    : 'Всі способи оплати для вашого акаунту за вашим місцезнаходженням будуть наведені на наступній сторінці.'}
                            </p>

                            <p className="text-base text-white" style={{ lineHeight: '25px' }}>
                                <span className="font-bold">{isEn ? 'Note.' : 'Примітка.'}</span>{' '}
                                {isEn
                                    ? 'You will not be charged until you submit your payment details.'
                                    : 'З вас не списуватимуться кошти, доки ви не надасте платіжні відомості.'}
                            </p>
                        </div>
                    </article>

                    <section
                        className="p-7 sm:p-8 flex flex-col justify-between text-white"
                        style={{
                            minHeight: 310,
                            backgroundColor: '#aa71ff',
                            borderRadius: 30,
                        }}
                    >
                        <h2 className="font-bold text-xl mb-6 text-white" style={{ lineHeight: '28px' }}>
                            {isEn ? 'Related articles' : 'Схожі статті'}
                        </h2>

                        <div className="flex flex-col gap-5">
                            {RELATED_ARTICLES.map((item) => (
                                <span
                                    key={item.uk}
                                    className="font-medium text-base text-white cursor-default"
                                    style={{ lineHeight: '22px' }}
                                >
                                    {isEn ? item.en : item.uk}
                                </span>
                            ))}
                        </div>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    )
}
