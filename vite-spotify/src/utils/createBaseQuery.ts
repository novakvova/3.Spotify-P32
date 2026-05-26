import { fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import env from '../env'

export const createBaseQuery = fetchBaseQuery({
    baseUrl: env.BASE_URL,
    prepareHeaders: (headers) => {
        const token = localStorage.getItem('token')
        if (token) {
            headers.set('Authorization', `Bearer ${token}`)
        }
        return headers
    },
})