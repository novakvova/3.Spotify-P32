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
const FAQ_INDEXES = [0, 1, 2] as const

export default function HomePage() {
    const { t } = useTranslation()
    const PURPLE_BG = '#280a3a'
    const isAuthenticated = useAppSelector(selectIsAuthenticated)
    const [openFaq, setOpenFaq] = useState<Record<number, boolean>>({})

    const benefits = t('home.benefits', { returnObjects: true }) as { title: string; description: string }[]

    const toggleFaq = (index: number) => {
        setOpenFaq((prev) => ({ ...prev, [index]: !prev[index] }))
    }

    const primaryCta = isAuthenticated ? t('home.myProfile') : t('home.signUpFree')

    return (
        <div
            className="bg-white min-h-screen w-full overflow-x-hidden"
            style={{ fontFamily: "'Inter', sans-serif", color: PURPLE_BG }}
        >
            <Header />
            <section
                className="relative w-full mx-auto overflow-hidden flex items-end justify-center pb-16 md:pb-24"
                style={{ height: 525 }}
            >
                <div className="absolute inset-0">
                    <img
                        alt=""
                        className="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
                        src={imgPhoto1}
                    />
                </div>

                <div
                    className="relative z-10 mx-auto px-4 flex flex-col gap-8 md:gap-11 items-center w-full"
                    style={{ maxWidth: 1100 }}
                >
                    <div className="flex flex-col font-extrabold justify-center text-3xl sm:text-4xl text-center text-white">
                        <p className="leading-tight">{t('home.heroTitle')}</p>
                    </div>

                    <Link
                        to={isAuthenticated ? '/me' : '/register'}
                        className="bg-white flex items-center justify-center px-8 py-3.5 rounded-full shrink-0 w-full cursor-pointer hover:scale-105 transition-transform"
                        style={{ maxWidth: 300, height: 50, color: PURPLE_BG }}
                    >
                        <span className="font-bold text-base leading-none text-center whitespace-nowrap">
                            {primaryCta}
                        </span>
                    </Link>
                </div>
            </section>

            <section
                className="w-full mx-auto pt-14 md:pt-20 pb-14 md:pb-20 px-4 sm:px-8 lg:px-16 xl:px-40"
                style={{ maxWidth: 1440 }}
            >
                <div
                    className="flex flex-col font-semibold justify-center text-2xl md:text-3xl text-center w-full mx-auto"
                    style={{ maxWidth: 1100 }}
                >
                    <p className="leading-tight">{t('home.benefitsTitle')}</p>
                </div>

                <div
                    className="mt-10 md:mt-16 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-10 xl:gap-5 w-full mx-auto"
                    style={{ maxWidth: 1100 }}
                >
                    {benefits.map((item, index) => (
                        <div
                            key={item.title}
                            className="flex flex-col items-center w-full mx-auto"
                        >
                            <div className="relative shrink-0" style={{ width: 140, height: 140 }}>
                                <img alt="" className="block max-w-none" src={BENEFIT_ICONS[index]} />
                            </div>

                            <div className="mt-6 xl:mt-10 flex flex-col justify-center w-full text-center">
                                <p className="font-bold text-xl leading-7">
                                    {item.title}
                                </p>
                            </div>

                            <p
                                className="mt-3 xl:mt-6 font-normal leading-7 text-base text-center w-full whitespace-pre-line"
                                style={{ maxWidth: 230 }}
                            >
                                {item.description}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="w-full" style={{ backgroundColor: PURPLE_BG }}>
                <div
                    className="relative w-full mx-auto overflow-hidden"
                    style={{ maxWidth: 1440, height: 450 }}
                >
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <img
                            alt=""
                            className="absolute max-w-none object-contain md:object-fill"
                            style={{
                                height: '106.6%',
                                left: '16.92%',
                                top: '17.86%',
                                width: '66.19%',
                            }}
                            src={imgPhoto2}
                        />
                    </div>

                    <div
                        className="relative z-10 pt-8 sm:pt-12 md:pt-16 px-4 mx-auto flex flex-col font-extrabold justify-center text-2xl sm:text-3xl md:text-4xl text-center text-white w-full"
                        style={{ maxWidth: 1100 }}
                    >
                        <p className="leading-tight">{t('home.photoTitle')}</p>
                    </div>
                </div>
            </section>

            <section
                className="w-full mx-auto pt-14 md:pt-24"
                style={{ maxWidth: 1440 }}
            >
                <div
                    className="px-4 flex flex-col font-semibold justify-center text-2xl md:text-3xl text-center w-full mx-auto"
                    style={{ maxWidth: 1100 }}
                >
                    <p className="leading-tight">{t('faq.title')}</p>
                </div>

                <div className="mt-10 md:mt-20 flex flex-col gap-14 md:gap-24 items-start w-full">
                    <div className="flex flex-col items-center w-full px-4 sm:px-8 lg:px-16 xl:px-0">
                        <div
                            className="flex flex-col gap-8 md:gap-10 items-start w-full"
                            style={{ maxWidth: 1098 }}
                        >
                            {FAQ_INDEXES.map((index) => (
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
                                            className={`relative shrink-0 transition-transform duration-200 ${
                                                openFaq[index] ? 'rotate-180' : ''
                                            }`}
                                            style={{ width: 25, height: 10 }}
                                        >
                                            <img alt="" className="block max-w-none" src={imgArrow} />
                                        </div>
                                    </button>

                                    {openFaq[index] && (
                                        <div className="font-normal text-base leading-7 text-left w-full pt-1">
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div
                        className="flex flex-col gap-8 md:gap-14 items-center justify-end pb-12 md:pb-24 px-4 sm:px-8 xl:px-40 relative shrink-0 w-full overflow-hidden"
                        style={{ height: 450 }}
                    >
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <img
                                alt=""
                                className="absolute max-w-none object-cover md:object-fill"
                                style={{
                                    height: '146.52%',
                                    left: '-21.79%',
                                    top: 0,
                                    width: '138.6%',
                                }}
                                src={imgFrame11}
                            />
                        </div>

                        <div
                            className="flex flex-col font-extrabold justify-center relative z-10 shrink-0 text-3xl sm:text-4xl text-center text-white w-full"
                            style={{ maxWidth: 1100 }}
                        >
                            <p className="leading-tight">{t('home.readyTitle')}</p>
                        </div>

                        <Link
                            to={isAuthenticated ? '/me' : '/register'}
                            className="bg-white flex items-center justify-center px-8 py-3.5 relative z-10 rounded-full shrink-0 w-full cursor-pointer hover:scale-105 transition-transform"
                            style={{ maxWidth: 300, height: 50, color: PURPLE_BG }}
                        >
                            <span className="font-bold text-base leading-none text-center whitespace-nowrap">
                                {primaryCta}
                            </span>
                        </Link>
                    </div>
                </div>
            </section>
            <Footer />
        </div>
    )
}
