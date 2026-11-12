import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAppSelector } from '../store/hooks'
import { selectLanguage } from '../store/slices/languageSlice'
import imgLogoSonora042 from '../assets/home/logo-sonora.png'
import imgFaceb from '../assets/home/faceb.svg'
import imgInst from '../assets/home/inst.svg'
import imgTikTok from '../assets/home/tiktok.svg'

export const Footer: React.FC = () => {
    const location = useLocation()
    const lang = useAppSelector(selectLanguage)
    const isEn = lang === 'en'
    const PURPLE_BG = '#280a3a'

    const getColors = () => {
        const path = location.pathname

        if (path.includes('/duo')) return { inst: '#6B309B', fb: '#6B309B', tiktok: '#6B309B' }
        if (path.includes('/family')) return { inst: '#E869CA', fb: '#E869CA', tiktok: '#E869CA' }
        if (path.includes('/about')) return { inst: '#E869CA', fb: '#E869CA', tiktok: '#E869CA' }
        if (path.includes('/student')) return { inst: '#6829C6', fb: '#6829C6', tiktok: '#6829C6' }
        if (path.includes('/kids')) return { inst: '#AA71FF', fb: '#AA71FF', tiktok: '#AA71FF' }
        if (path.includes('/support')) return { inst: '#AA71FF', fb: '#AA71FF', tiktok: '#AA71FF' }

        return {
            inst: '#E869CA',
            fb: '#6B309B',
            tiktok: '#6829C6',
        }
    }

    const colors = getColors()

    return (
        <footer className="w-full mt-12 md:mt-24" style={{ backgroundColor: PURPLE_BG }}>
            <div
                className="mx-auto flex flex-col items-start px-6 sm:px-12 lg:px-16 xl:px-40 py-16 md:py-24 xl:py-40"
                style={{ maxWidth: 1440, minHeight: 620 }}
            >
                <div className="flex flex-col xl:flex-row gap-12 xl:gap-20 items-start relative shrink-0 w-full justify-between">
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
                                src={imgLogoSonora042}
                            />
                        </div>
                    </Link>

                    <div
                        className="grid grid-cols-2 sm:grid-cols-4 xl:flex gap-10 sm:gap-8 xl:gap-16 items-start text-base text-white w-full shrink-0"
                        style={{ maxWidth: 625 }}
                    >
                        <div className="flex flex-col gap-7 items-start shrink-0">
                            <div className="flex flex-col font-bold justify-center w-full">
                                <p className="leading-6">{isEn ? 'Company' : 'Компанія'}</p>
                            </div>
                            <Link to="/about" className="flex flex-col font-normal justify-center w-full hover:underline">
                                <span className="leading-7">{isEn ? 'About' : 'Про нас'}</span>
                            </Link>
                            <div className="flex flex-col font-normal justify-center w-full">
                                <p className="leading-7">{isEn ? 'Jobs' : 'Вакансії'}</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-7 items-start shrink-0">
                            <div className="flex flex-col font-bold justify-center w-full">
                                <p className="leading-6">{isEn ? 'Communities' : 'Спільноти'}</p>
                            </div>
                            <div className="flex flex-col font-normal justify-center w-full">
                                <p className="leading-7">{isEn ? 'For Artists' : 'Виконавців'}</p>
                            </div>
                            <div className="flex flex-col font-normal justify-center w-full">
                                <p className="leading-7">{isEn ? 'Creators' : 'Творців'}</p>
                            </div>
                            <div className="flex flex-col font-normal justify-center w-full">
                                <p className="leading-7">{isEn ? 'Authors' : 'Авторів'}</p>
                            </div>
                            <div className="flex flex-col font-normal justify-center w-full">
                                <p className="leading-7">{isEn ? 'Developers' : 'Розробників'}</p>
                            </div>
                            <div className="flex flex-col font-normal justify-center w-full">
                                <p className="leading-7">{isEn ? 'Advertising' : 'Рекламодавців'}</p>
                            </div>
                            <div className="flex flex-col font-normal justify-center w-full">
                                <p className="leading-7">{isEn ? 'Investors' : 'Iнвесторів'}</p>
                            </div>
                            <div className="flex flex-col font-normal justify-center w-full">
                                <p className="leading-7">{isEn ? 'Vendors' : 'Постачальників'}</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-7 items-start shrink-0">
                            <div className="flex flex-col font-bold justify-center w-full">
                                <p className="leading-6">{isEn ? 'Useful links' : 'Корисні посилання'}</p>
                            </div>
                            <Link to="/support" className="flex flex-col font-normal justify-center w-full hover:underline">
                                <span className="leading-7">{isEn ? 'Support' : 'Підтримка'}</span>
                            </Link>
                            <div className="flex flex-col font-normal justify-center w-full">
                                <span className="leading-7">{isEn ? 'Web Player' : 'Вебпрогравач'}</span>
                            </div>
                            <div className="flex flex-col font-normal justify-center w-full">
                                <p className="leading-7">{isEn ? 'Mobile App' : 'Мобільний додаток'}</p>
                            </div>
                            <div className="flex flex-col font-normal justify-center w-full">
                                <p className="leading-7">{isEn ? 'Import your music' : 'Iмпорт власної музики'}</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-7 items-start shrink-0">
                            <div className="flex flex-col font-bold justify-center w-full">
                                <p className="leading-6">{isEn ? 'Plans' : 'Підписки'}</p>
                            </div>
                            <Link to="/premium" className="flex flex-col font-normal justify-center w-full hover:underline">
                                <span className="leading-7">Premium</span>
                            </Link>
                            <Link to="/premium/duo" className="flex flex-col font-normal justify-center w-full hover:underline">
                                <span className="leading-7">Duo</span>
                            </Link>
                            <Link to="/premium/family" className="flex flex-col font-normal justify-center w-full hover:underline">
                                <span className="leading-7">Family</span>
                            </Link>
                            <Link to="/premium/student" className="flex flex-col font-normal justify-center w-full hover:underline">
                                <span className="leading-7">Student</span>
                            </Link>
                            <Link to="/songs" className="flex flex-col font-normal justify-center w-full hover:underline">
                                <span className="leading-7">Free</span>
                            </Link>
                            <Link to="/premium/kids" className="flex flex-col font-normal justify-center w-full hover:underline">
                                <span className="leading-7">Kids+</span>
                            </Link>
                        </div>
                    </div>

                    <div className="flex gap-5 items-center relative shrink-0">
                        <div className="relative shrink-0" style={{ width: 50, height: 50 }}>
                            <svg preserveAspectRatio="none" overflow="visible" style={{ display: 'block' }} width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="25" cy="25" r="25" fill={colors.inst} />
                            </svg>
                            <div className="absolute pointer-events-none" style={{ left: 12, top: 12, width: 25, height: 25 }}>
                                <img alt="Instagram" className="absolute block inset-0 max-w-none" src={imgInst} />
                            </div>
                        </div>

                        <div className="relative shrink-0" style={{ width: 50, height: 50 }}>
                            <svg preserveAspectRatio="none" overflow="visible" style={{ display: 'block' }} width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="25" cy="25" r="25" fill={colors.fb} />
                            </svg>
                            <div className="absolute pointer-events-none" style={{ left: 12.5, top: 12, width: 25, height: 25 }}>
                                <img alt="Facebook" className="absolute block inset-0 max-w-none" src={imgFaceb} />
                            </div>
                        </div>

                        <div className="relative shrink-0" style={{ width: 50, height: 50 }}>
                            <svg preserveAspectRatio="none" overflow="visible" style={{ display: 'block' }} width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="25" cy="25" r="25" fill={colors.tiktok} />
                            </svg>
                            <div className="absolute pointer-events-none" style={{ left: 12.5, top: 10.5, width: 25, height: 25 }}>
                                <img alt="TikTok" className="absolute block inset-0 max-w-none" src={imgTikTok} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
