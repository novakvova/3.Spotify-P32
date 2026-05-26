import { useGetAlbumsQuery } from '../services/albums/albumsApi'
import {Link, useSearchParams} from 'react-router-dom'
import { Disc } from 'lucide-react'

export default function AlbumsPage() {
    const { data: allAlbums, isLoading, isError } = useGetAlbumsQuery()

    const [searchParams] = useSearchParams()
    const search = searchParams.get('search') ?? ''
    const albums = allAlbums ? allAlbums.filter(album => {
        if (!search) return true
        return album.title?.toLowerCase().includes(search.toLowerCase())
    }) : []
    if (isLoading) return (
        <div className="flex items-center justify-center h-48">
            <p className="animate-pulse text-sm" style={{ color: 'var(--text-3)' }}>Завантаження альбомів...</p>
        </div>
    )

    return (
        <div className="max-w-4xl pb-10 select-none">
            <h1 className="text-3xl font-black tracking-tight mb-6" style={{ color: 'var(--text)' }}>Альбоми</h1>

            {isError && (
                <div className="rounded-xl p-4 mb-6 text-xs font-semibold bg-red-500/10 border border-red-500/20 text-red-400">
                    ⚠ Помилка завантаження альбомів. Перевірте з'єднання з базою.
                </div>
            )}

            {albums && albums.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {albums.map((album) => (
                        <Link
                            key={album.id}
                            to={`/albums/${album.id}`}
                            className="flex flex-col gap-3 p-4 rounded-xl transition-all bg-white/[0.01] hover:bg-white/[0.04] border border-white/5 group cursor-pointer"
                        >
                            <div
                                className="w-full aspect-square rounded-lg flex items-center justify-center relative overflow-hidden shadow-md transition-transform group-hover:scale-[1.02]"
                                style={{ background: 'var(--bg-hover)' }}
                            >
                                <Disc size={48} className="opacity-40 transition-transform duration-500 group-hover:rotate-180" style={{ color: 'var(--text-2)' }} />
                            </div>

                            <div className="min-w-0 px-0.5">
                                <p className="font-bold text-sm truncate transition-colors group-hover:text-[var(--accent)]" style={{ color: 'var(--text)' }}>
                                    {album.title}
                                </p>
                                <p className="text-xs opacity-60 font-medium mt-0.5" style={{ color: 'var(--text-3)' }}>
                                    Рік випуску: {album.releaseYear}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : !isError && (
                <p className="text-sm" style={{ color: 'var(--text-3)' }}>Альбоми відсутні</p>
            )}
        </div>
    )
}