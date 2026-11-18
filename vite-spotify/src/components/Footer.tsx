import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import imgLogoSonora042 from '../assets/home/logo-sonora.png'
import imgFaceb from '../assets/home/faceb.svg'
import imgInst from '../assets/home/inst.svg'
import imgTikTok from '../assets/home/tiktok.svg'

export const Footer: React.FC = () => {
    const location = useLocation()
    const { t } = useTranslation()

    const getColors = () => {
        const path = location.pathname

        if (path.includes('/duo')) return { inst: '#6B309B', fb: '#6B309B', tiktok: '#6B309B' }
        if (path.includes('/family')) return { inst: '#E869CA', fb: '#E869CA', tiktok: '#E869CA' }
        if (path.includes('/about')) return { inst: '#E869CA', fb: '#E869CA', tiktok: '#E869CA' }
        if (path.includes('/student')) return { inst: '#6829C6', fb: '#6829C6', tiktok: '#6829C6' }
        if (path.includes('/kids')) return { inst: '#AA71FF', fb: '#AA71FF', tiktok: '#AA71FF' }
        if (path.includes('/support')) return { inst: '#AA71FF', fb: '#AA71FF', tiktok: '#AA71FF' }
        if (path.includes('/player')) return { inst: '#6829C6', fb: '#AA71FF', tiktok: '#E869CA' }

        return {
            inst: '#E869CA',
            fb: '#6B309B',
            tiktok: '#6829C6',
        }
    }

    const colors = getColors()

    return (
        <footer className="w-full mt-12 md:mt-24 bg-sonora-dark">
            <div className="max-w-7xl mx-auto flex flex-col items-start px-6 sm:px-12 lg:px-16 xl:px-40 py-16 md:py-24 xl:py-32">
                <div className="flex flex-col xl:flex-row gap-12 xl:gap-20 items-start relative shrink-0 w-full justify-between">
                    <Link to="/player" className="relative shrink-0 w-31 h-5.5 overflow-hidden">
                        <img
                            alt="Sonora"
                            className="absolute max-w-none w-36 h-36 -top-13.5 -left-2.5"
                            src={imgLogoSonora042}
                        />
                    </Link>

                    <div className="grid grid-cols-2 sm:grid-cols-4 xl:flex gap-10 sm:gap-8 xl:gap-16 items-start text-base text-white w-full max-w-2xl shrink-0">
                        <div className="flex flex-col gap-7 items-start shrink-0">
                            <div className="flex flex-col font-bold justify-center w-full">
                                <p className="leading-6">{t('footer.company')}</p>
                            </div>
                            <Link to="/about" className="flex flex-col font-normal justify-center w-full hover:underline">
                                <span className="leading-7">{t('footer.about')}</span>
                            </Link>
                            <div className="flex flex-col font-normal justify-center w-full">
                                <p className="leading-7">{t('footer.jobs')}</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-7 items-start shrink-0">
                            <div className="flex flex-col font-bold justify-center w-full">
                                <p className="leading-6">{t('footer.communities')}</p>
                            </div>
                            <div className="flex flex-col font-normal justify-center w-full">
                                <p className="leading-7">{t('footer.forArtists')}</p>
                            </div>
                            <div className="flex flex-col font-normal justify-center w-full">
                                <p className="leading-7">{t('footer.creators')}</p>
                            </div>
                            <div className="flex flex-col font-normal justify-center w-full">
                                <p className="leading-7">{t('footer.authors')}</p>
                            </div>
                            <div className="flex flex-col font-normal justify-center w-full">
                                <p className="leading-7">{t('footer.developers')}</p>
                            </div>
                            <div className="flex flex-col font-normal justify-center w-full">
                                <p className="leading-7">{t('footer.advertising')}</p>
                            </div>
                            <div className="flex flex-col font-normal justify-center w-full">
                                <p className="leading-7">{t('footer.investors')}</p>
                            </div>
                            <div className="flex flex-col font-normal justify-center w-full">
                                <p className="leading-7">{t('footer.vendors')}</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-7 items-start shrink-0">
                            <div className="flex flex-col font-bold justify-center w-full">
                                <p className="leading-6">{t('footer.usefulLinks')}</p>
                            </div>
                            <Link to="/support" className="flex flex-col font-normal justify-center w-full hover:underline">
                                <span className="leading-7">{t('footer.support')}</span>
                            </Link>
                            <Link to="/player" className="flex flex-col font-normal justify-center w-full hover:underline">
                                <span className="leading-7">{t('footer.webPlayer')}</span>
                            </Link>
                            <div className="flex flex-col font-normal justify-center w-full">
                                <p className="leading-7">{t('footer.mobileApp')}</p>
                            </div>
                            <div className="flex flex-col font-normal justify-center w-full">
                                <p className="leading-7">{t('footer.importMusic')}</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-7 items-start shrink-0">
                            <div className="flex flex-col font-bold justify-center w-full">
                                <p className="leading-6">{t('footer.plans')}</p>
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
                        <div className="relative shrink-0 w-12 h-12 flex items-center justify-center">
                            <svg preserveAspectRatio="none" overflow="visible" className="block absolute inset-0" width="48" height="48" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="25" cy="25" r="25" fill={colors.inst} />
                            </svg>
                            <div className="relative z-10 w-6 h-6 pointer-events-none">
                                <img alt="Instagram" className="block w-full h-full" src={imgInst} />
                            </div>
                        </div>

                        <div className="relative shrink-0 w-12 h-12 flex items-center justify-center">
                            <svg preserveAspectRatio="none" overflow="visible" className="block absolute inset-0" width="48" height="48" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="25" cy="25" r="25" fill={colors.fb} />
                            </svg>
                            <div className="relative z-10 w-6 h-6 pointer-events-none">
                                <img alt="Facebook" className="block w-full h-full" src={imgFaceb} />
                            </div>
                        </div>

                        <div className="relative shrink-0 w-12 h-12 flex items-center justify-center">
                            <svg preserveAspectRatio="none" overflow="visible" className="block absolute inset-0" width="48" height="48" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="25" cy="25" r="25" fill={colors.tiktok} />
                            </svg>
                            <div className="relative z-10 w-6 h-6 pointer-events-none">
                                <img alt="TikTok" className="block w-full h-full" src={imgTikTok} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
