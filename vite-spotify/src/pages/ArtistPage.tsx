import { useGetArtistsQuery, useSearchArtistsQuery } from '../services/artists/artistsApi'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import MediaImage from '../components/MediaImage'

const CARD_GRADIENT_CLASSES = [
    'bg-linear-to-br from-sonora-purple to-sonora-light',
    'bg-linear-to-br from-sonora-warm to-sonora-pink',
    'bg-linear-to-br from-violet-900 to-purple-600',
    'bg-linear-to-br from-purple-700 to-pink-500',
    'bg-linear-to-br from-purple-900 to-purple-500',
    'bg-linear-to-br from-fuchsia-800 to-purple-400',
]

export default function ArtistsPage() {
    const { t } = useTranslation()
    const [searchParams] = useSearchParams()
    const search = searchParams.get('search') ?? ''
    const {
        data: allArtists,
        isLoading: isAllLoading,
        isError: isAllError,
    } = useGetArtistsQuery(undefined, { skip: !!search })
    const {
        data: searchArtists,
        isLoading: isSearchLoading,
        isError: isSearchError,
    } = useSearchArtistsQuery(search, { skip: !search })
    const artists = search ? (searchArtists ?? []) : (allArtists ?? [])
    const isLoading = search ? isSearchLoading : isAllLoading
    const isError = search ? isSearchError : isAllError

    if (isLoading)
        return (
            <div className="flex items-center justify-center h-48">
                <p className="text-sonora-muted">{t('catalog.loading')}</p>
            </div>
        )

    return (
        <div className="w-full">
            <h1 className="text-3xl font-extrabold mb-6 text-white">
                {t('catalog.artistsTitle')}
            </h1>

            {isError && (
                <div className="rounded-xl p-4 mb-6 text-sm bg-sonora-panel border border-white/10 text-sonora-lavender">
                    {t('catalog.artistsError')}
                </div>
            )}

            {artists && artists.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
                    {artists.map((artist, idx) => (
                        <Link
                            key={artist.id}
                            to={`/artists/${artist.id}`}
                            className="flex flex-col items-start gap-3 transition-all group cursor-pointer"
                        >
                            <MediaImage
                                src={artist.imageUrl}
                                alt={artist.name}
                                className={`w-full aspect-square rounded-full overflow-hidden flex items-center justify-center text-5xl font-black text-white shadow-md transition-transform group-hover:scale-105 ${CARD_GRADIENT_CLASSES[idx % CARD_GRADIENT_CLASSES.length]}`}
                                fallback={<span>{artist.name[0]?.toUpperCase() ?? '?'}</span>}
                            />
                            <div className="min-w-0 w-full">
                                <p className="font-bold text-base truncate text-white">
                                    {artist.name}
                                </p>
                                <p className="text-sm mt-0.5 text-sonora-muted">
                                    {artist.birthDate
                                        ? new Date(artist.birthDate).getFullYear()
                                        : t('webPlayer.artistRole')}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                !isError && <p className="text-sonora-muted">{t('catalog.artistsEmpty')}</p>
            )}
        </div>
    )
}
