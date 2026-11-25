import { createApi } from '@reduxjs/toolkit/query/react'
import { createBaseQuery } from '../../utils/createBaseQuery'
import type { ISong } from '../../types/ISong'
import type { IPageResponse } from '../../types/IPageResponse'
import type { ITrackPlayResponse } from '../../types/IAnalytics'

export interface IUpdateSongPayload {
    id: number
    formData: FormData
}

export const songsApi = createApi({
    reducerPath: 'songsApi',
    baseQuery: createBaseQuery,
    tagTypes: ['Song'],
    endpoints: (builder) => ({
        getAllSongs: builder.query<ISong[], void>({
            query: () => '/api/songs',
            providesTags: ['Song'],
        }),
        getSongs: builder.query<
            IPageResponse<ISong>,
            { page?: number; size?: number; genre?: number; search?: string }
        >({
            query: ({ page = 0, size = 20, genre, search } = {}) => {
                const p = new URLSearchParams({ page: String(page), size: String(size) })
                if (genre) p.set('genre', String(genre))
                if (search) p.set('name', search)
                return `/api/songs/page?${p}`
            },
            providesTags: ['Song'],
        }),
        getSongsByAlbum: builder.query<ISong[], number>({
            query: (albumId) => `/api/songs/by-album/${albumId}`,
            providesTags: ['Song'],
        }),
        getSongsByArtist: builder.query<ISong[], number>({
            query: (artistId) => `/api/songs/by-artist/${artistId}`,
            providesTags: ['Song'],
        }),
        searchSongs: builder.query<ISong[], string>({
            query: (name) => `/api/songs/search?name=${encodeURIComponent(name)}`,
            providesTags: ['Song'],
        }),
        createSong: builder.mutation<ISong, FormData>({
            query: (formData) => ({
                url: '/api/songs',
                method: 'POST',
                body: formData,
            }),
            invalidatesTags: ['Song'],
        }),
        updateSong: builder.mutation<ISong, IUpdateSongPayload>({
            query: ({ id, formData }) => ({
                url: `/api/songs/${id}`,
                method: 'PUT',
                body: formData,
            }),
            invalidatesTags: ['Song'],
        }),
        deleteSong: builder.mutation<void, number>({
            query: (id) => ({
                url: `/api/songs/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Song'],
        }),
        incrementPlay: builder.mutation<
            ITrackPlayResponse,
            { id: number; listenedSeconds: number; durationSeconds?: number }
        >({
            query: ({ id, listenedSeconds, durationSeconds }) => ({
                url: `/api/songs/${id}/play`,
                method: 'POST',
                body: { listenedSeconds, durationSeconds },
            }),
        }),
    }),
})

export const {
    useGetAllSongsQuery,
    useGetSongsQuery,
    useGetSongsByAlbumQuery,
    useGetSongsByArtistQuery,
    useCreateSongMutation,
    useUpdateSongMutation,
    useDeleteSongMutation,
    useIncrementPlayMutation,
    useSearchSongsQuery,
} = songsApi
