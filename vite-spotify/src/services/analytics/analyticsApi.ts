import { createApi } from '@reduxjs/toolkit/query/react'
import { createBaseQuery } from '../../utils/createBaseQuery'
import type {
    IAlbumTrackStat,
    IArtistCatalogStat,
    IGenreTrackStat,
    IPlatformAnalytics,
    ISongPlayStat,
} from '../../types/IAnalytics'

export const analyticsApi = createApi({
    reducerPath: 'analyticsApi',
    baseQuery: createBaseQuery,
    tagTypes: ['Analytics'],
    endpoints: (builder) => ({
        getPlatformOverview: builder.query<
            IPlatformAnalytics,
            { topLimit?: number; recentLimit?: number } | void
        >({
            query: (params) => {
                const topLimit = params && 'topLimit' in params ? (params.topLimit ?? 10) : 10
                const recentLimit =
                    params && 'recentLimit' in params ? (params.recentLimit ?? 6) : 6
                return `/api/analytics/overview?topLimit=${topLimit}&recentLimit=${recentLimit}`
            },
            providesTags: ['Analytics'],
        }),
        getSongsPlays: builder.query<ISongPlayStat[], void>({
            query: () => '/api/analytics/songs/plays',
            providesTags: ['Analytics'],
        }),
        getAlbumsTracksCount: builder.query<IAlbumTrackStat[], void>({
            query: () => '/api/analytics/albums/tracks-count',
            providesTags: ['Analytics'],
        }),
        getArtistsBreakdown: builder.query<IArtistCatalogStat[], void>({
            query: () => '/api/analytics/artists/breakdown',
            providesTags: ['Analytics'],
        }),
        getGenresTracksCount: builder.query<IGenreTrackStat[], void>({
            query: () => '/api/analytics/genres/tracks-count',
            providesTags: ['Analytics'],
        }),
    }),
})

export const {
    useGetPlatformOverviewQuery,
    useGetSongsPlaysQuery,
    useGetAlbumsTracksCountQuery,
    useGetArtistsBreakdownQuery,
    useGetGenresTracksCountQuery,
} = analyticsApi
