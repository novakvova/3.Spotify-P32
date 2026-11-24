import { createApi } from '@reduxjs/toolkit/query/react'
import { createBaseQuery } from '../../utils/createBaseQuery'
import type { IArtist } from '../../types/IArtist'

export const artistsApi = createApi({
    reducerPath: 'artistsApi',
    baseQuery: createBaseQuery,
    tagTypes: ['Artist'],
    endpoints: (builder) => ({
        getArtists: builder.query<IArtist[], void>({
            query: () => '/api/artists',
            providesTags: ['Artist'],
        }),
        getArtistById: builder.query<IArtist, number>({
            query: (id) => `/api/artists/${id}`,
            providesTags: ['Artist'],
        }),
        searchArtists: builder.query<IArtist[], string>({
            query: (name) => `/api/artists/search?name=${encodeURIComponent(name)}`,
            providesTags: ['Artist'],
        }),
        createArtist: builder.mutation<IArtist, { name: string; birthDate: string }>({
            query: (body) => ({
                url: '/api/artists',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Artist'],
        }),
        updateArtist: builder.mutation<IArtist, { id: number; name: string; birthDate: string }>({
            query: ({ id, ...body }) => ({
                url: `/api/artists/${id}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: ['Artist'],
        }),
        deleteArtist: builder.mutation<void, number>({
            query: (id) => ({
                url: `/api/artists/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Artist'],
        }),
    }),
})

export const {
    useGetArtistsQuery,
    useGetArtistByIdQuery,
    useSearchArtistsQuery,
    useCreateArtistMutation,
    useUpdateArtistMutation,
    useDeleteArtistMutation,
} = artistsApi
