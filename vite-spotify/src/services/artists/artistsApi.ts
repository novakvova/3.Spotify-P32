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
        searchArtists: builder.query<IArtist[], string>({
            query: (name) => `/api/artists/search?name=${encodeURIComponent(name)}`,
        }),
    }),
})

export const { useGetArtistsQuery, useGetArtistByIdQuery, useSearchArtistsQuery } = artistsApi