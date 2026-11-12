import React from 'react';
import { useTranslation } from 'react-i18next';
import { Header } from "../components/Header.tsx";
import creatorHeroBg from '../assets/home/creator-hero-bg.png';
import audienceFeatureImg from '../assets/home/audience-feature.png';
import monetizeFeatureImg from '../assets/home/monetize-feature.png';
import standOutFeatureImg from '../assets/home/stand-out-feature.png';
import { Footer } from "../components/Footer.tsx";

const FEATURE_BLOCKS = [
    { key: 'audience', img: audienceFeatureImg, reverse: false },
    { key: 'monetize', img: monetizeFeatureImg, reverse: true },
    { key: 'standOut', img: standOutFeatureImg, reverse: false },
] as const

const CARD_KEYS = ['audio', 'video'] as const

export const CommunityPage: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-white text-[#120826] overflow-x-hidden">
            <div className="bg-[#120826] text-white">
                <Header />

                {/* First Hero Section */}
                <section className="relative w-full flex items-center overflow-hidden bg-[#120826]">
                    <div className="absolute inset-0 z-0 flex justify-end items-start pointer-events-none">
                        <img
                            src={creatorHeroBg}
                            alt={t('community.heroAlt')}
                            className="w-full lg:w-auto h-full object-cover lg:object-contain object-top object-right"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#120826] via-[#120826]/80 lg:via-[#120826]/40 to-transparent" />
                    </div>

                    <div className="relative z-10 max-w-7xl mx-auto w-full px-6 sm:px-12 lg:px-16 py-16 lg:py-24 flex items-center">
                        <div className="max-w-xl space-y-6">
                            <h1 className="font-['Inter'] text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
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
            <section className="bg-[#F9F9FB] text-[#120826] py-16 lg:py-24 px-6 sm:px-12 lg:px-16">
                <div className="max-w-6xl mx-auto space-y-16 lg:space-y-24">
                    <div className="text-center">
                        <h2 className="font-['Inter'] text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#120826]">
                            {t('community.featuresTitle')}
                        </h2>
                    </div>

                    {FEATURE_BLOCKS.map((block) => (
                        <div
                            key={block.key}
                            className={`flex flex-col ${block.reverse ? 'md:flex-row-reverse' : 'md:flex-row'} items-center justify-between gap-12 lg:gap-20`}
                        >
                            <div className="w-full md:w-1/2 flex justify-center shrink-0">
                                <img
                                    src={block.img}
                                    alt={t(`community.${block.key}.alt`)}
                                    className="w-full max-w-[480px] h-auto object-contain"
                                />
                            </div>
                            <div className="w-full md:w-1/2 space-y-6 text-left">
                                <h3 className="font-['Inter'] text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-snug text-[#120826]">
                                    {t(`community.${block.key}.title`)}
                                </h3>
                                <p className="text-gray-700 text-base sm:text-lg font-medium leading-relaxed max-w-lg">
                                    {t(`community.${block.key}.text`)}
                                </p>
                                <div className="pt-2">
                                    <button className="border-2 border-[#120826] text-[#120826] font-extrabold py-3.5 px-10 rounded-full hover:bg-[#120826] hover:text-white transition shadow-sm cursor-pointer text-base">
                                        {t('community.learnMore')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Bottom Gradient Cards Section */}
            <section
                className="w-full overflow-hidden text-white sm:px-12 lg:px-16"
                style={{
                    background: 'linear-gradient(180deg, #CD51CA 0%, #AA71FF 50%, #6829C6 100%)',
                }}
            >
                <div className="mx-auto grid w-full max-w-[1030px] grid-cols-1 md:grid-cols-2 gap-12 md:gap-8">
                    {CARD_KEYS.map((key) => (
                        <div
                            key={key}
                            className="relative min-w-0"
                        >
                            <div className="relative aspect-[320/195]">
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

                                <div className="relative z-10 flex h-full flex-col pt-[11.5%]">
                                    <h3 className="mx-[10%] text-center font-['Inter'] text-[clamp(16px,2.2vw,26px)] font-bold leading-[1.3]">
                                        {t(`community.cards.${key}.title`)}
                                    </h3>

                                    <p className="ml-[9.5%] mr-[18%] mt-[9%] text-left text-[clamp(11px,1.4vw,17px)] font-normal leading-[1.5]">
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
    );
};

export default CommunityPage;
