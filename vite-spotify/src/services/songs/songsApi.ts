import { createApi } from '@reduxjs/toolkit/query/react'
import {createBaseQuery} from "../../utils/createBaseQuery.ts";
import type {ISong} from "../../types/ISong.ts";
import type {IPageResponse} from "../../types/IPageResponse.ts";

export const songsApi = createApi({
    reducerPath: 'songsApi',
    baseQuery: createBaseQuery,
    endpoints: (builder) => ({

        getSongs: builder.query<
            IPageResponse<ISong>,
            { page?: number; size?: number; genre?: number; search?: string }
        >({
            query: ({ page = 0, size = 20, genre, search } = {}) => {
                const p = new URLSearchParams({ page: String(page), size: String(size) })
                if (genre) p.set('genre', String(genre))
                if (search) p.set('search', search)
                return `/api/songs?${p}`
            },
        }),
        incrementPlay: builder.mutation<void, number>({
            query: (id) => ({ url: `/api/songs/${id}/play`, method: 'POST' }),
        }),
    }),
})

export const { useGetSongsQuery, useIncrementPlayMutation } = songsApi