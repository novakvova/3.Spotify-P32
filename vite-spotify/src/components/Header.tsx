import React, {useEffect, useRef, useState} from 'react';
import imgLogoSonora042 from "../assets/home/logo-sonora.png";
import {Menu, X} from "lucide-react";
import {Link, useNavigate} from "react-router-dom";

export const Header: React.FC = () => {
    const [openPremium, setOpenPremium] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const PURPLE_BG = '#280a3a'
    const premiumRef = useRef<HTMLDivElement>(null)
    const navigate = useNavigate()

    const PREMIUM_PLANS = [
        {
            title: 'Individual',
            desc: '1 акаунт для однієї людини',
            redirectlink: '/premium',
        },
        {
            title: 'Duo',
            desc: '2 акаунти для пар, що мешкають разом',
            redirectlink: '/premium/duo',
        },
        {
            title: 'Family',
            desc: "До 6 акаунтів для членів сім'ї, що мешкають разом",
            redirectlink: '/premium/family',
        },
        {
            title: 'Student',
            desc: '1 акаунт, знижка для студентів',
            redirectlink: '/premium/student',
        },
        {
            title: 'Kids+',
            desc: 'До 3 акаунтів для дітей, що мешкають разом',
            redirectlink: '/premium/kids',
        },
    ]

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (premiumRef.current && !premiumRef.current.contains(e.target as Node)) {
                setOpenPremium(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <header className="w-full relative z-40" style={{ backgroundColor: PURPLE_BG }}>
            <div
                className="mx-auto flex items-center justify-between px-4 sm:px-8 lg:px-16 xl:px-40 py-2.5"
                style={{ maxWidth: 1440, height: 75 }}
            >
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
                                        onClick={() => {
                                            navigate(plan.redirectlink)
                                            setOpenPremium(false)
                                        }}
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

                    <Link to="/support" className="flex flex-col font-semibold justify-center shrink-0 text-base cursor-pointer hover:opacity-80 transition-opacity">
                        <span className="leading-normal">Підтримка</span>
                    </Link>

                    <Link to="/download" className="flex flex-col font-semibold justify-center shrink-0 text-base cursor-pointer hover:opacity-80 transition-opacity">
                        <span className="leading-normal">Завантажити</span>
                    </Link>

                    <Link to="/register" className="flex flex-col font-semibold justify-center shrink-0 text-base cursor-pointer hover:opacity-80 transition-opacity">
                        <span className="leading-normal">Зареєструватися</span>
                    </Link>

                    <Link to="/login" className="flex flex-col font-semibold justify-center shrink-0 text-base cursor-pointer hover:opacity-80 transition-opacity">
                        <span className="leading-normal">Увійти</span>
                    </Link>

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
                                <Link
                                    key={plan.title}
                                    to={plan.redirectlink}
                                    onClick={() => {
                                        setOpenPremium(false)
                                        setMobileMenuOpen(false)
                                    }}
                                    className="text-left py-1.5"
                                >
                                    <p className="font-bold text-sm">{plan.title}</p>
                                    <p className="text-xs opacity-80">{plan.desc}</p>
                                </Link>
                            ))}
                        </div>
                    )}
                    <Link
                        to="/support"
                        onClick={() => setMobileMenuOpen(false)}
                        className="font-semibold text-base py-1 cursor-pointer"
                    >
                        Підтримка
                    </Link>
                    <Link
                        to="/download"
                        onClick={() => setMobileMenuOpen(false)}
                        className="font-semibold text-base py-1 cursor-pointer"
                    >
                        Завантажити
                    </Link>
                    <Link
                        to="/register"
                        onClick={() => setMobileMenuOpen(false)}
                        className="font-semibold text-base py-1 cursor-pointer"
                    >
                        Зареєструватися
                    </Link>
                    <Link
                        to="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="font-semibold text-base py-1 cursor-pointer"
                    >
                        Увійти
                    </Link>
                    <span className="text-sm opacity-80 pt-1 border-t border-white/10">
                        Мова: Укр
                    </span>
                </div>
            )}
        </header>
    );
};