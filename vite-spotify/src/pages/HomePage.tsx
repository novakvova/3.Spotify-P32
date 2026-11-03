import { useState, useRef, useEffect } from 'react'
import { Menu, X } from 'lucide-react'

import imgLogoSonora042 from '../assets/home/logo-sonora.png'
import imgPhoto1 from '../assets/home/photo1.png'
import imgPhoto2 from '../assets/home/photo2.png'
import imgFrame11 from '../assets/home/frame11.png'
import imgPlay from '../assets/home/play.svg'
import imgPlaylists from '../assets/home/playlists.svg'
import imgHeart from '../assets/home/heart.svg'
import imgSaveMobileData from '../assets/home/save-mobile-data.svg'
import imgArrow from '../assets/home/arrow.svg'
import imgEllipse3 from '../assets/home/ellipse3.svg'
import imgEllipse4 from '../assets/home/ellipse4.svg'
import imgEllipse5 from '../assets/home/ellipse5.svg'
import imgFaceb from '../assets/home/faceb.svg'
import imgInst from '../assets/home/inst.svg'
import imgTikTok from '../assets/home/tiktok.svg'

const PURPLE_BG = '#280a3a'

const PREMIUM_PLANS = [
    {
        title: 'Individual',
        desc: '1 акаунт для однієї людини',
    },
    {
        title: 'Duo',
        desc: '2 акаунти для пар, що мешкають разом',
    },
    {
        title: 'Family',
        desc: "До 6 акаунтів для членів сім'ї, що мешкають разом",
    },
    {
        title: 'Student',
        desc: '1 акаунт, знижка для студентів',
    },
    {
        title: 'Kids+',
        desc: 'До 3 акаунтів для дітей, що мешкають разом',
    },
]

const BENEFITS = [
    {
        icon: imgPlay,
        title: 'Слухайте нове',
        description: 'Твій вибір — твої хіти. Відкривай мільйони треків в один клік',
    },
    {
        icon: imgPlaylists,
        title: 'Створюйте настрій',
        description: 'Твої правила — твої плейлісти. Керуй музикою так, як хочеш ти',
    },
    {
        icon: imgHeart,
        title: 'Знаходьте своє',
        description: 'Твої лайки — твій настрій. Знаходь ідеальну музику \nлише для себе',
    },
    {
        icon: imgSaveMobileData,
        title: 'Зберігайте трафік',
        description: 'Твій інтернет — твої дані. Слухай улюблені пісні без зайвих витрат',
    },
]

export default function HomePage() {
    const [openPremium, setOpenPremium] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [openFaq, setOpenFaq] = useState<Record<number, boolean>>({})
    const premiumRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (premiumRef.current && !premiumRef.current.contains(e.target as Node)) {
                setOpenPremium(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const toggleFaq = (index: number) => {
        setOpenFaq((prev) => ({ ...prev, [index]: !prev[index] }))
    }

    return (
        <div
            className="bg-white min-h-screen w-full overflow-x-hidden"
            style={{ fontFamily: "'Inter', sans-serif", color: PURPLE_BG }}
        >
            <header className="w-full relative z-30" style={{ backgroundColor: PURPLE_BG }}>
                <div
                    className="mx-auto flex items-center justify-between px-4 sm:px-8 lg:px-16 xl:px-40 py-2.5"
                    style={{ maxWidth: 1440, height: 75 }}
                >
                    <div className="relative shrink-0" style={{ width: 115, height: 25 }}>
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
                                src={imgLogoSonora042}
                            />
                        </div>
                    </div>

                    <nav className="hidden lg:flex gap-6 xl:gap-12 items-center justify-end xl:justify-center text-white shrink-0">
                        <div ref={premiumRef} className="relative shrink-0">
                            <button
                                type="button"
                                onClick={() => setOpenPremium((v) => !v)}
                                className="cursor-pointer flex flex-col font-semibold justify-center text-base text-left hover:opacity-80 transition-opacity"
                            >
                                <span className="leading-normal whitespace-nowrap">Підписки Premium</span>
                            </button>

                            {openPremium && (
                                <div className="absolute left-0 top-10 w-80 sm:w-96 shadow-xl z-50">
                                    {PREMIUM_PLANS.map((plan) => (
                                        <button
                                            key={plan.title}
                                            type="button"
                                            onClick={() => setOpenPremium(false)}
                                            className="h-24 w-full transition-colors flex flex-col gap-3.5 items-start justify-center px-3.5 text-left text-white cursor-pointer hover:brightness-125"
                                            style={{ backgroundColor: PURPLE_BG }}
                                        >
                                            <span className="font-bold text-base leading-6">
                                                {plan.title}
                                            </span>
                                            <span className="font-normal text-sm leading-5">
                                                {plan.desc}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col font-semibold justify-center shrink-0 text-base cursor-pointer hover:opacity-80 transition-opacity">
                            <span className="leading-normal">Підтримка</span>
                        </div>

                        <div className="flex flex-col font-semibold justify-center shrink-0 text-base cursor-pointer hover:opacity-80 transition-opacity">
                            <span className="leading-normal">Завантажити</span>
                        </div>

                        <div className="flex flex-col font-semibold justify-center shrink-0 text-base cursor-pointer hover:opacity-80 transition-opacity">
                            <span className="leading-normal">Зареєструватися</span>
                        </div>

                        <div className="flex flex-col font-semibold justify-center shrink-0 text-base cursor-pointer hover:opacity-80 transition-opacity">
                            <span className="leading-normal">Увійти</span>
                        </div>

                        <div className="flex flex-col font-normal justify-center shrink-0 text-sm text-right">
                            <span className="leading-5">Укр</span>
                        </div>
                    </nav>

                    <button
                        type="button"
                        onClick={() => setMobileMenuOpen((v) => !v)}
                        className="lg:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                        aria-label="Меню"
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {mobileMenuOpen && (
                    <div
                        className="lg:hidden border-t border-white/10 px-6 py-5 flex flex-col gap-4 text-white"
                        style={{ backgroundColor: PURPLE_BG }}
                    >
                        <button
                            type="button"
                            onClick={() => setOpenPremium((v) => !v)}
                            className="flex items-center justify-between font-semibold text-base text-left py-1 cursor-pointer"
                        >
                            <span>Підписки Premium</span>
                            <span className="text-xs opacity-70">{openPremium ? '▲' : '▼'}</span>
                        </button>
                        {openPremium && (
                            <div className="flex flex-col gap-2 pl-3 border-l border-white/20">
                                {PREMIUM_PLANS.map((plan) => (
                                    <button
                                        key={plan.title}
                                        type="button"
                                        onClick={() => {
                                            setOpenPremium(false)
                                            setMobileMenuOpen(false)
                                        }}
                                        className="text-left py-1.5"
                                    >
                                        <p className="font-bold text-sm">{plan.title}</p>
                                        <p className="text-xs opacity-80">{plan.desc}</p>
                                    </button>
                                ))}
                            </div>
                        )}
                        <div className="font-semibold text-base py-1 cursor-pointer">
                            Підтримка
                        </div>
                        <div className="font-semibold text-base py-1 cursor-pointer">
                            Завантажити
                        </div>
                        <div className="font-semibold text-base py-1 cursor-pointer">
                            Зареєструватися
                        </div>
                        <div className="font-semibold text-base py-1 cursor-pointer">
                            Увійти
                        </div>
                        <span className="text-sm opacity-80 pt-1 border-t border-white/10">
                            Мова: Укр
                        </span>
                    </div>
                )}
            </header>

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
                        <p className="leading-tight">Відчуй свій ритм</p>
                    </div>

                    <button
                        type="button"
                        className="bg-white flex items-center justify-center px-8 py-3.5 rounded-full shrink-0 w-full cursor-pointer hover:scale-105 transition-transform"
                        style={{ maxWidth: 300, height: 50, color: PURPLE_BG }}
                    >
                        <span className="font-bold text-base leading-none text-center whitespace-nowrap">
                            Зареєструватися безкоштовно
                        </span>
                    </button>
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
                    <p className="leading-tight">Переваги</p>
                </div>

                <div
                    className="mt-10 md:mt-16 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-10 xl:gap-5 w-full mx-auto"
                    style={{ maxWidth: 1100 }}
                >
                    {BENEFITS.map((item) => (
                        <div
                            key={item.title}
                            className="flex flex-col items-center w-full mx-auto"
                        >
                            <div className="relative shrink-0" style={{ width: 140, height: 140 }}>
                                <img alt="" className="block max-w-none" src={item.icon} />
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
                        <p className="leading-tight">На одній хвилі з друзями</p>
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
                    <p className="leading-tight">Маєте запитання?</p>
                </div>

                <div className="mt-10 md:mt-20 flex flex-col gap-14 md:gap-24 items-start w-full">
                    <div className="flex flex-col items-center w-full px-4 sm:px-8 lg:px-16 xl:px-0">
                        <div
                            className="flex flex-col gap-8 md:gap-10 items-start w-full"
                            style={{ maxWidth: 1098 }}
                        >
                            <div className="flex flex-col gap-2.5 items-start w-full">
                                <button
                                    type="button"
                                    onClick={() => toggleFaq(0)}
                                    className="cursor-pointer flex items-center justify-between gap-4 w-full text-left"
                                >
                                    <span className="font-bold text-lg md:text-xl leading-7">
                                        Як створити плейліст?
                                    </span>
                                    <div
                                        className={`relative shrink-0 transition-transform duration-200 ${
                                            openFaq[0] ? 'rotate-180' : ''
                                        }`}
                                        style={{ width: 25, height: 10 }}
                                    >
                                        <img alt="" className="block max-w-none" src={imgArrow} />
                                    </div>
                                </button>

                                {openFaq[0] && (
                                    <div className="font-normal text-base leading-7 text-left w-full pt-1">
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-2.5 items-start w-full">
                                <button
                                    type="button"
                                    onClick={() => toggleFaq(1)}
                                    className="cursor-pointer flex items-center justify-between gap-4 w-full text-left"
                                >
                                    <span className="font-bold text-lg md:text-xl leading-7">
                                        Як увімкнути економію трафіку?
                                    </span>
                                    <div
                                        className={`relative shrink-0 transition-transform duration-200 ${
                                            openFaq[1] ? 'rotate-180' : ''
                                        }`}
                                        style={{ width: 25, height: 10 }}
                                    >
                                        <img alt="" className="block max-w-none" src={imgArrow} />
                                    </div>
                                </button>

                                {openFaq[1] && (
                                    <div className="font-normal text-base leading-7 text-left w-full pt-1">
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-2.5 items-start w-full">
                                <button
                                    type="button"
                                    onClick={() => toggleFaq(2)}
                                    className="cursor-pointer flex items-center justify-between gap-4 w-full text-left"
                                >
                                    <span className="font-bold text-lg md:text-xl leading-7">
                                        Де знайти подкасти?
                                    </span>
                                    <div
                                        className={`relative shrink-0 transition-transform duration-200 ${
                                            openFaq[2] ? 'rotate-180' : ''
                                        }`}
                                        style={{ width: 25, height: 10 }}
                                    >
                                        <img alt="" className="block max-w-none" src={imgArrow} />
                                    </div>
                                </button>

                                {openFaq[2] && (
                                    <div className="font-normal text-base leading-7 text-left w-full pt-1">
                                    </div>
                                )}
                            </div>
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
                            <p className="leading-tight">Готові? Нумо слухати</p>
                        </div>

                        <button
                            type="button"
                            className="bg-white flex items-center justify-center px-8 py-3.5 relative z-10 rounded-full shrink-0 w-full cursor-pointer hover:scale-105 transition-transform"
                            style={{ maxWidth: 300, height: 50, color: PURPLE_BG }}
                        >
                            <span className="font-bold text-base leading-none text-center whitespace-nowrap">
                                Зареєструватися безкоштовно
                            </span>
                        </button>
                    </div>
                </div>
            </section>

            <footer className="w-full mt-12 md:mt-24" style={{ backgroundColor: PURPLE_BG }}>
                <div
                    className="mx-auto flex flex-col items-start px-6 sm:px-12 lg:px-16 xl:px-40 py-16 md:py-24 xl:py-40"
                    style={{ maxWidth: 1440, minHeight: 620 }}
                >
                    <div className="flex flex-col xl:flex-row gap-12 xl:gap-20 items-start relative shrink-0 w-full">
                        <div className="relative shrink-0" style={{ width: 115, height: 25 }}>
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
                                    src={imgLogoSonora042}
                                />
                            </div>
                        </div>

                        <div
                            className="grid grid-cols-2 sm:grid-cols-4 xl:flex gap-10 sm:gap-8 xl:gap-16 items-start text-base text-white w-full shrink-0"
                            style={{ maxWidth: 625 }}
                        >
                            <div className="flex flex-col gap-7 items-start shrink-0">
                                <div className="flex flex-col font-bold justify-center w-full">
                                    <p className="leading-6">Компанія</p>
                                </div>
                                <div className="flex flex-col font-normal justify-center w-full">
                                    <p className="leading-7">Про нас</p>
                                </div>
                                <div className="flex flex-col font-normal justify-center w-full">
                                    <p className="leading-7">Вакансії</p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-7 items-start shrink-0">
                                <div className="flex flex-col font-bold justify-center w-full">
                                    <p className="leading-6">Спільноти</p>
                                </div>
                                <div className="flex flex-col font-normal justify-center w-full">
                                    <p className="leading-7">Виконавців</p>
                                </div>
                                <div className="flex flex-col font-normal justify-center w-full">
                                    <p className="leading-7">Творців</p>
                                </div>
                                <div className="flex flex-col font-normal justify-center w-full">
                                    <p className="leading-7">Авторів</p>
                                </div>
                                <div className="flex flex-col font-normal justify-center w-full">
                                    <p className="leading-7">Розробників</p>
                                </div>
                                <div className="flex flex-col font-normal justify-center w-full">
                                    <p className="leading-7">Рекламодавців</p>
                                </div>
                                <div className="flex flex-col font-normal justify-center w-full">
                                    <p className="leading-7">Iнвесторів</p>
                                </div>
                                <div className="flex flex-col font-normal justify-center w-full">
                                    <p className="leading-7">Постачальників</p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-7 items-start shrink-0">
                                <div className="flex flex-col font-bold justify-center w-full">
                                    <p className="leading-6">Корисні посилання</p>
                                </div>
                                <div className="flex flex-col font-normal justify-center w-full">
                                    <p className="leading-7">Підтримка</p>
                                </div>
                                <div className="flex flex-col font-normal justify-center w-full">
                                    <p className="leading-7">Вебпрогравач</p>
                                </div>
                                <div className="flex flex-col font-normal justify-center w-full">
                                    <p className="leading-7">Мобільний додаток</p>
                                </div>
                                <div className="flex flex-col font-normal justify-center w-full">
                                    <p className="leading-7">Iмпорт власної музики</p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-7 items-start shrink-0">
                                <div className="flex flex-col font-bold justify-center w-full">
                                    <p className="leading-6">Підписки</p>
                                </div>
                                <div className="flex flex-col font-normal justify-center w-full">
                                    <p className="leading-7">Premium</p>
                                </div>
                                <div className="flex flex-col font-normal justify-center w-full">
                                    <p className="leading-7">Duo</p>
                                </div>
                                <div className="flex flex-col font-normal justify-center w-full">
                                    <p className="leading-7">Family</p>
                                </div>
                                <div className="flex flex-col font-normal justify-center w-full">
                                    <p className="leading-7">Student</p>
                                </div>
                                <div className="flex flex-col font-normal justify-center w-full">
                                    <p className="leading-7">Free</p>
                                </div>
                                <div className="flex flex-col font-normal justify-center w-full">
                                    <p className="leading-7">Kids+</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-5 items-center relative shrink-0">
                            <div className="relative shrink-0" style={{ width: 50, height: 50 }}>
                                <img alt="" className="absolute block inset-0 max-w-none" src={imgEllipse3} />
                            </div>
                            <div className="relative shrink-0" style={{ width: 50, height: 50 }}>
                                <img alt="" className="absolute block inset-0 max-w-none" src={imgEllipse4} />
                            </div>
                            <div className="relative shrink-0" style={{ width: 50, height: 50 }}>
                                <img alt="" className="absolute block inset-0 max-w-none" src={imgEllipse5} />
                            </div>
                            <div
                                className="absolute pointer-events-none"
                                style={{ left: 83, top: 12, width: 25, height: 25 }}
                            >
                                <img alt="Facebook" className="absolute block inset-0 max-w-none" src={imgFaceb} />
                            </div>
                            <div
                                className="absolute pointer-events-none"
                                style={{ left: 12, top: 12, width: 25, height: 25 }}
                            >
                                <img alt="Instagram" className="absolute block inset-0 max-w-none" src={imgInst} />
                            </div>
                            <div
                                className="-translate-y-1/2 absolute overflow-clip pointer-events-none"
                                style={{
                                    left: '80%',
                                    right: '6.77%',
                                    top: 'calc(50% - 0.42px)',
                                    aspectRatio: '25 / 29',
                                }}
                            >
                                <img alt="TikTok" className="absolute block inset-0 max-w-none" src={imgTikTok} />
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
