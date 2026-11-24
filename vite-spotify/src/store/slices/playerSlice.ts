import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../store'
import type { ISong } from '../../types/ISong.ts'
import { isJwtTokenValid } from './authSlice'

type RepeatMode = 'off' | 'one' | 'all'

const PLAY_COUNTS_STORAGE_KEY = 'sonora_song_plays'

function loadStoredPlayCounts(): Record<number, number> {
    try {
        const raw = localStorage.getItem(PLAY_COUNTS_STORAGE_KEY)
        if (!raw) return {}
        const parsed = JSON.parse(raw) as Record<string, unknown>
        const result: Record<number, number> = {}
        for (const [key, value] of Object.entries(parsed)) {
            const id = Number(key)
            if (Number.isFinite(id) && typeof value === 'number' && value > 0) {
                result[id] = Math.floor(value)
            }
        }
        return result
    } catch {
        return {}
    }
}

function saveStoredPlayCounts(counts: Record<number, number>): void {
    try {
        localStorage.setItem(PLAY_COUNTS_STORAGE_KEY, JSON.stringify(counts))
    } catch {
        return
    }
}

interface PlayerState {
    currentSong: ISong | null
    queue: ISong[]
    currentIndex: number
    isPlaying: boolean
    volume: number
    progress: number
    duration: number
    shuffle: boolean
    repeat: RepeatMode
    showAuthModal: boolean
    playCounts: Record<number, number>
}

const initialState: PlayerState = {
    currentSong: null,
    queue: [],
    currentIndex: -1,
    isPlaying: false,
    volume: 0.8,
    progress: 0,
    duration: 0,
    shuffle: false,
    repeat: 'off',
    showAuthModal: false,
    playCounts: loadStoredPlayCounts(),
}

const playerSlice = createSlice({
    name: 'player',
    initialState,
    reducers: {
        playSong: (state, action: PayloadAction<{ song: ISong; queue?: ISong[] }>) => {
            if (!isJwtTokenValid(localStorage.getItem('token'))) {
                state.showAuthModal = true
                state.isPlaying = false
                return
            }
            const { song, queue } = action.payload
            const q = queue && queue.length > 0 ? queue : [song]
            state.currentSong = song
            state.queue = q
            state.currentIndex = q.findIndex((s) => s.id === song.id)
            state.isPlaying = true
            state.progress = 0
            state.playCounts[song.id] = (state.playCounts[song.id] ?? 0) + 1
            saveStoredPlayCounts(state.playCounts)
        },
        togglePlay: (state) => {
            if (!isJwtTokenValid(localStorage.getItem('token'))) {
                state.showAuthModal = true
                state.isPlaying = false
                return
            }
            if (!state.currentSong) {
                state.isPlaying = false
                return
            }
            state.isPlaying = !state.isPlaying
        },
        setPlaying: (state, action: PayloadAction<boolean>) => {
            state.isPlaying = state.currentSong ? action.payload : false
        },
        setShowAuthModal: (state, action: PayloadAction<boolean>) => {
            state.showAuthModal = action.payload
        },
        nextSong: (state) => {
            if (!isJwtTokenValid(localStorage.getItem('token'))) {
                state.showAuthModal = true
                return
            }
            if (!state.queue.length) return
            let next: number
            if (state.shuffle) {
                next = Math.floor(Math.random() * state.queue.length)
            } else if (state.repeat === 'all') {
                next = (state.currentIndex + 1) % state.queue.length
            } else {
                next = state.currentIndex + 1
                if (next >= state.queue.length) {
                    state.isPlaying = false
                    return
                }
            }
            const nextTrack = state.queue[next]
            state.currentSong = nextTrack
            state.currentIndex = next
            state.isPlaying = true
            state.progress = 0
            if (nextTrack) {
                state.playCounts[nextTrack.id] = (state.playCounts[nextTrack.id] ?? 0) + 1
                saveStoredPlayCounts(state.playCounts)
            }
        },
        prevSong: (state) => {
            if (!isJwtTokenValid(localStorage.getItem('token'))) {
                state.showAuthModal = true
                return
            }
            if (!state.queue.length) return
            if (state.progress > 3) {
                state.progress = 0
                return
            }
            const prev = Math.max(state.currentIndex - 1, 0)
            const prevTrack = state.queue[prev]
            state.currentSong = prevTrack
            state.currentIndex = prev
            state.isPlaying = true
            state.progress = 0
            if (prevTrack) {
                state.playCounts[prevTrack.id] = (state.playCounts[prevTrack.id] ?? 0) + 1
                saveStoredPlayCounts(state.playCounts)
            }
        },
        setVolume: (state, action: PayloadAction<number>) => {
            state.volume = action.payload
        },
        setProgress: (state, action: PayloadAction<number>) => {
            state.progress = action.payload
        },
        setDuration: (state, action: PayloadAction<number>) => {
            state.duration = action.payload
        },
        toggleShuffle: (state) => {
            state.shuffle = !state.shuffle
        },
        toggleRepeat: (state) => {
            const cycle: RepeatMode[] = ['off', 'all', 'one']
            state.repeat = cycle[(cycle.indexOf(state.repeat) + 1) % cycle.length]
        },
    },
})

export const {
    playSong,
    togglePlay,
    setPlaying,
    setShowAuthModal,
    nextSong,
    prevSong,
    setVolume,
    setProgress,
    setDuration,
    toggleShuffle,
    toggleRepeat,
} = playerSlice.actions
export default playerSlice.reducer

export const selectPlayerState = (state: RootState) => state.player
export const selectCurrentSong = (state: RootState) => state.player.currentSong
export const selectIsPlaying = (state: RootState) => state.player.isPlaying
export const selectShowAuthModal = (state: RootState) => state.player.showAuthModal
export const selectSongPlayCounts = (state: RootState) => state.player.playCounts
