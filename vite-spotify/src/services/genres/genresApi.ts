import { createApi } from '@reduxjs/toolkit/query/react'

import {createBaseQuery} from "../../utils/createBaseQuery.ts";
import type {IGenre} from "../../types/IGenre.ts";

export const genresApi = createApi({
    reducerPath: 'genresApi',
    baseQuery: createBaseQuery,
    tagTypes: ['Genre'],
    endpoints: (builder) => ({

        getGenres: builder.query<IGenre[], void>({
            query: () => '/api/genres',
            providesTags: ['Genre'],
        }),

        createGenre: builder.mutation<IGenre, { name: string; description?: string }>({
            query: (body) => ({ url: '/api/genres', method: 'POST', body }),
            invalidatesTags: ['Genre'],
        }),

        updateGenre: builder.mutation<IGenre, { id: number; name: string; description?: string }>({
            query: ({ id, ...body }) => ({ url: `/api/genres/${id}`, method: 'PUT', body }),
            invalidatesTags: ['Genre'],
        }),

        deleteGenre: builder.mutation<void, number>({
            query: (id) => ({ url: `/api/genres/${id}`, method: 'DELETE' }),
            invalidatesTags: ['Genre'],
        }),
    }),
})

export const {
    useGetGenresQuery,
    useCreateGenreMutation,
    useUpdateGenreMutation,
    useDeleteGenreMutation,
} = genresApi