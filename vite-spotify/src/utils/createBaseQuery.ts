import { fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from '../store'
import env from '../env'

export const createBaseQuery = fetchBaseQuery({
    baseUrl: env.BASE_URL,
    prepareHeaders: (headers, { getState }) => {
        const token = (getState() as RootState).auth.token
        if (token) {
            headers.set('Authorization', `Bearer ${token}`)
        }
        return headers
    },
})