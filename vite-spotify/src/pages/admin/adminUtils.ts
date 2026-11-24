import type { ISong } from '../../types/ISong'

export function extractApiErrorMessage(err: unknown, fallback: string): string {
    if (!err || typeof err !== 'object') return fallback
    const errorObj = err as {
        data?: unknown
        error?: string
        message?: string
    }
    if (typeof errorObj.data === 'string' && errorObj.data.trim().length > 0) {
        return errorObj.data
    }
    if (errorObj.data && typeof errorObj.data === 'object') {
        const dataObj = errorObj.data as { message?: string; error?: string }
        if (dataObj.message) return dataObj.message
        if (dataObj.error) return dataObj.error
    }
    if (errorObj.error) return errorObj.error
    if (errorObj.message) return errorObj.message
    return fallback
}

export function getDeterministicDemoPlays(song: ISong): number {
    const seedSource = `${song.id}:${song.name}:${song.artist_name ?? ''}`
    let hash = 2166136261
    for (let i = 0; i < seedSource.length; i++) {
        hash ^= seedSource.charCodeAt(i)
        hash = Math.imul(hash, 16777619)
    }
    const unsigned = hash >>> 0
    const tier = unsigned % 10
    if (tier >= 8) {
        return 12500 + (unsigned % 19400)
    }
    if (tier >= 5) {
        return 4200 + (unsigned % 8100)
    }
    return 650 + (unsigned % 3400)
}

export function getEffectiveSongPlays(
    song: ISong,
    livePlayCounts: Record<number, number>,
    includeDemo = true
): number {
    const localPlays = livePlayCounts[song.id] ?? 0
    if (typeof song.playCount === 'number' && song.playCount > 0) {
        return song.playCount + localPlays
    }
    const basePlays = includeDemo ? getDeterministicDemoPlays(song) : 0
    return basePlays + localPlays
}

export function formatNumber(value: number): string {
    return Math.round(value)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}
