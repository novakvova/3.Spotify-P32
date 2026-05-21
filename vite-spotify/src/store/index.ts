import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import playerReducer from './slices/playerSlice'
import themeReducer from './slices/themeSlice'
import { authApi } from '../services/auth/authApi'
import { songsApi } from '../services/songs/songsApi'
import { genresApi } from '../services/genres/genresApi'

export const store = configureStore({
    reducer: {
        auth: authReducer,
        player: playerReducer,
        theme: themeReducer,
        [authApi.reducerPath]: authApi.reducer,
        [songsApi.reducerPath]: songsApi.reducer,
        [genresApi.reducerPath]: genresApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            authApi.middleware,
            songsApi.middleware,
            genresApi.middleware,
        ),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch