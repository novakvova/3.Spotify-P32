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
        <div className="min-h-screen w-full bg-white flex flex-col justify-between" style={{ color: '#280a3a' }}>
            <Header />

            <main className="flex-1 w-full">
                <div
                    className="mx-auto px-6 sm:px-12 lg:px-16 xl:px-40 pt-14 sm:pt-16 pb-12"
                    style={{ maxWidth: 1440 }}
                >
                    <div className="flex flex-col lg:flex-row items-start justify-between gap-12 xl:gap-24">
                        <div className="w-full flex flex-col" style={{ maxWidth: 633 }}>
                            <h1
                                className="font-extrabold mb-10"
                                style={{ fontSize: 40, lineHeight: '55px', color: '#e869ca' }}
                            >
                                {t('about.title')}
                            </h1>

                            <div
                                className="flex flex-col gap-6 font-normal text-lg mb-20"
                                style={{ lineHeight: '30px', color: '#280a3a' }}
                            >
                                {(t('about.intro', { returnObjects: true }) as string[]).map((paragraph) => (
                                    <p key={paragraph}>{paragraph}</p>
                                ))}
                            </div>

                            <h2
                                className="font-extrabold mb-10"
                                style={{ fontSize: 40, lineHeight: '55px', color: '#e869ca' }}
                            >
                                {t('about.supportTitle')}
                            </h2>

                            <div className="flex flex-col gap-8" style={{ maxWidth: 609 }}>
                                {SUPPORT_ITEMS.map((item) => (
                                    <div
                                        key={item.key}
                                        className="flex flex-col gap-1 text-lg"
                                        style={{ lineHeight: '28px', color: '#280a3a' }}
                                    >
                                        {item.to ? (
                                            <Link
                                                to={item.to}
                                                className="font-bold hover:underline"
                                                style={{ color: '#280a3a' }}
                                            >
                                                {t(`about.support.${item.key}.title`)}
                                            </Link>
                                        ) : (
                                            <span className="font-bold" style={{ color: '#280a3a' }}>
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

                        <aside className="w-full lg:shrink-0 flex flex-col" style={{ maxWidth: 353 }}>
                            <h2
                                className="font-extrabold mb-8"
                                style={{ fontSize: 30, lineHeight: '35px', color: '#e869ca' }}
                            >
                                {t('about.hqTitle')}
                            </h2>

                            <div
                                className="flex flex-col text-lg mb-16"
                                style={{ lineHeight: '30px', color: '#280a3a' }}
                            >
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

                            <div
                                className="p-10 flex flex-col"
                                style={{
                                    minHeight: 645,
                                    border: '2px solid #e869ca',
                                    borderRadius: 30,
                                }}
                            >
                                <p
                                    className="font-semibold text-sm uppercase tracking-wider mb-4"
                                    style={{ color: '#280a3a' }}
                                >
                                    {t('about.featuresLabel')}
                                </p>

                                <h3
                                    className="font-extrabold text-xl mb-10"
                                    style={{ lineHeight: '26px', color: '#280a3a' }}
                                >
                                    {t('about.featuresTitle')}
                                </h3>

                                <div className="flex flex-col gap-10">
                                    {FEATURE_KEYS.map((key) => (
                                        <div key={key} className="flex flex-col gap-3">
                                            <h4
                                                className="font-bold text-xl"
                                                style={{ lineHeight: '24px', color: '#e869ca' }}
                                            >
                                                {t(`about.features.${key}.title`)}
                                            </h4>
                                            <p
                                                className="font-normal text-base"
                                                style={{ lineHeight: '24px', color: '#280a3a' }}
                                            >
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
