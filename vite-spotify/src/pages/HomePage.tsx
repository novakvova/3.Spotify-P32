import { Link } from 'react-router-dom'
import { useGetGenresQuery } from '../services/genres/genresApi'
import { useAppSelector } from '../store/hooks'
import { selectCurrentUser, selectIsAuthenticated } from '../store/slices/authSlice'

export default function HomePage() {
    const isAuth = useAppSelector(selectIsAuthenticated)
    const user = useAppSelector(selectCurrentUser)
    const { data: genres } = useGetGenresQuery()

    return (
        <div className="max-w-4xl">
            <section className="mb-10">
                <p className="text-sm font-medium mb-2" style={{ color: 'var(--accent)' }}>
                    {isAuth ? `Ласкаво просимо назад` : `Музика без меж`}
                </p>
                <h1 className="text-5xl font-extrabold leading-tight mb-4" style={{ color: 'var(--text)' }}>
                    {isAuth ? `Привіт, ${user?.username} 👋` : 'Твій особистий\nмузичний простір'}
                </h1>
                <p className="text-base mb-6" style={{ color: 'var(--text-2)' }}>
                    Слухай улюблену музику, відкривай нові жанри та виконавців
                </p>
                <Link
                    to="/songs"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105"
                    style={{ background: 'var(--accent)', color: '#000' }}
                >
                    ▶ Слухати зараз
                </Link>
            </section>

            {genres && genres.length > 0 && (
                <section className="mb-10">
                    <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text)' }}>Жанри</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {genres.map((g) => (
                            <Link
                                key={g.id}
                                to={`/songs?genre=${g.id}`}
                                className="p-4 rounded-xl font-semibold text-sm transition-all hover:scale-105"
                                style={{ background: 'var(--bg-card)', color: 'var(--text)', border: '1px solid var(--border)' }}
                            >
                                {g.name}
                            </Link>
                        ))}
                    </div>
                </section>
            )}
            <section>
                <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text)' }}>Пісні</h2>
                <div
                    className="rounded-xl p-5 text-sm"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-2)' }}
                >
                    Список пісень появиться після реалізації{' '}
                    <code
                        className="px-1.5 py-0.5 rounded text-xs"
                        style={{ background: 'var(--bg-hover)', color: 'var(--accent)' }}
                    >
                        GET /api/songs
                    </code>{' '}
                    на бекенді.{' '}
                    <Link to="/songs" style={{ color: 'var(--accent)' }}>Перейти до пісень →</Link>
                </div>
            </section>
        </div>
    )
}