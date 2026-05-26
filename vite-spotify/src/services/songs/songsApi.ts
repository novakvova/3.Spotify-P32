import { createApi } from '@reduxjs/toolkit/query/react'
import { createBaseQuery } from '../../utils/createBaseQuery'
import type { ISong } from '../../types/ISong'
import type { IPageResponse } from '../../types/IPageResponse'

export const songsApi = createApi({
    reducerPath: 'songsApi',
    baseQuery: createBaseQuery,
    endpoints: (builder) => ({

        getSongs: builder.query<IPageResponse<ISong>, { page?: number; size?: number; genre?: number; search?: string }>
        ({
            query: ({ page = 0, size = 20, genre, search } = {}) => {
                const p = new URLSearchParams({ page: String(page), size: String(size) })
                if (genre) p.set('genre', String(genre))
                if (search) p.set('name', search)
                return `/api/songs/page?${p}`
            },
        }),
        getSongsByAlbum: builder.query<ISong[], number>({
            query: (albumId) => `/api/songs/by-album/${albumId}`,
        }),

        getSongsByArtist: builder.query<ISong[], number>({
            query: (artistId) => `/api/songs/by-artist/${artistId}`,
        }),
        searchSongs: builder.query<ISong[], string>({
            query: (name) => `/api/songs/search?name=${encodeURIComponent(name)}`,
        }),

        incrementPlay: builder.mutation<void, number>({
            query: (id) => ({ url: `/api/songs/${id}/play`, method: 'POST' }),
        }),

}),
})

export const { useGetSongsQuery, useGetSongsByAlbumQuery,
    useGetSongsByArtistQuery, useIncrementPlayMutation, useSearchSongsQuery } = songsApi
