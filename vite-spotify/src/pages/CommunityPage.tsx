import React from 'react'
import { useTranslation } from 'react-i18next'
import { Header } from '../components/Header.tsx'
import creatorHeroBg from '../assets/home/creator-hero-bg.png'
import audienceFeatureImg from '../assets/home/audience-feature.png'
import monetizeFeatureImg from '../assets/home/monetize-feature.png'
import standOutFeatureImg from '../assets/home/stand-out-feature.png'
import { Footer } from '../components/Footer.tsx'

const FEATURE_BLOCKS = [
    { key: 'audience', img: audienceFeatureImg, reverse: false },
    { key: 'monetize', img: monetizeFeatureImg, reverse: true },
    { key: 'standOut', img: standOutFeatureImg, reverse: false },
] as const

const CARD_KEYS = ['audio', 'video'] as const

export const CommunityPage: React.FC = () => {
    const { t } = useTranslation()

    return (
        <div className="min-h-screen bg-white text-sonora-deep overflow-x-hidden">
            <div className="bg-sonora-deep text-white">
                <Header />

                {/* First Hero Section */}
                <section className="relative w-full flex items-center overflow-hidden bg-sonora-deep">
                    <div className="absolute inset-0 z-0 flex justify-end items-start pointer-events-none">
                        <img
                            src={creatorHeroBg}
                            alt={t('community.heroAlt')}
                            className="w-full lg:w-auto h-full object-cover lg:object-contain object-top object-right"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-sonora-deep via-sonora-deep/80 lg:via-sonora-deep/40 to-transparent" />
                    </div>

                    <div className="relative z-10 max-w-7xl mx-auto w-full px-6 sm:px-12 lg:px-16 py-16 lg:py-24 flex items-center">
                        <div className="max-w-xl space-y-6">
                            <h1 className="font-inter text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                                {t('community.heroTitle')}
                            </h1>
                            <p className="text-base sm:text-lg font-normal text-gray-200 leading-relaxed opacity-95 max-w-lg">
                                {t('community.heroText')}
                            </p>
                        </div>
                    </div>
                </section>
            </div>

            {/* Features Section */}
            <section className="bg-sonora-gray text-sonora-deep py-16 lg:py-24 px-6 sm:px-12 lg:px-16">
                <div className="max-w-6xl mx-auto space-y-16 lg:space-y-24">
                    <div className="text-center">
                        <h2 className="font-inter text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-sonora-deep">
                            {t('community.featuresTitle')}
                        </h2>
                    </div>

                    {FEATURE_BLOCKS.map((block) => (
                        <div
                            key={block.key}
                            className={`flex flex-col ${
                                block.reverse ? 'md:flex-row-reverse' : 'md:flex-row'
                            } items-center justify-between gap-12 lg:gap-20`}
                        >
                            <div className="w-full md:w-1/2 flex justify-center shrink-0">
                                <img
                                    src={block.img}
                                    alt={t(`community.${block.key}.alt`)}
                                    className="w-full max-w-md h-auto object-contain"
                                />
                            </div>
                            <div className="w-full md:w-1/2 space-y-6 text-left">
                                <h3 className="font-inter text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-snug text-sonora-deep">
                                    {t(`community.${block.key}.title`)}
                                </h3>
                                <p className="text-gray-700 text-base sm:text-lg font-medium leading-relaxed max-w-lg">
                                    {t(`community.${block.key}.text`)}
                                </p>
                                <div className="pt-2">
                                    <button className="border-2 border-sonora-deep text-sonora-deep font-extrabold py-3.5 px-10 rounded-full hover:bg-sonora-deep hover:text-white transition shadow-sm cursor-pointer text-base">
                                        {t('community.learnMore')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Bottom Gradient Cards Section */}
            <section className="w-full overflow-hidden text-white sm:px-12 lg:px-16 py-12 bg-gradient-to-b from-sonora-magenta via-sonora-light to-sonora-purple">
                <div className="mx-auto grid w-full max-w-5xl grid-cols-1 md:grid-cols-2 gap-12 md:gap-8">
                    {CARD_KEYS.map((key) => (
                        <div key={key} className="relative min-w-0">
                            <div className="relative py-8 px-10">
                                <svg
                                    viewBox="0 0 320 195"
                                    fill="none"
                                    aria-hidden="true"
                                    className="pointer-events-none absolute inset-0 h-full w-full"
                                >
                                    <path
                                        d="M 1 0 V 151 Q 0 176 25 176 H 250"
                                        stroke="white"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        vectorEffect="non-scaling-stroke"
                                    />
                                    <path
                                        d="M 38 20 H 265 Q 290 20 290 45 V 195"
                                        stroke="white"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        vectorEffect="non-scaling-stroke"
                                    />
                                </svg>

                                <div className="relative z-10 flex h-full flex-col pt-4">
                                    <h3 className="text-center font-inter text-2xl font-bold leading-snug">
                                        {t(`community.cards.${key}.title`)}
                                    </h3>

                                    <p className="mt-4 text-left text-base font-normal leading-relaxed">
                                        {t(`community.cards.${key}.description`)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
            <Footer />
        </div>
    )
}

export default CommunityPage
