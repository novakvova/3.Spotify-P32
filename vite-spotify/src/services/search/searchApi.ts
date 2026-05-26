import { createApi } from '@reduxjs/toolkit/query/react'
import { createBaseQuery } from '../../utils/createBaseQuery'
import type { IArtist } from '../../types/IArtist'
import type { IAlbum } from '../../types/IAlbum'
import type { ISong } from '../../types/ISong'

export interface IGlobalSearchResult {
    artists: IArtist[]
    albums: IAlbum[]
    songs: ISong[]
}

export const searchApi = createApi({
    reducerPath: 'searchApi',
    baseQuery: createBaseQuery,
    endpoints: (builder) => ({
        globalSearch: builder.query<IGlobalSearchResult, string>({
            query: (query) => `/api/search/search?query=${encodeURIComponent(query)}`,
        }),
    }),
})

export const { useGlobalSearchQuery } = searchApi