import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import imgPhoto1 from '../assets/home/photo1.png'
import imgPhoto2 from '../assets/home/photo2.png'
import imgFrame11 from '../assets/home/frame11.png'
import imgPlay from '../assets/home/play.svg'
import imgPlaylists from '../assets/home/playlists.svg'
import imgHeart from '../assets/home/heart.svg'
import imgSaveMobileData from '../assets/home/save-mobile-data.svg'
import imgArrow from '../assets/home/arrow.svg'
import { Header } from '../components/Header.tsx'
import { Footer } from '../components/Footer.tsx'
import { useAppSelector } from '../store/hooks'
import { selectIsAuthenticated } from '../store/slices/authSlice'

const BENEFIT_ICONS = [imgPlay, imgPlaylists, imgHeart, imgSaveMobileData]
const FAQ_INDICES = [0, 1, 2] as const

export default function HomePage() {
    const { t } = useTranslation()
    const isAuthenticated = useAppSelector(selectIsAuthenticated)
    const [openFaq, setOpenFaq] = useState<Record<number, boolean>>({})

    const toggleFaq = (index: number) => {
        setOpenFaq((prev) => ({ ...prev, [index]: !prev[index] }))
    }

    const benefits = t('home.benefits', { returnObjects: true }) as {
        title: string
        description: string
    }[]
    const ctaText = isAuthenticated ? t('home.myProfile') : t('home.signUpFree')
    const ctaTarget = isAuthenticated ? '/me' : '/register'

    return (
        <div className="bg-white min-h-screen w-full overflow-x-hidden font-inter text-sonora-dark">
            <Header />
            <section className="relative w-full h-96 md:h-128 mx-auto overflow-hidden flex items-end justify-center pb-16 md:pb-24">
                <div className="absolute inset-0">
                    <img
                        alt=""
                        className="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
                        src={imgPhoto1}
                    />
                </div>

                <div className="relative z-10 max-w-6xl mx-auto px-4 flex flex-col gap-8 md:gap-11 items-center w-full">
                    <div className="flex flex-col font-extrabold justify-center text-3xl sm:text-4xl text-center text-white">
                        <p className="leading-tight">{t('home.heroTitle')}</p>
                    </div>

                    <Link
                        to={ctaTarget}
                        className="bg-white text-sonora-dark max-w-xs h-12 flex items-center justify-center px-8 py-3.5 rounded-full shrink-0 w-full cursor-pointer hover:scale-105 transition-transform"
                    >
                        <span className="font-bold text-base leading-none text-center whitespace-nowrap">
                            {ctaText}
                        </span>
                    </Link>
                </div>
            </section>

            <section className="w-full max-w-7xl mx-auto pt-14 md:pt-20 pb-14 md:pb-20 px-4 sm:px-8 lg:px-16 xl:px-40">
                <div className="max-w-6xl flex flex-col font-semibold justify-center text-2xl md:text-3xl text-center w-full mx-auto">
                    <p className="leading-tight">{t('home.benefitsTitle')}</p>
                </div>

                <div className="max-w-6xl mt-10 md:mt-16 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-10 xl:gap-5 w-full mx-auto">
                    {Array.isArray(benefits) &&
                        benefits.map((benefit, idx) => (
                            <div
                                key={benefit.title}
                                className="flex flex-col items-center w-full mx-auto"
                            >
                                <div className="relative shrink-0 w-36 h-36">
                                    <img
                                        alt=""
                                        className="block max-w-none w-full h-full"
                                        src={BENEFIT_ICONS[idx]}
                                    />
                                </div>

                                <div className="mt-6 xl:mt-10 flex flex-col justify-center w-full text-center">
                                    <p className="font-bold text-xl leading-7">
                                        {benefit.title}
                                    </p>
                                </div>

                                <p className="mt-3 xl:mt-6 font-normal leading-7 text-base text-center w-full max-w-60 whitespace-pre-line">
                                    {benefit.description}
                                </p>
                            </div>
                        ))}
                </div>
            </section>

            <section className="w-full bg-sonora-dark">
                <div className="relative w-full max-w-7xl h-96 md:h-112 mx-auto overflow-hidden flex flex-col items-center">
                    <div className="relative z-10 pt-8 sm:pt-12 md:pt-16 px-4 max-w-6xl mx-auto flex flex-col font-extrabold justify-center text-2xl sm:text-3xl md:text-4xl text-center text-white w-full">
                        <p className="leading-tight">{t('home.photoTitle')}</p>
                    </div>

                    <div className="absolute inset-x-0 bottom-0 flex justify-center items-end pointer-events-none">
                        <img
                            alt=""
                            className="w-5/6 max-w-4xl h-auto object-contain object-bottom block"
                            src={imgPhoto2}
                        />
                    </div>
                </div>
            </section>

            <section className="w-full pt-14 md:pt-24">
                <div className="px-4 max-w-6xl flex flex-col font-semibold justify-center text-2xl md:text-3xl text-center w-full mx-auto">
                    <p className="leading-tight">{t('faq.title')}</p>
                </div>

                <div className="mt-10 md:mt-20 flex flex-col gap-14 md:gap-24 items-start w-full">
                    <div className="flex flex-col items-center w-full px-4 sm:px-8 lg:px-16 xl:px-0">
                        <div className="max-w-5xl flex flex-col gap-8 md:gap-10 items-start w-full">
                            {FAQ_INDICES.map((index) => (
                                <div key={index} className="flex flex-col gap-2.5 items-start w-full">
                                    <button
                                        type="button"
                                        onClick={() => toggleFaq(index)}
                                        className="cursor-pointer flex items-center justify-between gap-4 w-full text-left"
                                    >
                                        <span className="font-bold text-lg md:text-xl leading-7">
                                            {t(`home.faqQuestions.${index}`)}
                                        </span>
                                        <div
                                            className={`relative shrink-0 w-6 h-2.5 transition-transform duration-200 ${
                                                openFaq[index] ? 'rotate-180' : ''
                                            }`}
                                        >
                                            <img alt="" className="block max-w-none w-full h-full" src={imgArrow} />
                                        </div>
                                    </button>

                                    {openFaq[index] && (
                                        <p className="font-normal text-base leading-7 text-left text-gray-600 w-full pt-1">
                                            {t('faq.defaultAnswer')}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-8 md:gap-14 items-center justify-end pb-12 md:pb-24 px-4 sm:px-8 xl:px-40 relative shrink-0 w-full h-96 md:h-112 overflow-hidden">
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <img
                                alt=""
                                className="w-full h-full object-cover"
                                src={imgFrame11}
                            />
                        </div>

                        <div className="max-w-6xl flex flex-col font-extrabold justify-center relative z-10 shrink-0 text-3xl sm:text-4xl text-center text-white w-full">
                            <p className="leading-tight">{t('home.readyTitle')}</p>
                        </div>

                        <Link
                            to={ctaTarget}
                            className="bg-white text-sonora-dark max-w-xs h-12 flex items-center justify-center px-8 py-3.5 relative z-10 rounded-full shrink-0 w-full cursor-pointer hover:scale-105 transition-transform"
                        >
                            <span className="font-bold text-base leading-none text-center whitespace-nowrap">
                                {ctaText}
                            </span>
                        </Link>
                    </div>
                </div>
            </section>
            <Footer />
        </div>
    )
}
