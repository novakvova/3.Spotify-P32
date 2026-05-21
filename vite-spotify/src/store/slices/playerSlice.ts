import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../store'
import type {ISong} from "../../types/ISong.ts";

type RepeatMode = 'off' | 'one' | 'all'

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
}

const playerSlice = createSlice({
    name: 'player',
    initialState,
    reducers: {
        playSong: (state, action: PayloadAction<{ song: ISong; queue?: ISong[] }>) => {
            const { song, queue } = action.payload
            const q = queue ?? [song]
            state.currentSong = song
            state.queue = q
            state.currentIndex = q.findIndex((s) => s.id === song.id)
            state.isPlaying = true
            state.progress = 0
        },
        togglePlay: (state) => { state.isPlaying = !state.isPlaying },
        setPlaying: (state, action: PayloadAction<boolean>) => { state.isPlaying = action.payload },
        nextSong: (state) => {
            if (!state.queue.length) return
            let next: number
            if (state.shuffle) {
                next = Math.floor(Math.random() * state.queue.length)
            } else if (state.repeat === 'all') {
                next = (state.currentIndex + 1) % state.queue.length
            } else {
                next = state.currentIndex + 1
                if (next >= state.queue.length) { state.isPlaying = false; return }
            }
            state.currentSong = state.queue[next]
            state.currentIndex = next
            state.isPlaying = true
            state.progress = 0
        },
        prevSong: (state) => {
            if (!state.queue.length) return
            if (state.progress > 3) { state.progress = 0; return }
            const prev = Math.max(state.currentIndex - 1, 0)
            state.currentSong = state.queue[prev]
            state.currentIndex = prev
            state.isPlaying = true
            state.progress = 0
        },
        setVolume: (state, action: PayloadAction<number>) => { state.volume = action.payload },
        setProgress: (state, action: PayloadAction<number>) => { state.progress = action.payload },
        setDuration: (state, action: PayloadAction<number>) => { state.duration = action.payload },
        toggleShuffle: (state) => { state.shuffle = !state.shuffle },
        toggleRepeat: (state) => {
            const cycle: RepeatMode[] = ['off', 'all', 'one']
            state.repeat = cycle[(cycle.indexOf(state.repeat) + 1) % cycle.length]
        },
    },
})

export const {
    playSong, togglePlay, setPlaying,
    nextSong, prevSong,
    setVolume, setProgress, setDuration,
    toggleShuffle, toggleRepeat,
} = playerSlice.actions
export default playerSlice.reducer

export const selectPlayerState = (state: RootState) => state.player
export const selectCurrentSong = (state: RootState) => state.player.currentSong
export const selectIsPlaying = (state: RootState) => state.player.isPlaying