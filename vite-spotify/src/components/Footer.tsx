import React from 'react';
import { useLocation } from 'react-router-dom';
import imgLogoSonora042 from '../assets/home/logo-sonora.png';
import imgFaceb from '../assets/home/faceb.svg';
import imgInst from '../assets/home/inst.svg';
import imgTikTok from '../assets/home/tiktok.svg';

export const Footer: React.FC = () => {
    const location = useLocation();
    const PURPLE_BG = '#280a3a';

    // Функція для визначення кольору іконок
    const getColors = () => {
        const path = location.pathname;

        // Якщо це сторінка підписки — робимо всі три кружечки кольору цієї підписки
        if (path.includes('/duo')) return { inst: '#6B309B', fb: '#6B309B', tiktok: '#6B309B' };
        if (path.includes('/family')) return { inst: '#E869CA', fb: '#E869CA', tiktok: '#E869CA' };
        if (path.includes('/student')) return { inst: '#6829C6', fb: '#6829C6', tiktok: '#6829C6' };
        if (path.includes('/kids')) return { inst: '#AA71FF', fb: '#AA71FF', tiktok: '#AA71FF' };

        // Дефолтні кольори для головної та інших сторінок (змініть на ваші оригінальні кольори ellipse3, 4, 5)
        return {
            inst: '#E869CA', // Колір першого кружечка за замовчуванням
            fb: '#6B309B',   // Колір другого кружечка за замовчуванням
            tiktok: '#6829C6'// Колір третього кружечка за замовчуванням
        };
    };

    const colors = getColors();

    return (
        <footer className="w-full mt-12 md:mt-24" style={{ backgroundColor: PURPLE_BG }}>
            <div
                className="mx-auto flex flex-col items-start px-6 sm:px-12 lg:px-16 xl:px-40 py-16 md:py-24 xl:py-40"
                style={{ maxWidth: 1440, minHeight: 620 }}
            >
                <div className="flex flex-col xl:flex-row gap-12 xl:gap-20 items-start relative shrink-0 w-full justify-between">
                    {/* Логотип */}
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

                    {/* Меню футера */}
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

                    {/* Соціальні мережі */}
                    <div className="flex gap-5 items-center relative shrink-0">
                        {/* Instagram */}
                        <div className="relative shrink-0 w-[50px] h-[50px]">
                            <svg preserveAspectRatio="none" overflow="visible" style={{ display: 'block' }} width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="25" cy="25" r="25" fill={colors.inst} />
                            </svg>
                            <div className="absolute pointer-events-none" style={{ left: 12, top: 12, width: 25, height: 25 }}>
                                <img alt="Instagram" className="absolute block inset-0 max-w-none" src={imgInst} />
                            </div>
                        </div>

                        {/* Facebook */}
                        <div className="relative shrink-0 w-[50px] h-[50px]">
                            <svg preserveAspectRatio="none" overflow="visible" style={{ display: 'block' }} width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="25" cy="25" r="25" fill={colors.fb} />
                            </svg>
                            <div className="absolute pointer-events-none" style={{ left: 12.5, top: 12, width: 25, height: 25 }}>
                                <img alt="Facebook" className="absolute block inset-0 max-w-none" src={imgFaceb} />
                            </div>
                        </div>

                        {/* TikTok */}
                        <div className="relative shrink-0 w-[50px] h-[50px]">
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
    );
};