import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../store'
import type {IUser} from "../../types/IUser.ts";

interface AuthState {
    token: string | null
    user: IUser | null
    isAuthenticated: boolean
}

const token = localStorage.getItem('token')
const userStr = localStorage.getItem('user')

const initialState: AuthState = {
    token,
    user: userStr ? (JSON.parse(userStr) as IUser) : null,
    isAuthenticated: !!token,
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
        },
    },
})

export const { setCredentials, logout } = authSlice.actions
export default authSlice.reducer

export const selectToken = (state: RootState) => state.auth.token
export const selectCurrentUser = (state: RootState) => state.auth.user
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated