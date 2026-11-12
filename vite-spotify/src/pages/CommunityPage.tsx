import React from 'react';
import { Header } from "../components/Header.tsx";
import creatorHeroBg from '../assets/home/creator-hero-bg.png';
import audienceFeatureImg from '../assets/home/audience-feature.png';
import monetizeFeatureImg from '../assets/home/monetize-feature.png';
import standOutFeatureImg from '../assets/home/stand-out-feature.png';
import { Footer } from "../components/Footer.tsx";
import { useAppSelector } from '../store/hooks'; // Перевірте точний шлях до ваших Redux-хуків та селекторів
import { selectLanguage } from '../store/slices/languageSlice';

export const CommunityPage: React.FC = () => {
    const lang = useAppSelector(selectLanguage);
    const isEn = lang === 'en';

    const cards = [
        {
            titleUk: 'Аудіоподкасти',
            titleEn: 'Audio Podcasts',
            descriptionUk:
                'Усе необхідне для поширення епізодів, залучення слухачів та масштабування вашого шоу на будь-якій платформі',
            descriptionEn:
                'Everything you need to distribute episodes, engage listeners, and scale your show across any platform',
        },
        {
            titleUk: 'Відеоподкасти',
            titleEn: 'Video Podcasts',
            descriptionUk:
                'Усі необхідні інструменти для завантаження відео, залучення глядачів та розширення вашої аудиторії',
            descriptionEn:
                'All the essential tools to upload video, captivate viewers, and grow your audience',
        },
    ];

    return (
        <div className="min-h-screen bg-white text-[#120826] overflow-x-hidden">
            <div className="bg-[#120826] text-white">
                <Header />

                {/* First Hero Section */}
                <section className="relative w-full flex items-center overflow-hidden bg-[#120826]">
                    <div className="absolute inset-0 z-0 flex justify-end items-start pointer-events-none">
                        <img
                            src={creatorHeroBg}
                            alt={isEn ? "Creator podcast background" : "Фон для творців подкастів"}
                            className="w-full lg:w-auto h-full object-cover lg:object-contain object-top object-right"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#120826] via-[#120826]/80 lg:via-[#120826]/40 to-transparent" />
                    </div>

                    <div className="relative z-10 max-w-7xl mx-auto w-full px-6 sm:px-12 lg:px-16 py-16 lg:py-24 flex items-center">
                        <div className="max-w-xl space-y-6">
                            <h1 className="font-['Inter'] text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
                                {isEn ? 'Turn your show into the next big hit' : 'Перетворіть своє шоу на новий хіт'}
                            </h1>
                            <p className="text-base sm:text-lg font-normal text-gray-200 leading-relaxed opacity-95 max-w-lg">
                                {isEn
                                    ? 'Powerful Sonora tools to effortlessly manage and grow your audio or video podcast'
                                    : 'Потужні інструменти Sonora для зручного керування та розвитку вашого аудіо- чи відеоподкасту'}
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
                            {isEn ? 'All the tools to grow your show' : 'Усі інструменти для розвитку вашого шоу'}
                        </h2>
                    </div>

                    {/* Блок 1 */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-12 lg:gap-20">
                        <div className="w-full md:w-1/2 flex justify-center shrink-0">
                            <img
                                src={audienceFeatureImg}
                                alt={isEn ? "Build a loyal audience" : "Аудиторія"}
                                className="w-full max-w-[480px] h-auto object-contain"
                            />
                        </div>
                        <div className="w-full md:w-1/2 space-y-6 text-left">
                            <h3 className="font-['Inter'] text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-snug text-[#120826]">
                                {isEn ? 'Build a loyal audience' : 'Створіть віддану аудиторію'}
                            </h3>
                            <p className="text-gray-700 text-base sm:text-lg font-medium leading-relaxed max-w-lg">
                                {isEn
                                    ? 'Reach millions of listeners who can easily discover your episodes. Upload clips, interact in the comments, and analyze your stats to build a dedicated fanbase.'
                                    : 'Отримуйте мільйони слухачів, які легко знайдуть ваші епізоди. Завантажуйте кліпи, спілкуйтеся в коментарях та аналізуйте статистику, щоб збирати віддану аудиторію.'}
                            </p>
                            <div className="pt-2">
                                <button className="border-2 border-[#120826] text-[#120826] font-extrabold py-3.5 px-10 rounded-full hover:bg-[#120826] hover:text-white transition shadow-sm cursor-pointer text-base">
                                    {isEn ? 'Learn more' : 'Дізнатись більше'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Блок 2 */}
                    <div className="flex flex-col md:flex-row-reverse items-center justify-between gap-12 lg:gap-20">
                        <div className="w-full md:w-1/2 flex justify-center shrink-0">
                            <img
                                src={monetizeFeatureImg}
                                alt={isEn ? "Monetize your show" : "Монетизація"}
                                className="w-full max-w-[480px] h-auto object-contain"
                            />
                        </div>
                        <div className="w-full md:w-1/2 space-y-6 text-left">
                            <h3 className="font-['Inter'] text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-snug text-[#120826]">
                                {isEn ? 'Monetize your show' : 'Заробляйте на своєму шоу'}
                            </h3>
                            <p className="text-gray-700 text-base sm:text-lg font-medium leading-relaxed max-w-lg">
                                {isEn
                                    ? 'Earn effortlessly: take advantage of new monetization tools and the Sonora Partner Program'
                                    : 'Заробляйте легко: скористайтеся новими інструментами монетизації та партнерською програмою Sonora'}
                            </p>
                            <div className="pt-2">
                                <button className="border-2 border-[#120826] text-[#120826] font-extrabold py-3.5 px-10 rounded-full hover:bg-[#120826] hover:text-white transition shadow-sm cursor-pointer text-base">
                                    {isEn ? 'Learn more' : 'Дізнатись більше'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Блок 3 */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-12 lg:gap-20">
                        <div className="w-full md:w-1/2 flex justify-center shrink-0">
                            <img
                                src={standOutFeatureImg}
                                alt={isEn ? "Stand out on Sonora" : "Виділяйтеся"}
                                className="w-full max-w-[480px] h-auto object-contain"
                            />
                        </div>
                        <div className="w-full md:w-1/2 space-y-6 text-left">
                            <h3 className="font-['Inter'] text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-snug text-[#120826]">
                                {isEn ? 'Stand out on Sonora' : 'Виділяйтеся на Sonora'}
                            </h3>
                            <p className="text-gray-700 text-base sm:text-lg font-medium leading-relaxed max-w-lg">
                                {isEn
                                    ? 'Customize your podcast page, cover art, and video thumbnails on Sonora to capture listeners’ attention'
                                    : 'Налаштовуйте сторінку подкасту, обкладинки та відеомініатюри на Sonora, щоб привертати увагу слухачів'}
                            </p>
                            <div className="pt-2">
                                <button className="border-2 border-[#120826] text-[#120826] font-extrabold py-3.5 px-10 rounded-full hover:bg-[#120826] hover:text-white transition shadow-sm cursor-pointer text-base">
                                    {isEn ? 'Learn more' : 'Дізнатись більше'}
                                </button>
                            </div>
                        </div>
                    </div>
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
                    {cards.map((card) => (
                        <div
                            key={card.titleUk}
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
                                        {isEn ? card.titleEn : card.titleUk}
                                    </h3>

                                    <p className="ml-[9.5%] mr-[18%] mt-[9%] text-left text-[clamp(11px,1.4vw,17px)] font-normal leading-[1.5]">
                                        {isEn ? card.descriptionEn : card.descriptionUk}
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