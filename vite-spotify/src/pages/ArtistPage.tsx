import { useGetArtistsQuery } from '../services/artists/artistsApi'

export default function ArtistsPage() {
    const { data: artists, isLoading, isError } = useGetArtistsQuery()

    if (isLoading) return (
        <div className="flex items-center justify-center h-48">
            <p style={{ color: 'var(--text-3)' }}>Завантаження...</p>
        </div>
    )

    return (
        <div className="max-w-4xl">
            <h1 className="text-3xl font-extrabold mb-6" style={{ color: 'var(--text)' }}>Виконавці</h1>

            {isError && (
                <div
                    className="rounded-xl p-4 mb-6 text-sm"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-2)' }}
                >
                    ⚠ Помилка завантаження виконавців
                </div>
            )}

            {artists && artists.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {artists.map((artist) => (
                        <div
                            key={artist.id}
                            className="flex flex-col items-center gap-3 p-5 rounded-xl transition-all hover:scale-105 cursor-pointer"
                            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                        >
                            <div
                                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
                                style={{ background: 'var(--accent)', color: '#000' }}
                            >
                                {artist.name[0].toUpperCase()}
                            </div>
                            <div className="text-center min-w-0 w-full">
                                <p className="font-bold text-sm truncate" style={{ color: 'var(--text)' }}>
                                    {artist.name}
                                </p>
                                <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>
                                    {artist.birthDate
                                        ? new Date(artist.birthDate).getFullYear()
                                        : '—'}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : !isError && (
                <p style={{ color: 'var(--text-3)' }}>Виконавці відсутні</p>
            )}
        </div>
    )
}