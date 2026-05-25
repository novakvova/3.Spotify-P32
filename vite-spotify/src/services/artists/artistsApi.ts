import { createApi } from '@reduxjs/toolkit/query/react'
import { createBaseQuery } from '../../utils/createBaseQuery'
import type { IArtist } from '../../types/IArtist'

export const artistsApi = createApi({
    reducerPath: 'artistsApi',
    baseQuery: createBaseQuery,
    endpoints: (builder) => ({
        getArtists: builder.query<IArtist[], void>({
            query: () => '/api/artists',
        }),
        getArtistById: builder.query<IArtist, number>({
            query: (id) => `/api/artists/${id}`,
        }),
    }),
})

export const { useGetArtistsQuery, useGetArtistByIdQuery } = artistsApi