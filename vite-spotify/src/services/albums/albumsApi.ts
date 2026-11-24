import { createApi } from '@reduxjs/toolkit/query/react'
import { createBaseQuery } from '../../utils/createBaseQuery'
import type { IAlbum } from '../../types/IAlbum'

export const albumsApi = createApi({
    reducerPath: 'albumsApi',
    baseQuery: createBaseQuery,
    tagTypes: ['Album'],
    endpoints: (builder) => ({
        getAlbums: builder.query<IAlbum[], void>({
            query: () => '/api/albums',
            providesTags: ['Album'],
        }),
        getAlbumById: builder.query<IAlbum, number>({
            query: (id) => `/api/albums/${id}`,
            providesTags: ['Album'],
        }),
        searchAlbums: builder.query<IAlbum[], string>({
            query: (title) => `/api/albums/search?title=${encodeURIComponent(title)}`,
            providesTags: ['Album'],
        }),
        createAlbum: builder.mutation<
            IAlbum,
            { title: string; releaseYear: number; artistId: number }
        >({
            query: (body) => ({
                url: '/api/albums',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Album'],
        }),
        updateAlbum: builder.mutation<
            IAlbum,
            { id: number; title: string; releaseYear: number; artistId: number }
        >({
            query: ({ id, ...body }) => ({
                url: `/api/albums/${id}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: ['Album'],
        }),
        deleteAlbum: builder.mutation<void, number>({
            query: (id) => ({
                url: `/api/albums/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Album'],
        }),
    }),
})

export const {
    useGetAlbumsQuery,
    useGetAlbumByIdQuery,
    useSearchAlbumsQuery,
    useCreateAlbumMutation,
    useUpdateAlbumMutation,
    useDeleteAlbumMutation,
} = albumsApi
