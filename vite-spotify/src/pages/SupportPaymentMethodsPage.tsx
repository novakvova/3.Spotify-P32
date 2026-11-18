import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Footer } from '../components/Footer'
import { SupportHeader } from './SupportPage'
import { useTranslation } from 'react-i18next'
import imgArrowDown from '../assets/support/arrow-down.svg'
import imgArrowWhite from '../assets/support/arrow-white.svg'

const ARTICLE_INDEXES = [0, 1, 2, 3, 4] as const

export default function SupportPaymentMethodsPage() {
    const { t } = useTranslation()
    const [aiQuery, setAiQuery] = useState('')
    const [aiSubmitted, setAiSubmitted] = useState(false)
    const hasQuery = aiQuery.trim().length > 0

    const handleSendQuery = (e: React.FormEvent) => {
        e.preventDefault()
        if (!hasQuery) return
        setAiSubmitted(true)
    }

    return (
        <div className="min-h-screen w-full bg-white flex flex-col justify-between text-sonora-dark">
            <SupportHeader />

            <main className="flex-1 w-full">
                <div className="max-w-3xl mx-auto px-4 sm:px-8 pt-7 pb-12">
                    <div className="flex items-center gap-2 mb-8">
                        <Link
                            to="/support"
                            className="font-semibold text-base text-sonora-dark hover:underline"
                        >
                            {t('supportPayment.home')}
                        </Link>
                        <img
                            src={imgArrowDown}
                            alt=""
                            className="w-3.5 h-2 -rotate-90"
                        />
                    </div>

                    <div className="mb-12">
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
                            <div className="mt-4 p-4 text-base text-white rounded-2xl bg-sonora-light">
                                <p className="font-bold">
                                    {t('supportPayment.sent')}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="w-full min-h-20 bg-sonora-light rounded-3xl flex items-center justify-between px-7 py-4 mb-8 cursor-default text-white">
                        <div className="flex items-center gap-5">
                            <div className="relative shrink-0 w-12 h-12">
                                <div className="absolute left-2.5 top-0 w-10 h-10 rounded-xl bg-sonora-purple rotate-12" />
                                <div className="absolute left-0 top-2 w-10 h-10 rounded-xl bg-sonora-dark flex items-center justify-center">
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
                                <span className="font-bold text-base leading-6">
                                    {t('supportPayment.manageTitle')}
                                </span>
                                <span className="font-normal text-base leading-6">
                                    {t('supportPayment.manageText')}
                                </span>
                            </div>
                        </div>

                        <img
                            src={imgArrowWhite}
                            alt=""
                            className="w-5 h-2.5 -rotate-90"
                        />
                    </div>

                    <article className="p-7 sm:p-10 mb-12 flex flex-col justify-between text-white bg-sonora-light rounded-3xl">
                        <div className="flex flex-col gap-8">
                            <h1 className="font-extrabold text-4xl leading-tight text-white">
                                {t('supportPayment.title')}
                            </h1>

                            <p className="font-bold text-xl leading-7 text-white">
                                {t('supportPayment.intro')}
                            </p>

                            <p className="text-base leading-6 text-white">
                                <span className="font-bold">{t('supportPayment.note')}</span>{' '}
                                {t('supportPayment.noteRegion')}
                            </p>

                            <div className="flex flex-col gap-3 text-base leading-6 text-white">
                                <p className="font-semibold">
                                    {t('supportPayment.howTo')}
                                </p>
                                <ol className="list-decimal pl-5 flex flex-col gap-1 font-normal">
                                    <li>
                                        {t('supportPayment.step1Open')}
                                        <Link
                                            to="/premium"
                                            className="underline font-bold text-white hover:opacity-85"
                                        >
                                            http://sonora.com/premium
                                        </Link>
                                        .
                                    </li>
                                    <li>{t('supportPayment.step2')}</li>
                                </ol>
                            </div>

                            <p className="text-base font-normal leading-6 text-white">
                                {t('supportPayment.listed')}
                            </p>

                            <p className="text-base leading-6 text-white">
                                <span className="font-bold">{t('supportPayment.note')}</span>{' '}
                                {t('supportPayment.noteCharge')}
                            </p>
                        </div>
                    </article>

                    <section className="p-7 sm:p-8 flex flex-col justify-between text-white bg-sonora-light rounded-3xl">
                        <h2 className="font-bold text-xl leading-7 mb-6 text-white">
                            {t('supportPayment.related')}
                        </h2>

                        <div className="flex flex-col gap-5">
                            {ARTICLE_INDEXES.map((index) => (
                                <span
                                    key={index}
                                    className="font-medium text-base leading-6 text-white cursor-default"
                                >
                                    {t(`supportPayment.articles.${index}`)}
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
