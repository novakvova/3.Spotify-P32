import { useSearchParams } from 'react-router-dom'
import { useGetSongsQuery } from '../services/songs/songsApi'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { playSong, togglePlay, selectCurrentSong, selectIsPlaying } from '../store/slices/playerSlice'
import type { ISong } from '../types/ISong'
import {useEffect, useState} from "react";

export default function SongsPage() {
    const dispatch = useAppDispatch()
    const currentSong = useAppSelector(selectCurrentSong)
    const isPlaying = useAppSelector(selectIsPlaying)

    const [page, setPage] = useState(0)


    const [searchParams] = useSearchParams()
    const search = searchParams.get('search') ?? undefined
    const genre = searchParams.get('genre') ? Number(searchParams.get('genre')) : undefined

    const { data, isLoading } = useGetSongsQuery({ page: page, size: 20, search, genre })
    const songs: ISong[] = data?.content ?? []

    useEffect(() => {
        setPage(0)
    }, [search, genre])
    const handlePlay = (song: ISong) => {
        if (currentSong?.id === song.id) dispatch(togglePlay())
        else dispatch(playSong({ song, queue: songs }))
    }

    if (isLoading) return (
        <div className="flex items-center justify-center h-48">
            <p style={{ color: 'var(--text-3)' }}>Завантаження...</p>
        </div>
    )

    return (
        <div className="max-w-4xl">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <h1 className="text-3xl font-extrabold" style={{ color: 'var(--text)' }}>
                    {search ? `Результати: "${search}"` : 'Пісні'}
                </h1>
            </div>

            <div
                className="grid gap-4 px-4 pb-2 mb-1 text-xs font-semibold uppercase tracking-wider border-b"
                style={{ gridTemplateColumns: '40px 1fr 160px 140px', color: 'var(--text-3)', borderColor: 'var(--border)' }}
            >
                <span>#</span>
                <span>Назва</span>
                <span>Альбом</span>
                <span>Жанри</span>
            </div>

            <div className="flex flex-col">
                {songs.map((song, i) => {
                    const active = currentSong?.id === song.id
                    return (
                        <div
                            key={song.id}
                            className="grid gap-4 px-4 py-3 rounded-lg items-center group transition-colors cursor-default"
                            style={{
                                gridTemplateColumns: '40px 1fr 160px 140px',
                                background: active ? 'var(--bg-hover)' : 'transparent',
                            }}
                            onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--bg-hover)' }}
                            onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
                            onDoubleClick={() => handlePlay(song)}
                        >
                            <div className="flex justify-center">
                                <button
                                    onClick={() => handlePlay(song)}
                                    className="w-7 h-7 flex items-center justify-center rounded text-sm"
                                    style={{ color: active ? 'var(--accent)' : 'var(--text-2)' }}
                                >
                                    {active && isPlaying ? '⏸' : active ? '▶' : (
                                        <>
                                            <span className="group-hover:hidden text-xs" style={{ color: 'var(--text-3)' }}>{i + 1}</span>
                                            <span className="hidden group-hover:block">▶</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="min-w-0">
                                <p className="text-sm font-medium truncate" style={{ color: active ? 'var(--accent)' : 'var(--text)' }}>
                                    {song.name}
                                </p>
                                <p className="text-xs truncate" style={{ color: 'var(--text-3)' }}>
                                    {song.artist_name ?? '—'}
                                </p>
                            </div>

                            <p className="text-sm truncate" style={{ color: 'var(--text-3)' }}>
                                {song.album_title ?? '—'}
                            </p>

                            <div className="flex gap-1 flex-wrap">
                                {song.genres_names?.slice(0, 2).map((g) => (
                                    <span
                                        key={g}
                                        className="text-xs px-2 py-0.5 rounded-full"
                                        style={{ background: 'var(--bg-input)', color: 'var(--text-2)' }}
                                    >
                    {g}
                  </span>
                                ))}
                            </div>
                        </div>
                    )
                })}
                {data && data.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-4 mt-6">
                        <button
                            disabled={data.first}
                            onClick={() => setPage(p => p - 1)}
                            className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-30 transition-all hover:scale-105"
                            style={{ background: 'var(--bg-card)', color: 'var(--text)', border: '1px solid var(--border)' }}
                        >
                            ← Назад
                        </button>
                        <span className="text-sm" style={{ color: 'var(--text-3)' }}>
                          {data.number + 1} / {data.totalPages}
                        </span>
                        <button
                            disabled={data.last}
                            onClick={() => setPage(p => p + 1)}
                            className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-30 transition-all hover:scale-105"
                            style={{ background: 'var(--bg-card)', color: 'var(--text)', border: '1px solid var(--border)' }}
                        >
                            Вперед →
                        </button>
                    </div>
                )}
            </div>

            {songs.length === 0 && (
                <p className="text-center py-12" style={{ color: 'var(--text-3)' }}>
                    Нічого не знайдено
                </p>
            )}
        </div>
    )
}