import React from 'react';
import { FAQ } from '../components/FAQ';
import kidshero from '../assets/home/kids-hero.png';
import kidsfeature from '../assets/home/kids-feature.png';
import { Header } from "../components/Header.tsx";
import {Footer} from "../components/Footer.tsx";

// SVG Галочка з кольором #AA71FF
const CheckIcon: React.FC = () => (
    <svg width="25" height="20" viewBox="0 0 25 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
        <path d="M21.9352 0.60984C22.0997 0.41905 22.2964 0.266869 22.5138 0.162178C22.7313 0.0574863 22.9652 0.00238027 23.2019 7.54224e-05C23.4386 -0.00222943 23.6733 0.048313 23.8924 0.148753C24.1115 0.249194 24.3105 0.397521 24.4779 0.58508C24.6453 0.772639 24.7776 0.995673 24.8673 1.24117C24.9569 1.48667 25.002 1.74971 24.9999 2.01495C24.9979 2.28018 24.9487 2.54231 24.8553 2.78602C24.7619 3.02973 24.6261 3.25016 24.4558 3.43443L10.1951 19.4151C9.86083 19.7896 9.40751 20 8.93483 20C8.46215 20 8.00883 19.7896 7.67454 19.4151L0.544202 11.4248C0.373947 11.2405 0.238146 11.0201 0.144722 10.7764C0.0512988 10.5327 0.00212408 10.2705 6.73045e-05 10.0053C-0.00198947 9.74006 0.043113 9.47702 0.132743 9.23152C0.222373 8.98602 0.354735 8.76299 0.522107 8.57543C0.689479 8.38787 0.888508 8.23954 1.10758 8.1391C1.32665 8.03866 1.56138 7.98812 1.79807 7.99043C2.03477 7.99273 2.26868 8.04784 2.48616 8.15253C2.70364 8.25722 2.90034 8.4094 3.06478 8.60019L8.93483 15.1783L21.9352 0.60984Z" fill="#AA71FF"/>
    </svg>
);

export const KidsPage: React.FC = () => {
    const faqList = [
        { question: "Ми отримаємо спільний акаунт чи окремий для кожного?" },
        { question: "У мене вже є Premium-підписка. Що станеться з моєю збереженою музикою?" },
        { question: "Чи можна слухати контент без інтернету?" },
        { question: "Як скасувати підписку, якщо дитині не сподобається?" }
    ];

    return (
        <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
            <Header />

            {/* Hero Section */}
            <section className="bg-[#AA71FF] text-white text-center py-20 px-4">
                <div className="max-w-3xl mx-auto space-y-5">
                    <h1 className="font-['Inter'] text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                        Kids+
                    </h1>
                    <p className="text-sm sm:text-base font-medium opacity-95 max-w-xl mx-auto leading-relaxed">
                        Додайте Premium Kids до своєї підписки та подаруйте дітям безпечний простір для прослуховування. До 3 акаунтів Premium для дітей, що мешкають разом. Усього за 0,99 $ на місяць.
                    </p>
                    <div className="pt-4">
                        <button className="bg-white text-[#AA71FF] font-extrabold py-3.5 px-24 rounded-full hover:bg-gray-50 transition shadow-md cursor-pointer text-base">
                            Підключити Kids+
                        </button>
                    </div>
                </div>
            </section>

            {/* Second Section: збільшена відстань між текстом та фото */}
            <section className="sm:px-12 max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 lg:gap-16">
                <div className="max-w-lg space-y-5 text-left">
                    <h2 className="font-['Inter'] text-3xl sm:text-4xl font-extrabold text-[#120826] tracking-tight leading-tight">
                        Чарівний світ казок<br />та колискових
                    </h2>
                    <p className="text-[#120826] text-base sm:text-lg font-bold leading-snug">
                        Величезна бібліотека українських народних та авторських казок, колискових і дитячих пісень
                    </p>
                </div>

                <div className="w-full md:w-auto flex justify-center shrink-0">
                    <img src={kidsfeature} alt="Parental control" className="w-full max-w-[340px] sm:max-w-[380px] object-contain"
                    />
                </div>
            </section>

            {/* Banner Section */}
            <section className="bg-[#AA71FF] text-white text-center py-10 px-4">
                <div className="max-w-4xl mx-auto space-y-2">
                    <h2 className="font-['Inter'] text-2xl sm:text-3xl font-extrabold tracking-tight">Найкраще для вашої малечі</h2>
                    <p className="text-sm sm:text-base font-medium opacity-95">
                        До 3 акаунтів Premium для дітей усього за 0.99 $ на місяць з змогою скасування в будь-який момент
                    </p>
                </div>
            </section>

            {/* Details Grid Section з вертикальною лінією */}
            <section className="py-20 px-8 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 sm:gap-16 relative">
                <div className="hidden md:block absolute left-1/2 top-16 bottom-16 w-[2px] bg-[#AA71FF] -translate-x-1/2" />

                <div className="space-y-6 md:pr-8">
                    <h3 className="font-['Inter'] text-2xl sm:text-3xl font-extrabold text-[#120826] tracking-tight leading-snug">
                        Чому варто підключити<br />Kids+?
                    </h3>
                    <ul className="space-y-5 text-sm sm:text-base text-gray-800">
                        <li className="flex items-start gap-4">
                            <CheckIcon />
                            <span>Слухайте офлайн будь-де</span>
                        </li>
                        <li className="flex items-start gap-4">
                            <CheckIcon />
                            <span>Казки та колискові без реклами</span>
                        </li>
                        <li className="flex items-start gap-4">
                            <CheckIcon />
                            <span>Батьківський контроль</span>
                        </li>
                        <li className="flex items-start gap-4">
                            <CheckIcon />
                            <span>Безпечний простір</span>
                        </li>
                    </ul>
                </div>

                <div className="space-y-6 md:pl-8">
                    <h3 className="font-['Inter'] text-2xl sm:text-3xl font-extrabold text-[#120826] tracking-tight leading-snug">
                        Уже маєте підписку<br />Sonora Premium?
                    </h3>
                    <p className="text-sm sm:text-base text-gray-700">
                        Коли ви додаєте Kids+, ваші власні миті, плейлисти й збережені:
                    </p>
                    <ul className="space-y-5 text-sm sm:text-base text-gray-800">
                        <li className="flex items-start gap-4">
                            <CheckIcon />
                            <span>Основна підписка не змінюється</span>
                        </li>
                        <li className="flex items-start gap-4">
                            <CheckIcon />
                            <span>Усі ваші треки та плейлисти зберігаються</span>
                        </li>
                        <li className="flex items-start gap-4">
                            <CheckIcon />
                            <span>Дитячі профілі підключаються в один клік</span>
                        </li>
                    </ul>
                </div>
            </section>

            {/* Parental control block */}
            <section className="bg-[#AA71FF] text-white flex flex-col md:flex-row items-center justify-center gap-12">
                <div className="w-full md:w-auto flex justify-center">
                    <img src={kidshero} alt="Kids hero" className="w-full max-w-[280px] object-contain" />
                </div>
                <div className="max-w-md text-left space-y-3">
                    <h2 className="font-['Inter'] text-3xl font-extrabold tracking-tight">Батьківський контроль</h2>
                    <p className="text-purple-100 text-sm sm:text-base leading-relaxed">
                        Легко керуйте контентом та створюйте безпечний простір, щоб завжди бути впевненими в тому, що слухають ваші діти.
                    </p>
                </div>
            </section>

            <section className="py-14 text-center px-4">
                <h2 className="font-['Inter'] text-3xl font-extrabold mb-2 text-[#120826] tracking-tight">Можна скасувати будь-коли</h2>
                <p className="text-gray-500 text-sm">Kids+ не для вас? Не проблема. Підписку можна скасувати будь-коли</p>
            </section>

            {/* Steps Section */}
            <section className="bg-[#AA71FF] text-white py-20 px-6 text-center">
                <h2 className="font-['Inter'] text-3xl sm:text-4xl font-extrabold mb-16 tracking-tight">
                    Підключити Kids+ — це легко
                </h2>
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="w-16 h-16 bg-[#6B309B] text-white rounded-full flex items-center justify-center font-extrabold text-2xl shadow-lg">
                            1
                        </div>
                        <p className="text-sm leading-relaxed opacity-95 max-w-[260px]">
                            Увійдіть у свій акаунт у додатку або на сайті
                        </p>
                    </div>

                    <div className="flex flex-col items-center space-y-4">
                        <div className="w-16 h-16 bg-[#6B309B] text-white rounded-full flex items-center justify-center font-extrabold text-2xl shadow-lg">
                            2
                        </div>
                        <p className="text-sm leading-relaxed opacity-95 max-w-[260px]">
                            Додайте опцію Kids+ у налаштуваннях підписки
                        </p>
                    </div>

                    <div className="flex flex-col items-center space-y-4">
                        <div className="w-16 h-16 bg-[#6B309B] text-white rounded-full flex items-center justify-center font-extrabold text-2xl shadow-lg">
                            3
                        </div>
                        <p className="text-sm leading-relaxed opacity-95 max-w-[260px]">
                            Насолоджуйтеся спеціальним дитячим додатком та казками
                        </p>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <FAQ items={faqList} />
            <Footer/>
        </div>
    );
};
