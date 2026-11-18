import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'

const SUPPORT_ITEMS: { key: 'help' | 'community' | 'contact'; to?: string }[] = [
    { key: 'help', to: '/support' },
    { key: 'community' },
    { key: 'contact', to: '/support' },
]

const FEATURE_KEYS = ['everyone', 'personal', 'family'] as const

export default function AboutPage() {
    const { t } = useTranslation()

    return (
        <div className="min-h-screen w-full bg-white flex flex-col justify-between text-sonora-dark">
            <Header />

            <main className="flex-1 w-full">
                <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 xl:px-40 pt-14 sm:pt-16 pb-12">
                    <div className="flex flex-col lg:flex-row items-start justify-between gap-12 xl:gap-24">
                        <div className="w-full max-w-2xl flex flex-col">
                            <h1 className="font-extrabold text-4xl leading-tight text-sonora-pink mb-10">
                                {t('about.title')}
                            </h1>

                            <div className="flex flex-col gap-6 font-normal text-lg leading-8 text-sonora-dark mb-20">
                                {(t('about.intro', { returnObjects: true }) as string[]).map((paragraph) => (
                                    <p key={paragraph}>{paragraph}</p>
                                ))}
                            </div>

                            <h2 className="font-extrabold text-4xl leading-tight text-sonora-pink mb-10">
                                {t('about.supportTitle')}
                            </h2>

                            <div className="flex flex-col gap-8 max-w-xl">
                                {SUPPORT_ITEMS.map((item) => (
                                    <div
                                        key={item.key}
                                        className="flex flex-col gap-1 text-lg leading-7 text-sonora-dark"
                                    >
                                        {item.to ? (
                                            <Link
                                                to={item.to}
                                                className="font-bold text-sonora-dark hover:underline"
                                            >
                                                {t(`about.support.${item.key}.title`)}
                                            </Link>
                                        ) : (
                                            <span className="font-bold text-sonora-dark">
                                                {t(`about.support.${item.key}.title`)}
                                            </span>
                                        )}
                                        <p className="font-normal">
                                            {t(`about.support.${item.key}.description`)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <aside className="w-full max-w-sm lg:shrink-0 flex flex-col">
                            <h2 className="font-extrabold text-3xl leading-9 text-sonora-pink mb-8">
                                {t('about.hqTitle')}
                            </h2>

                            <div className="flex flex-col text-lg leading-8 text-sonora-dark mb-16">
                                <p className="font-bold">Sonora</p>
                                <p>{t('about.country')}</p>
                                <p>
                                    {t('about.email')}{' '}
                                    <a
                                        href="mailto:hello@sonora.com"
                                        className="underline hover:opacity-80"
                                    >
                                        hello@sonora.com
                                    </a>
                                </p>
                            </div>

                            <div className="p-10 flex flex-col border-2 border-sonora-pink rounded-3xl">
                                <p className="font-semibold text-sm uppercase tracking-wider text-sonora-dark mb-4">
                                    {t('about.featuresLabel')}
                                </p>

                                <h3 className="font-extrabold text-xl leading-7 text-sonora-dark mb-10">
                                    {t('about.featuresTitle')}
                                </h3>

                                <div className="flex flex-col gap-10">
                                    {FEATURE_KEYS.map((key) => (
                                        <div key={key} className="flex flex-col gap-3">
                                            <h4 className="font-bold text-xl leading-6 text-sonora-pink">
                                                {t(`about.features.${key}.title`)}
                                            </h4>
                                            <p className="font-normal text-base leading-6 text-sonora-dark">
                                                {t(`about.features.${key}.description`)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
