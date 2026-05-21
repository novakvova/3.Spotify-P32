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