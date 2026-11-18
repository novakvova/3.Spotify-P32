import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useGetGenresQuery } from '../services/genres/genresApi'

export default function GenresPage() {
    const { t } = useTranslation()
    const { data: genres, isLoading, isError } = useGetGenresQuery()

    if (isLoading)
        return (
            <div className="flex items-center justify-center h-48">
                <p className="text-sonora-muted">{t('catalog.loading')}</p>
            </div>
        )

    return (
        <div className="w-full">
            <h1 className="text-3xl font-extrabold mb-6 text-white">{t('catalog.genresTitle')}</h1>

            {isError && (
                <div className="rounded-xl p-4 mb-6 text-sm bg-sonora-panel border border-white/10 text-sonora-lavender">
                    {t('catalog.genresError')}
                </div>
            )}

            {genres && genres.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {genres.map((g) => (
                        <Link
                            key={g.id}
                            to={`/genres/${g.id}`}
                            className="p-5 rounded-xl transition-all hover:scale-105 bg-sonora-panel border border-white/10"
                        >
                            <p className="font-bold text-sm mb-1 text-white">{g.name}</p>
                            {g.description && (
                                <p className="text-xs line-clamp-2 text-sonora-muted">{g.description}</p>
                            )}
                        </Link>
                    ))}
                </div>
            ) : (
                !isError && <p className="text-sonora-muted">{t('catalog.genresEmpty')}</p>
            )}
        </div>
    )
}
