import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../store'
import type { IUser } from '../../types/IUser.ts'
import { authApi } from '../../services/auth/authApi.ts'

interface AuthState {
    token: string | null
    user: IUser | null
    isAuthenticated: boolean
}

export function isJwtTokenValid(token: string | null): boolean {
    if (!token) return false
    try {
        const parts = token.split('.')
        if (parts.length !== 3) return false
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
        const payload = JSON.parse(atob(base64)) as { exp?: number }
        if (typeof payload.exp !== 'number') return false
        return payload.exp * 1000 > Date.now()
    } catch {
        return false
    }
}

const storedToken = localStorage.getItem('token')
const validToken = isJwtTokenValid(storedToken) ? storedToken : null

if (!validToken && storedToken) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
}

const userStr = validToken ? localStorage.getItem('user') : null

const initialState: AuthState = {
    token: validToken,
    user: userStr ? (JSON.parse(userStr) as IUser) : null,
    isAuthenticated: !!validToken,
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action: PayloadAction<{ token: string; user: IUser }>) => {
            state.token = action.payload.token
            state.user = action.payload.user
            state.isAuthenticated = true
            localStorage.setItem('token', action.payload.token)
            localStorage.setItem('user', JSON.stringify(action.payload.user))
        },
        logout: (state) => {
            state.token = null
            state.user = null
            state.isAuthenticated = false
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            authApi.util.resetApiState()
        },
    },
})

export const { setCredentials, logout } = authSlice.actions
export default authSlice.reducer

export const selectToken = (state: RootState) => state.auth.token
export const selectCurrentUser = (state: RootState) => state.auth.user
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated
export const selectIsAdmin = (state: RootState) =>
    state.auth.isAuthenticated &&
    Boolean(state.auth.user?.roles?.some((r) => r.toLowerCase().includes('admin')))
