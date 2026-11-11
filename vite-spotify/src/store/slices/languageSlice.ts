import { createSlice } from '@reduxjs/toolkit'
import type { RootState } from '../index'

export type Language = 'uk' | 'en'

const saved = localStorage.getItem('lang') as Language | null
const initial: Language = saved === 'en' ? 'en' : 'uk'

interface LanguageState {
    lang: Language
}

const languageSlice = createSlice({
    name: 'language',
    initialState: { lang: initial } as LanguageState,
    reducers: {
        toggleLanguage: (state) => {
            state.lang = state.lang === 'uk' ? 'en' : 'uk'
            localStorage.setItem('lang', state.lang)
        },
    },
})

export const { toggleLanguage } = languageSlice.actions
export default languageSlice.reducer
export const selectLanguage = (state: RootState) => state.language.lang
