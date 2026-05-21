import { createSlice } from '@reduxjs/toolkit'
import type { RootState } from '../index'

type Theme = 'dark' | 'light'

const saved = localStorage.getItem('theme') as Theme | null
const initial: Theme = saved ?? 'dark'

document.documentElement.classList.toggle('dark', initial === 'dark')

interface ThemeState { theme: Theme }

const themeSlice = createSlice({
    name: 'theme',
    initialState: { theme: initial } as ThemeState,
    reducers: {
        toggleTheme: (state) => {
            state.theme = state.theme === 'dark' ? 'light' : 'dark'
            localStorage.setItem('theme', state.theme)
            document.documentElement.classList.toggle('dark', state.theme === 'dark')
        },
    },
})

export const { toggleTheme } = themeSlice.actions
export default themeSlice.reducer
export const selectTheme = (state: RootState) => state.theme.theme