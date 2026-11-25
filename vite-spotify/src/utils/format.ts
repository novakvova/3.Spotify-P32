import type { ISong } from '../types/ISong'
import type { IAlbum } from '../types/IAlbum'

export function formatTime(seconds: number): string {
    if (!seconds || isNaN(seconds)) return '0:00'
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
}

export function getSongUrl(fileName: string): string {
    return `/mp3songs/${encodeURIComponent(fileName)}`
}

export function getAvatarUrl(
    image: string | null,
    size: 'small' | 'medium' | 'original' = 'small'
): string {
    if (!image) return '/default-avatar.png'
    return `/uploads/${size}/${image}`
}
export function getInitial(name: string): string {
    return name?.[0]?.toUpperCase() ?? '?'
}

export function getMediaUrl(url?: string | null): string | null {
    if (!url || !url.trim()) return null
    const trimmed = url.trim()
    if (
        trimmed.startsWith('http://') ||
        trimmed.startsWith('https://') ||
        trimmed.startsWith('blob:') ||
        trimmed.startsWith('data:')
    ) {
        return trimmed
    }
    return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
}

export function resolveSongCover(
    song?: ISong | null,
    albums?: IAlbum[]
): string | null {
    if (!song) return null
    if (song.coverUrl) return song.coverUrl
    if (albums && song.album_title) {
        const matchedAlbum = albums.find(
            (a) => a.title.toLowerCase() === song.album_title?.toLowerCase()
        )
        if (matchedAlbum?.coverUrl) return matchedAlbum.coverUrl
    }
    return null
}