import { Link } from 'react-router-dom'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import { useAppSelector } from '../store/hooks'
import { selectLanguage } from '../store/slices/languageSlice'

const CUSTOMER_SUPPORT_ITEMS = [
    {
        titleUk: 'Центр підтримки',
        titleEn: 'Help Center',
        descriptionUk:
            'У нашому центрі підтримки ти знайдеш відповіді на поширені запитання та корисну інформацію про використання Sonora.',
        descriptionEn:
            'In our Help Center you will find answers to frequently asked questions and useful information on how to use Sonora.',
        to: '/support',
    },
    {
        titleUk: 'Спільнота Sonora',
        titleEn: 'Sonora Community',
        descriptionUk:
            'Спілкуйся з іншими користувачами, ділися музичними відкриттями, пропонуй ідеї та обговорюй улюблених виконавців.',
        descriptionEn:
            'Connect with other listeners, share music discoveries, suggest ideas, and discuss your favorite artists.',
    },
    {
        titleUk: "Зв'язатися з нами",
        titleEn: 'Contact us',
        descriptionUk:
            'Не знайшов відповіді на своє запитання? Наша команда готова допомогти. Напиши нам, і ми постараємося вирішити твою проблему.',
        descriptionEn:
            'Didn’t find the answer to your question? Our team is ready to help. Write to us and we will do our best to resolve your issue.',
        to: '/support',
    },
]

const SONORA_FEATURES = [
    {
        titleUk: 'Музика для кожного',
        titleEn: 'Music for everyone',
        descriptionUk:
            'Від улюблених хітів до нових жанрів — відкривай звучання, яке відповідає саме твоєму настрою',
        descriptionEn:
            'From favorite hits to new genres — discover the sound that matches your exact mood',
    },
    {
        titleUk: 'Твій особистий простір',
        titleEn: 'Your personal space',
        descriptionUk:
            'Створюй плейлисти, зберігай улюблене та знаходь нові композиції завдяки персональним рекомендаціям',
        descriptionEn:
            'Create playlists, save favorites, and discover new tracks with personalized recommendations',
    },
    {
        titleUk: 'Для всієї родини',
        titleEn: 'For the whole family',
        descriptionUk:
            'Sonora Kids відкриває наймолодшим слухачам світ дитячої музики, аудіоказок та історій',
        descriptionEn:
            'Sonora Kids opens the world of children’s music, audio fairy tales, and stories for the youngest listeners',
    },
]

export default function AboutPage() {
    const lang = useAppSelector(selectLanguage)
    const isEn = lang === 'en'

    return (
        <div className="min-h-screen w-full bg-white flex flex-col justify-between" style={{ color: '#280a3a' }}>
            <Header />

            <main className="flex-1 w-full">
                <div
                    className="mx-auto px-6 sm:px-12 lg:px-16 xl:px-40 pt-14 sm:pt-16 pb-12"
                    style={{ maxWidth: 1440 }}
                >
                    <div className="flex flex-col lg:flex-row items-start justify-between gap-12 xl:gap-24">
                        <div className="w-full flex flex-col" style={{ maxWidth: 633 }}>
                            <h1
                                className="font-extrabold mb-10"
                                style={{ fontSize: 40, lineHeight: '55px', color: '#e869ca' }}
                            >
                                {isEn ? 'About Us' : 'Про нас'}
                            </h1>

                            <div
                                className="flex flex-col gap-6 font-normal text-lg mb-20"
                                style={{ lineHeight: '30px', color: '#280a3a' }}
                            >
                                <p>
                                    {isEn
                                        ? 'With Sonora, it’s easy to find the right music, podcasts, and audio stories for every moment and listen on your phone, computer, or tablet.'
                                        : "З Sonora легко знаходити музику, подкасти та аудіоісторії на будь-який випадок і слухати їх на телефоні, комп'ютері чи планшеті."}
                                </p>
                                <p>
                                    {isEn
                                        ? 'On Sonora you can discover new tracks, listen to your favorite artists, and find audio for any mood. Your favorite music is always with you — on the go, while studying, working, exercising, or relaxing.'
                                        : 'У Sonora ти можеш відкривати для себе нові треки, слухати улюблених виконавців і знаходити аудіо для будь-якого настрою. Улюблена музика завжди буде поруч — дорогою, під час навчання, роботи, тренувань або відпочинку.'}
                                </p>
                                <p>
                                    {isEn
                                        ? 'Create your own playlists, explore curated music collections, discover new artists, or trust our recommendations. And with Sonora Kids, the youngest listeners can also enjoy children’s music and fairy tales.'
                                        : 'Створюй власні плейлисти, досліджуй музичні добірки, відкривай нових виконавців або довірся нашим рекомендаціям. А завдяки Sonora Kids наймолодші слухачі також зможуть насолоджуватися дитячою музикою та казками.'}
                                </p>
                                <p>
                                    {isEn
                                        ? 'With Sonora, every day sounds special. Choose a Premium plan or enjoy music with free access.'
                                        : 'З Sonora кожен день звучить по-особливому. Обирай підписку або насолоджуйся музикою з безкоштовним доступом.'}
                                </p>
                            </div>

                            <h2
                                className="font-extrabold mb-10"
                                style={{ fontSize: 40, lineHeight: '55px', color: '#e869ca' }}
                            >
                                {isEn ? 'Customer Support' : 'Підтримка клієнтів'}
                            </h2>

                            <div className="flex flex-col gap-8" style={{ maxWidth: 609 }}>
                                {CUSTOMER_SUPPORT_ITEMS.map((item) => (
                                    <div
                                        key={item.titleUk}
                                        className="flex flex-col gap-1 text-lg"
                                        style={{ lineHeight: '28px', color: '#280a3a' }}
                                    >
                                        {item.to ? (
                                            <Link
                                                to={item.to}
                                                className="font-bold hover:underline"
                                                style={{ color: '#280a3a' }}
                                            >
                                                {isEn ? item.titleEn : item.titleUk}
                                            </Link>
                                        ) : (
                                            <span className="font-bold" style={{ color: '#280a3a' }}>
                                                {isEn ? item.titleEn : item.titleUk}
                                            </span>
                                        )}
                                        <p className="font-normal">
                                            {isEn ? item.descriptionEn : item.descriptionUk}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <aside className="w-full lg:shrink-0 flex flex-col" style={{ maxWidth: 353 }}>
                            <h2
                                className="font-extrabold mb-8"
                                style={{ fontSize: 30, lineHeight: '35px', color: '#e869ca' }}
                            >
                                {isEn ? 'Headquarters' : 'Центральний офіс'}
                            </h2>

                            <div
                                className="flex flex-col text-lg mb-16"
                                style={{ lineHeight: '30px', color: '#280a3a' }}
                            >
                                <p className="font-bold">Sonora</p>
                                <p>{isEn ? 'Ukraine' : 'Україна'}</p>
                                <p>
                                    Email:{' '}
                                    <a
                                        href="mailto:hello@sonora.com"
                                        className="underline hover:opacity-80"
                                    >
                                        hello@sonora.com
                                    </a>
                                </p>
                            </div>

                            <div
                                className="p-10 flex flex-col"
                                style={{
                                    minHeight: 645,
                                    border: '2px solid #e869ca',
                                    borderRadius: 30,
                                }}
                            >
                                <p
                                    className="font-semibold text-sm uppercase tracking-wider mb-4"
                                    style={{ color: '#280a3a' }}
                                >
                                    {isEn ? 'SONORA FEATURES' : 'МОЖЛИВОСТІ SONORA'}
                                </p>

                                <h3
                                    className="font-extrabold text-xl mb-10"
                                    style={{ lineHeight: '26px', color: '#280a3a' }}
                                >
                                    {isEn ? 'More than just music' : 'Більше, ніж просто музика'}
                                </h3>

                                <div className="flex flex-col gap-10">
                                    {SONORA_FEATURES.map((feature) => (
                                        <div key={feature.titleUk} className="flex flex-col gap-3">
                                            <h4
                                                className="font-bold text-xl"
                                                style={{ lineHeight: '24px', color: '#e869ca' }}
                                            >
                                                {isEn ? feature.titleEn : feature.titleUk}
                                            </h4>
                                            <p
                                                className="font-normal text-base"
                                                style={{ lineHeight: '24px', color: '#280a3a' }}
                                            >
                                                {isEn ? feature.descriptionEn : feature.descriptionUk}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
