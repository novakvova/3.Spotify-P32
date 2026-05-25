import { createApi } from '@reduxjs/toolkit/query/react'
import { createBaseQuery } from '../../utils/createBaseQuery'
import type { IAlbum } from '../../types/IAlbum'

export const albumsApi = createApi({
    reducerPath: 'albumsApi',
    baseQuery: createBaseQuery,
    endpoints: (builder) => ({
        getAlbums: builder.query<IAlbum[], void>({
            query: () => '/api/albums',
        }),
        getAlbumById: builder.query<IAlbum, number>({
            query: (id) => `/api/albums/${id}`,
        }),
    }),
})

export const { useGetAlbumsQuery, useGetAlbumByIdQuery } = albumsApi