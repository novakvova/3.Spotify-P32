import { Link } from 'react-router-dom'
import { useGetGenresQuery } from '../services/genres/genresApi'

export default function GenresPage() {
    const { data: genres, isLoading, isError } = useGetGenresQuery()

    if (isLoading) return (
        <div className="flex items-center justify-center h-48">
            <p style={{ color: 'var(--text-3)' }}>Завантаження...</p>
        </div>
    )

    return (
        <div className="max-w-4xl">
            <h1 className="text-3xl font-extrabold mb-6" style={{ color: 'var(--text)' }}>Жанри</h1>

            {isError && (
                <div
                    className="rounded-xl p-4 mb-6 text-sm"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-2)' }}
                >
                    ⚠ Помилка завантаження жанрів
                </div>
            )}

            {genres && genres.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {genres.map((g) => (
                        <Link
                            key={g.id}
                            to={`/genres/${g.id}`}
                            className="p-5 rounded-xl transition-all hover:scale-105"
                            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                        >
                            <p className="font-bold text-sm mb-1" style={{ color: 'var(--text)' }}>{g.name}</p>
                            {g.description && (
                                <p className="text-xs line-clamp-2" style={{ color: 'var(--text-3)' }}>{g.description}</p>
                            )}
                        </Link>
                    ))}
                </div>
            ) : !isError && (
                <p style={{ color: 'var(--text-3)' }}>Жанри відсутні</p>
            )}
        </div>
    )
}