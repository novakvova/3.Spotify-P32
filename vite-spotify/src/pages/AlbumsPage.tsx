import { useGetAlbumsQuery } from '../services/albums/albumsApi'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Disc } from 'lucide-react'
import MediaImage from '../components/MediaImage'

const CARD_GRADIENT_CLASSES = [
    'bg-linear-to-br from-sonora-purple to-sonora-light',
    'bg-linear-to-br from-sonora-warm to-sonora-pink',
    'bg-linear-to-br from-violet-900 to-purple-600',
    'bg-linear-to-br from-purple-700 to-pink-500',
    'bg-linear-to-br from-purple-900 to-purple-500',
    'bg-linear-to-br from-fuchsia-800 to-purple-400',
]

export default function AlbumsPage() {
    const { t } = useTranslation()
    const { data: allAlbums, isLoading, isError } = useGetAlbumsQuery()

    const [searchParams] = useSearchParams()
    const search = searchParams.get('search') ?? ''
    const albums = allAlbums
        ? allAlbums.filter((album) => {
              if (!search) return true
              return album.title?.toLowerCase().includes(search.toLowerCase())
          })
        : []

    if (isLoading)
        return (
            <div className="flex items-center justify-center h-48">
                <p className="animate-pulse text-sm text-sonora-muted">
                    {t('catalog.albumsLoading')}
                </p>
            </div>
        )

    return (
        <div className="w-full pb-10 select-none">
            <h1 className="text-3xl font-black tracking-tight mb-6 text-white">
                {t('catalog.albumsTitle')}
            </h1>

            {isError && (
                <div className="rounded-xl p-4 mb-6 text-xs font-semibold bg-red-500/10 border border-red-500/20 text-red-400">
                    {t('catalog.albumsError')}
                </div>
            )}

            {albums && albums.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
                    {albums.map((album, idx) => (
                        <Link
                            key={album.id}
                            to={`/albums/${album.id}`}
                            className="flex flex-col gap-3 transition-all group cursor-pointer"
                        >
                            <MediaImage
                                src={album.coverUrl}
                                alt={album.title}
                                className={`w-full aspect-square rounded-lg relative overflow-hidden shadow-md transition-transform group-hover:scale-105 ${CARD_GRADIENT_CLASSES[idx % CARD_GRADIENT_CLASSES.length]}`}
                                fallback={
                                    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                                        <Disc
                                            size={52}
                                            className="text-white/80 mb-2 transition-transform duration-500 group-hover:rotate-180"
                                        />
                                        <span className="font-bold text-sm text-white line-clamp-2">
                                            {album.title}
                                        </span>
                                    </div>
                                }
                            />

                            <div className="min-w-0 px-0.5">
                                <p className="font-bold text-base truncate transition-colors text-white">
                                    {album.title}
                                </p>
                                <p className="text-sm font-normal mt-0.5 text-sonora-muted">
                                    {t('catalog.releaseYear', { year: album.releaseYear })}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                !isError && (
                    <p className="text-sm text-sonora-muted">
                        {t('catalog.albumsEmpty')}
                    </p>
                )
            )}
        </div>
    )
}
