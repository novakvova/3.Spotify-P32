import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
    Music,
    Disc,
    Mic2,
    Layers,
    Shield,
    Plus,
    Play,
    Pause,
    Headphones,
    TrendingUp,
    Trophy,
    BarChart3,
    Calendar,
    Flame,
    Users,
    RefreshCw,
    Database,
    Sparkles,
} from 'lucide-react'
import { useGetAllSongsQuery } from '../../services/songs/songsApi'
import { useGetAlbumsQuery } from '../../services/albums/albumsApi'
import { useGetArtistsQuery } from '../../services/artists/artistsApi'
import { useGetGenresQuery } from '../../services/genres/genresApi'
import { useGetRolesQuery } from '../../services/roles/rolesApi'
import { useGetAdminUsersQuery } from '../../services/users/adminUsersApi'
import {
    useGetArtistsBreakdownQuery,
    useGetPlatformOverviewQuery,
} from '../../services/analytics/analyticsApi'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
    playSong,
    togglePlay,
    setAdminStatsMode,
    selectCurrentSong,
    selectIsPlaying,
    selectAdminStatsMode,
} from '../../store/slices/playerSlice'
import type { ISong } from '../../types/ISong'
import type {
    IAnalyticsDecade,
    IAnalyticsGenre,
    IAnalyticsTopAlbum,
    IAnalyticsTopArtist,
    IAnalyticsTopSong,
} from '../../types/IAnalytics'
import MediaImage from '../../components/MediaImage'
import { resolveSongCover } from '../../utils/format'
import { formatNumber, getDeterministicDemoPlays } from './adminUtils'

const FALLBACK_DEMO_SONGS: IAnalyticsTopSong[] = [
    { id: -1, name: 'Shape of You', artistName: 'Ed Sheeran', albumTitle: 'Divide', coverUrl: null, playCount: 29840 },
    { id: -2, name: 'Blinding Lights', artistName: 'The Weeknd', albumTitle: 'After Hours', coverUrl: null, playCount: 26410 },
    { id: -3, name: 'Старі фотографії', artistName: 'Скрябін', albumTitle: 'Танго', coverUrl: null, playCount: 22190 },
    { id: -4, name: 'Perfect', artistName: 'Ed Sheeran', albumTitle: 'Divide', coverUrl: null, playCount: 18750 },
    { id: -5, name: 'Обійми', artistName: 'Океан Ельзи', albumTitle: 'Земля', coverUrl: null, playCount: 16320 },
    { id: -6, name: 'Basket Case', artistName: 'Green Day', albumTitle: 'Dookie', coverUrl: null, playCount: 14110 },
]

export default function AdminDashboardPage() {
    const { t } = useTranslation()
    const dispatch = useAppDispatch()
    const currentSong = useAppSelector(selectCurrentSong)
    const isPlaying = useAppSelector(selectIsPlaying)
    const statsMode = useAppSelector(selectAdminStatsMode)
    const isDemo = statsMode === 'demo'

    const [genreMode, setGenreMode] = useState<'streams' | 'tracks'>('streams')

    const {
        data: overview,
        isLoading: isOverviewLoading,
        isFetching: isOverviewFetching,
        refetch: refetchOverview,
    } = useGetPlatformOverviewQuery(
        { topLimit: 10, recentLimit: 6 },
        { refetchOnMountOrArgChange: true }
    )
    const { data: artistsBreakdown = [] } = useGetArtistsBreakdownQuery(undefined, {
        refetchOnMountOrArgChange: true,
    })
    const { data: songs = [] } = useGetAllSongsQuery()
    const { data: albums = [] } = useGetAlbumsQuery()
    const { data: artists = [] } = useGetArtistsQuery()
    const { data: genres = [] } = useGetGenresQuery()
    const { data: roles = [] } = useGetRolesQuery()
    const { data: users = [] } = useGetAdminUsersQuery()

    const demoSongItems: IAnalyticsTopSong[] =
        songs.length > 0
            ? songs.map((song) => ({
                  id: song.id,
                  name: song.name,
                  artistName: song.artist_name,
                  albumTitle: song.album_title,
                  coverUrl: resolveSongCover(song, albums),
                  playCount: getDeterministicDemoPlays(song),
              }))
            : FALLBACK_DEMO_SONGS

    const demoTotalStreams = demoSongItems.reduce(
        (acc, item) => acc + item.playCount,
        0
    )

    const demoTopSongs = [...demoSongItems]
        .sort((a, b) => b.playCount - a.playCount || b.id - a.id)
        .slice(0, 10)

    const demoLatestSongs = [...demoSongItems]
        .sort((a, b) => b.id - a.id)
        .slice(0, 6)

    const demoTopArtists: IAnalyticsTopArtist[] =
        artists.length > 0
            ? artists
                  .map((artist, idx) => {
                      const matching = demoSongItems.filter(
                          (s) =>
                              s.artistName?.toLowerCase() ===
                              artist.name.toLowerCase()
                      )
                      const plays =
                          matching.length > 0
                              ? matching.reduce((sum, s) => sum + s.playCount, 0)
                              : 5400 + ((artist.id * 2713 + idx * 911) % 14000)
                      return {
                          id: artist.id,
                          name: artist.name,
                          imageUrl: artist.imageUrl ?? null,
                          tracksCount: Math.max(matching.length, 2),
                          playsCount: plays,
                      }
                  })
                  .sort((a, b) => b.playsCount - a.playsCount)
                  .slice(0, 6)
            : [
                  { id: -1, name: 'Ed Sheeran', imageUrl: null, tracksCount: 8, playsCount: 48590 },
                  { id: -2, name: 'The Weeknd', imageUrl: null, tracksCount: 6, playsCount: 39200 },
                  { id: -3, name: 'Скрябін', imageUrl: null, tracksCount: 7, playsCount: 34150 },
                  { id: -4, name: 'Океан Ельзи', imageUrl: null, tracksCount: 5, playsCount: 27840 },
              ]

    const demoTopAlbums: IAnalyticsTopAlbum[] =
        albums.length > 0
            ? albums
                  .map((album, idx) => {
                      const matching = demoSongItems.filter(
                          (s) =>
                              s.albumTitle?.toLowerCase() ===
                              album.title.toLowerCase()
                      )
                      const artistObj = artists.find((ar) => ar.id === album.artistId)
                      const plays =
                          matching.length > 0
                              ? matching.reduce((sum, s) => sum + s.playCount, 0)
                              : 3800 + ((album.id * 1931 + idx * 733) % 11500)
                      return {
                          id: album.id,
                          title: album.title,
                          artistName:
                              artistObj?.name ?? matching[0]?.artistName ?? '—',
                          releaseYear: album.releaseYear,
                          coverUrl: album.coverUrl ?? null,
                          tracksCount: Math.max(matching.length, 1),
                          playsCount: plays,
                      }
                  })
                  .sort((a, b) => b.playsCount - a.playsCount)
                  .slice(0, 6)
            : [
                  { id: -1, title: 'Divide', artistName: 'Ed Sheeran', releaseYear: 2017, coverUrl: null, tracksCount: 5, playsCount: 48590 },
                  { id: -2, title: 'After Hours', artistName: 'The Weeknd', releaseYear: 2020, coverUrl: null, tracksCount: 4, playsCount: 31400 },
                  { id: -3, title: 'Танго', artistName: 'Скрябін', releaseYear: 2005, coverUrl: null, tracksCount: 4, playsCount: 25900 },
              ]

    const demoGenres: IAnalyticsGenre[] =
        genres.length > 0
            ? genres.map((genre, idx) => {
                  const matchingSongs = songs.filter((s) =>
                      s.genres_names?.some(
                          (gn) => gn.toLowerCase() === genre.name.toLowerCase()
                      )
                  )
                  const matchingPlays = matchingSongs.reduce(
                      (sum, s) => sum + getDeterministicDemoPlays(s),
                      0
                  )
                  return {
                      genreId: genre.id,
                      genreName: genre.name,
                      tracksCount:
                          matchingSongs.length > 0
                              ? matchingSongs.length
                              : 3 + ((genre.id + idx) % 6),
                      playsCount:
                          matchingPlays > 0
                              ? matchingPlays
                              : 6200 + ((genre.id * 3191 + idx * 829) % 18000),
                  }
              })
            : [
                  { genreId: -1, genreName: 'Pop', playsCount: 54200, tracksCount: 12 },
                  { genreId: -2, genreName: 'Rock', playsCount: 38900, tracksCount: 9 },
                  { genreId: -3, genreName: 'Indie', playsCount: 24600, tracksCount: 7 },
                  { genreId: -4, genreName: 'Synthwave', playsCount: 19300, tracksCount: 5 },
              ]

    const demoDecadeMap = new Map<number, IAnalyticsDecade>()
    for (const album of albums) {
        if (!Number.isFinite(album.releaseYear) || album.releaseYear <= 1900) continue
        const decadeStart = Math.floor(album.releaseYear / 10) * 10
        const matching = demoSongItems.filter(
            (s) => s.albumTitle?.toLowerCase() === album.title.toLowerCase()
        )
        const plays =
            matching.length > 0
                ? matching.reduce((sum, s) => sum + s.playCount, 0)
                : 4500 + ((album.id * 1597) % 9000)
        const existing = demoDecadeMap.get(decadeStart) ?? {
            decadeStart,
            label: '',
            albumsCount: 0,
            tracksCount: 0,
            playsCount: 0,
        }
        existing.albumsCount += 1
        existing.tracksCount += Math.max(matching.length, 1)
        existing.playsCount += plays
        demoDecadeMap.set(decadeStart, existing)
    }
    const demoDecades: IAnalyticsDecade[] =
        demoDecadeMap.size > 0
            ? Array.from(demoDecadeMap.values())
            : [
                  { decadeStart: 2020, label: '', albumsCount: 4, tracksCount: 14, playsCount: 52400 },
                  { decadeStart: 2010, label: '', albumsCount: 6, tracksCount: 21, playsCount: 68900 },
                  { decadeStart: 2000, label: '', albumsCount: 3, tracksCount: 11, playsCount: 31200 },
                  { decadeStart: 1990, label: '', albumsCount: 2, tracksCount: 7, playsCount: 18400 },
              ]

    const summary = overview?.summary
    const totalStreams = isDemo ? demoTotalStreams : (summary?.totalPlays ?? 0)
    const totalSongs = isDemo
        ? Math.max(songs.length, demoSongItems.length)
        : (summary?.totalSongs ?? songs.length)
    const totalAlbums = isDemo
        ? Math.max(albums.length, demoTopAlbums.length)
        : (summary?.totalAlbums ?? albums.length)
    const totalArtists = isDemo
        ? Math.max(artists.length, demoTopArtists.length)
        : (summary?.totalArtists ?? artistsBreakdown.length)
    const totalGenres = isDemo
        ? Math.max(genres.length, demoGenres.length)
        : (summary?.totalGenres ?? (overview?.genres.length ?? 0))
    const totalUsers = isDemo ? Math.max(users.length, 48) : users.length

    const avgPlaysPerTrack = isDemo
        ? Math.round(demoTotalStreams / Math.max(1, demoSongItems.length))
        : summary
        ? Math.round(summary.avgPlaysPerTrack)
        : 0
    const avgTracksPerAlbum = isDemo
        ? (totalSongs / Math.max(1, totalAlbums)).toFixed(1)
        : summary
        ? summary.avgTracksPerAlbum.toFixed(1)
        : '0.0'
    const avgTracksPerArtist = isDemo
        ? (totalSongs / Math.max(1, totalArtists)).toFixed(1)
        : summary
        ? summary.avgTracksPerArtist.toFixed(1)
        : '0.0'

    const validYears = albums
        .map((a) => a.releaseYear)
        .filter((y) => Number.isFinite(y) && y > 1900)
    const releaseSpanText =
        validYears.length > 0
            ? `${Math.min(...validYears)} – ${Math.max(...validYears)}`
            : isDemo
            ? '1994 – 2025'
            : '—'

    const topPlayedSongs = isDemo ? demoTopSongs : (overview?.topSongs ?? [])
    const maxTopSongPlays = Math.max(
        1,
        ...topPlayedSongs.map((item) => item.playCount)
    )

    const artistAlbumsMap = new Map<number, number>(
        artistsBreakdown.map((item) => [item.id, item.albumsCount])
    )
    const topArtists = isDemo
        ? demoTopArtists
        : (overview?.topArtists ?? []).slice(0, 6)
    const maxArtistPlays = Math.max(
        1,
        ...topArtists.map((a) => (a.playsCount > 0 ? a.playsCount : a.tracksCount))
    )

    const topAlbums = isDemo
        ? demoTopAlbums
        : (overview?.topAlbums ?? []).slice(0, 6)
    const maxAlbumPlays = Math.max(
        1,
        ...topAlbums.map((al) => (al.playsCount > 0 ? al.playsCount : al.tracksCount))
    )

    const allGenreAnalytics = isDemo ? demoGenres : (overview?.genres ?? [])
    const topGenreByStreams = [...allGenreAnalytics].sort(
        (a, b) => b.playsCount - a.playsCount || b.tracksCount - a.tracksCount
    )[0]

    const genreStats = [...allGenreAnalytics]
        .sort((a, b) =>
            genreMode === 'streams'
                ? b.playsCount - a.playsCount || b.tracksCount - a.tracksCount
                : b.tracksCount - a.tracksCount || b.playsCount - a.playsCount
        )
        .slice(0, 8)

    const maxGenreMetric = Math.max(
        1,
        ...genreStats.map((g) =>
            genreMode === 'streams' ? g.playsCount : g.tracksCount
        )
    )

    const decadeStats = [...(isDemo ? demoDecades : (overview?.decades ?? []))].sort(
        (a, b) => b.decadeStart - a.decadeStart
    )
    const maxDecadePlays = Math.max(
        1,
        ...decadeStats.map((d) =>
            d.playsCount > 0 ? d.playsCount : d.tracksCount
        )
    )

    const recentSongs = isDemo ? demoLatestSongs : (overview?.latestSongs ?? [])
    const showLoadingPlaceholder = !isDemo && isOverviewLoading

    const statCards = [
        {
            label: t('admin.dashboard.totalStreams'),
            value: formatNumber(totalStreams),
            to: '/admin/songs',
            icon: Headphones,
            gradient: 'from-sonora-pink to-sonora-purple',
        },
        {
            label: t('admin.dashboard.totalSongs'),
            value: formatNumber(totalSongs),
            to: '/admin/songs',
            icon: Music,
            gradient: 'from-sonora-purple to-sonora-light',
        },
        {
            label: t('admin.dashboard.totalAlbums'),
            value: formatNumber(totalAlbums),
            to: '/admin/albums',
            icon: Disc,
            gradient: 'from-sonora-warm to-sonora-pink',
        },
        {
            label: t('admin.dashboard.totalArtists'),
            value: formatNumber(totalArtists),
            to: '/admin/artists',
            icon: Mic2,
            gradient: 'from-purple-700 to-pink-500',
        },
        {
            label: t('admin.dashboard.totalGenres'),
            value: formatNumber(totalGenres),
            to: '/admin/genres',
            icon: Layers,
            gradient: 'from-violet-900 to-purple-500',
        },
        {
            label: t('admin.dashboard.totalUsers'),
            value: formatNumber(totalUsers),
            to: '/admin/users',
            icon: Users,
            gradient: 'from-indigo-700 to-sonora-light',
        },
        {
            label: t('admin.dashboard.totalRoles'),
            value: formatNumber(roles.length),
            to: '/admin/roles',
            icon: Shield,
            gradient: 'from-fuchsia-800 to-purple-400',
        },
    ]

    const secondaryMetrics = [
        {
            label: t('admin.dashboard.avgPlaysPerSong'),
            value: showLoadingPlaceholder ? '…' : formatNumber(avgPlaysPerTrack),
            icon: TrendingUp,
        },
        {
            label: t('admin.dashboard.avgSongsPerAlbum'),
            value: showLoadingPlaceholder ? '…' : avgTracksPerAlbum,
            icon: BarChart3,
        },
        {
            label: t('admin.dashboard.avgSongsPerArtist'),
            value: showLoadingPlaceholder ? '…' : avgTracksPerArtist,
            icon: Flame,
        },
        {
            label: t('admin.dashboard.topGenreKpi'),
            value: showLoadingPlaceholder ? '…' : topGenreByStreams?.genreName ?? '—',
            sub:
                releaseSpanText !== '—'
                    ? `${t('admin.dashboard.releaseSpanKpi')}: ${releaseSpanText}`
                    : undefined,
            icon: Calendar,
        },
    ]

    const handlePlayById = (songId: number, queueIds: number[]) => {
        const matched = songs.find((s) => s.id === songId) ?? songs[0]
        if (!matched) return
        if (currentSong?.id === matched.id) {
            dispatch(togglePlay())
            return
        }
        const resolvedQueue: ISong[] = queueIds
            .map((qid) => songs.find((s) => s.id === qid))
            .filter((item): item is ISong => Boolean(item))
        dispatch(
            playSong({
                song: matched,
                queue: resolvedQueue.length > 0 ? resolvedQueue : songs,
            })
        )
    }

    const resolveAnalyticsSongCover = (
        songId: number,
        directCoverUrl: string | null,
        albumTitle: string | null
    ): string | null => {
        if (directCoverUrl) return directCoverUrl
        const fullSong = songs.find((s) => s.id === songId)
        if (fullSong) return resolveSongCover(fullSong, albums)
        if (albumTitle) {
            const matchedAlbum = albums.find(
                (a) => a.title.toLowerCase() === albumTitle.toLowerCase()
            )
            if (matchedAlbum?.coverUrl) return matchedAlbum.coverUrl
        }
        return null
    }

    const getRankBadgeClass = (index: number): string => {
        if (index === 0) {
            return 'bg-linear-to-br from-amber-300 to-amber-500 text-sonora-dark shadow-md'
        }
        if (index === 1) {
            return 'bg-linear-to-br from-slate-200 to-slate-400 text-sonora-dark shadow-sm'
        }
        if (index === 2) {
            return 'bg-linear-to-br from-orange-300 to-amber-700 text-white shadow-sm'
        }
        return 'bg-sonora-warm/50 text-sonora-lavender'
    }

    return (
        <div className="w-full flex flex-col gap-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                        {t('admin.dashboard.title')}
                    </h1>
                    <p className="text-sm text-sonora-muted mt-1">
                        {isDemo
                            ? t('admin.dashboard.modeDemoHint')
                            : t('admin.dashboard.modeRealHint')}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    <div className="inline-flex items-center p-1 rounded-full bg-sonora-dark border border-white/15">
                        <button
                            type="button"
                            onClick={() => dispatch(setAdminStatsMode('real'))}
                            title={t('admin.dashboard.modeRealHint')}
                            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                                !isDemo
                                    ? 'bg-sonora-light text-sonora-dark shadow-xs'
                                    : 'text-sonora-lavender hover:text-white'
                            }`}
                        >
                            <Database size={13} />
                            <span>{t('admin.dashboard.modeReal')}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => dispatch(setAdminStatsMode('demo'))}
                            title={t('admin.dashboard.modeDemoHint')}
                            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                                isDemo
                                    ? 'bg-sonora-pink text-sonora-dark shadow-xs'
                                    : 'text-sonora-lavender hover:text-white'
                            }`}
                        >
                            <Sparkles size={13} />
                            <span>{t('admin.dashboard.modeDemo')}</span>
                        </button>
                    </div>

                    {!isDemo && (
                        <button
                            type="button"
                            onClick={() => void refetchOverview()}
                            disabled={isOverviewFetching}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sonora-dark border border-white/15 hover:border-sonora-light/50 text-xs font-bold text-white transition-colors cursor-pointer shrink-0 disabled:opacity-60"
                        >
                            <RefreshCw
                                size={14}
                                className={`text-sonora-light ${
                                    isOverviewFetching ? 'animate-spin' : ''
                                }`}
                            />
                            <span>{t('admin.dashboard.refreshBtn')}</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-7 gap-3.5 sm:gap-4">
                {statCards.map(({ label, value, to, icon: Icon, gradient }) => (
                    <Link
                        key={label}
                        to={to}
                        className="p-4 sm:p-5 rounded-2xl bg-sonora-dark/70 border border-white/10 hover:border-sonora-light/50 transition-all group flex flex-col justify-between gap-4"
                    >
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-sonora-lavender">
                                {label}
                            </span>
                            <div
                                className={`w-9 h-9 rounded-xl bg-linear-to-br ${gradient} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform shrink-0`}
                            >
                                <Icon size={18} />
                            </div>
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-white truncate">
                            {showLoadingPlaceholder ? '…' : value}
                        </p>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 sm:gap-4">
                {secondaryMetrics.map(({ label, value, sub, icon: Icon }) => (
                    <div
                        key={label}
                        className="px-4 py-3.5 rounded-2xl bg-sonora-dark/50 border border-white/10 flex items-center gap-3.5"
                    >
                        <div className="w-10 h-10 rounded-xl bg-sonora-warm/60 text-sonora-light flex items-center justify-center shrink-0">
                            <Icon size={19} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-sonora-muted truncate">{label}</p>
                            <p className="text-lg font-extrabold text-white truncate">
                                {value}
                            </p>
                            {sub && (
                                <p className="text-xs text-sonora-lavender truncate">
                                    {sub}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-5 rounded-2xl bg-sonora-dark/60 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <span className="text-sm font-bold text-white">
                    {t('admin.dashboard.quickActions')}
                </span>
                <div className="flex flex-wrap gap-2.5">
                    <Link
                        to="/admin/songs?create=1"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-sonora-light text-sonora-dark font-bold text-xs sm:text-sm hover:opacity-90 transition-opacity"
                    >
                        <Plus size={15} />
                        {t('admin.dashboard.addSongBtn')}
                    </Link>
                    <Link
                        to="/admin/albums?create=1"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-sonora-warm text-white font-semibold text-xs sm:text-sm hover:opacity-90 transition-opacity"
                    >
                        <Plus size={15} />
                        {t('admin.dashboard.addAlbumBtn')}
                    </Link>
                    <Link
                        to="/admin/artists?create=1"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-sonora-warm text-white font-semibold text-xs sm:text-sm hover:opacity-90 transition-opacity"
                    >
                        <Plus size={15} />
                        {t('admin.dashboard.addArtistBtn')}
                    </Link>
                    <Link
                        to="/admin/genres?create=1"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-sonora-warm text-white font-semibold text-xs sm:text-sm hover:opacity-90 transition-opacity"
                    >
                        <Plus size={15} />
                        {t('admin.dashboard.addGenreBtn')}
                    </Link>
                    <Link
                        to="/admin/users?create=1"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-sonora-warm text-white font-semibold text-xs sm:text-sm hover:opacity-90 transition-opacity"
                    >
                        <Plus size={15} />
                        {t('admin.dashboard.addUserBtn')}
                    </Link>
                </div>
            </div>

            <section className="p-5 sm:p-6 rounded-2xl bg-sonora-dark/70 border border-white/10 flex flex-col gap-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-amber-400 to-sonora-pink flex items-center justify-center text-sonora-dark shrink-0 shadow-md">
                            <Trophy size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg sm:text-xl font-extrabold text-white">
                                {t('admin.dashboard.topSongsTitle')}
                            </h2>
                            <p className="text-xs text-sonora-muted">
                                {t('admin.dashboard.topSongsSubtitle')}
                            </p>
                        </div>
                    </div>

                    <Link
                        to="/admin/songs"
                        className="text-xs sm:text-sm font-bold text-sonora-light hover:underline self-start sm:self-auto"
                    >
                        {t('admin.dashboard.viewAll')}
                    </Link>
                </div>

                {topPlayedSongs.length > 0 ? (
                    <div className="grid grid-cols-1 2xl:grid-cols-2 gap-3">
                        {topPlayedSongs.map((song, idx) => {
                            const active = currentSong?.id === song.id
                            const sharePercent =
                                totalStreams > 0
                                    ? ((song.playCount / totalStreams) * 100).toFixed(1)
                                    : '0.0'
                            return (
                                <div
                                    key={`${song.id}-${idx}`}
                                    className={`flex items-center gap-3.5 p-3.5 rounded-2xl border transition-colors ${
                                        active
                                            ? 'bg-sonora-warm/50 border-sonora-light/40'
                                            : 'bg-sonora-panel/60 border-white/5 hover:bg-white/5'
                                    }`}
                                >
                                    <span
                                        className={`w-8 h-8 rounded-xl text-xs font-black flex items-center justify-center shrink-0 ${getRankBadgeClass(
                                            idx
                                        )}`}
                                    >
                                        {idx + 1}
                                    </span>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handlePlayById(
                                                song.id,
                                                topPlayedSongs.map((item) => item.id)
                                            )
                                        }
                                        className="relative group/play w-11 h-11 rounded-xl overflow-hidden bg-sonora-warm text-white flex items-center justify-center shrink-0 cursor-pointer"
                                    >
                                        <MediaImage
                                            src={resolveAnalyticsSongCover(
                                                song.id,
                                                song.coverUrl,
                                                song.albumTitle
                                            )}
                                            alt={song.name}
                                            className="w-full h-full flex items-center justify-center"
                                            fallback={<Music size={17} className="text-white/70" />}
                                        />
                                        <span className="absolute inset-0 bg-sonora-dark/60 opacity-0 group-hover/play:opacity-100 transition-opacity flex items-center justify-center">
                                            {active && isPlaying ? (
                                                <Pause size={15} fill="currentColor" />
                                            ) : (
                                                <Play size={15} fill="currentColor" className="ml-0.5" />
                                            )}
                                        </span>
                                    </button>

                                    <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                                        <div className="flex items-baseline justify-between gap-3">
                                            <div className="min-w-0">
                                                <p
                                                    className={`text-sm font-bold truncate ${
                                                        active
                                                            ? 'text-sonora-light'
                                                            : 'text-white'
                                                    }`}
                                                >
                                                    {song.name}
                                                </p>
                                                <p className="text-xs text-sonora-muted truncate">
                                                    {song.artistName ?? '—'} •{' '}
                                                    {song.albumTitle ?? '—'}
                                                </p>
                                            </div>

                                            <div className="text-right shrink-0">
                                                <p className="text-sm font-extrabold text-white">
                                                    {formatNumber(song.playCount)}
                                                </p>
                                                <p className="text-xs text-sonora-lavender">
                                                    {t('admin.dashboard.sharePercent', {
                                                        percent: sharePercent,
                                                    })}
                                                </p>
                                            </div>
                                        </div>

                                        <progress
                                            value={song.playCount}
                                            max={maxTopSongPlays}
                                            className="admin-stat-bar w-full h-2 rounded-full overflow-hidden"
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <p className="text-sm text-sonora-muted py-6 text-center">
                        {t('admin.common.empty')}
                    </p>
                )}
            </section>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <section className="p-5 rounded-2xl bg-sonora-dark/60 border border-white/10 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base sm:text-lg font-bold text-white">
                            {t('admin.dashboard.topArtistsTitle')}
                        </h2>
                        <Link
                            to="/admin/artists"
                            className="text-xs font-bold text-sonora-light hover:underline"
                        >
                            {t('admin.dashboard.viewAll')}
                        </Link>
                    </div>

                    {topArtists.length > 0 ? (
                        <div className="flex flex-col gap-3.5">
                            {topArtists.map((artist, idx) => {
                                const albumsCount =
                                    artistAlbumsMap.get(artist.id) ??
                                    Math.max(
                                        albums.filter((al) => al.artistId === artist.id)
                                            .length,
                                        isDemo ? 1 : 0
                                    )
                                return (
                                    <div
                                        key={`${artist.id}-${idx}`}
                                        className="flex items-center gap-3"
                                    >
                                        <span
                                            className={`w-7 h-7 rounded-lg text-xs font-extrabold flex items-center justify-center shrink-0 ${getRankBadgeClass(
                                                idx
                                            )}`}
                                        >
                                            {idx + 1}
                                        </span>
                                        <MediaImage
                                            src={artist.imageUrl}
                                            alt={artist.name}
                                            className="w-9 h-9 rounded-full overflow-hidden shrink-0 bg-linear-to-br from-sonora-purple to-sonora-pink flex items-center justify-center font-bold text-xs text-white"
                                            fallback={<span>{artist.name[0]?.toUpperCase() ?? '?'}</span>}
                                        />
                                        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                                            <div className="flex items-center justify-between gap-2 text-xs sm:text-sm">
                                                <div className="min-w-0 flex items-center gap-2">
                                                    <span className="font-bold text-white truncate">
                                                        {artist.name}
                                                    </span>
                                                    <span className="text-xs text-sonora-muted shrink-0">
                                                        {t('admin.dashboard.albumsCountShort', {
                                                            count: albumsCount,
                                                        })}{' '}
                                                        •{' '}
                                                        {t('admin.dashboard.tracksCount', {
                                                            count: artist.tracksCount,
                                                        })}
                                                    </span>
                                                </div>
                                                <span className="font-extrabold text-sonora-lavender shrink-0">
                                                    {t('admin.dashboard.playsShort', {
                                                        count: formatNumber(artist.playsCount),
                                                    })}
                                                </span>
                                            </div>
                                            <progress
                                                value={
                                                    artist.playsCount > 0
                                                        ? artist.playsCount
                                                        : artist.tracksCount
                                                }
                                                max={maxArtistPlays}
                                                className="admin-stat-bar w-full h-2 rounded-full overflow-hidden"
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-sonora-muted py-6 text-center">
                            {t('admin.common.empty')}
                        </p>
                    )}
                </section>

                <section className="p-5 rounded-2xl bg-sonora-dark/60 border border-white/10 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base sm:text-lg font-bold text-white">
                            {t('admin.dashboard.topAlbumsTitle')}
                        </h2>
                        <Link
                            to="/admin/albums"
                            className="text-xs font-bold text-sonora-light hover:underline"
                        >
                            {t('admin.dashboard.viewAll')}
                        </Link>
                    </div>

                    {topAlbums.length > 0 ? (
                        <div className="flex flex-col gap-3.5">
                            {topAlbums.map((album, idx) => (
                                <div
                                    key={`${album.id}-${idx}`}
                                    className="flex items-center gap-3"
                                >
                                    <span
                                        className={`w-7 h-7 rounded-lg text-xs font-extrabold flex items-center justify-center shrink-0 ${getRankBadgeClass(
                                            idx
                                        )}`}
                                    >
                                        {idx + 1}
                                    </span>
                                    <MediaImage
                                        src={album.coverUrl}
                                        alt={album.title}
                                        className="w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-linear-to-br from-sonora-purple to-sonora-light flex items-center justify-center text-white"
                                        fallback={<Disc size={16} />}
                                    />
                                    <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                                        <div className="flex items-center justify-between gap-2 text-xs sm:text-sm">
                                            <div className="min-w-0">
                                                <span className="font-bold text-white truncate">
                                                    {album.title}
                                                </span>
                                                <span className="text-xs text-sonora-muted ml-2">
                                                    {album.artistName ?? '—'}{' '}
                                                    {album.releaseYear ? `(${album.releaseYear})` : ''} •{' '}
                                                    {t('admin.dashboard.tracksCount', {
                                                        count: album.tracksCount,
                                                    })}
                                                </span>
                                            </div>
                                            <span className="font-extrabold text-sonora-lavender shrink-0">
                                                {t('admin.dashboard.playsShort', {
                                                    count: formatNumber(album.playsCount),
                                                })}
                                            </span>
                                        </div>
                                        <progress
                                            value={
                                                album.playsCount > 0
                                                    ? album.playsCount
                                                    : album.tracksCount
                                            }
                                            max={maxAlbumPlays}
                                            className="admin-stat-bar w-full h-2 rounded-full overflow-hidden"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-sonora-muted py-6 text-center">
                            {t('admin.common.empty')}
                        </p>
                    )}
                </section>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <section className="p-5 rounded-2xl bg-sonora-dark/60 border border-white/10 flex flex-col gap-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <h2 className="text-base sm:text-lg font-bold text-white">
                            {t('admin.dashboard.genreDistribution')}
                        </h2>
                        <div className="inline-flex items-center p-0.5 rounded-full bg-sonora-panel border border-white/10">
                            <button
                                type="button"
                                onClick={() => setGenreMode('streams')}
                                className={`px-2.5 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                                    genreMode === 'streams'
                                        ? 'bg-sonora-light text-sonora-dark'
                                        : 'text-sonora-lavender hover:text-white'
                                }`}
                            >
                                {t('admin.dashboard.genreModeStreams')}
                            </button>
                            <button
                                type="button"
                                onClick={() => setGenreMode('tracks')}
                                className={`px-2.5 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                                    genreMode === 'tracks'
                                        ? 'bg-sonora-light text-sonora-dark'
                                        : 'text-sonora-lavender hover:text-white'
                                }`}
                            >
                                {t('admin.dashboard.genreModeTracks')}
                            </button>
                        </div>
                    </div>

                    {genreStats.length > 0 ? (
                        <div className="flex flex-col gap-3.5">
                            {genreStats.map((g, idx) => {
                                const metricValue =
                                    genreMode === 'streams'
                                        ? g.playsCount
                                        : g.tracksCount
                                return (
                                    <div
                                        key={`${g.genreId}-${idx}`}
                                        className="flex flex-col gap-1.5"
                                    >
                                        <div className="flex items-center justify-between text-xs sm:text-sm">
                                            <span className="font-semibold text-white truncate">
                                                {g.genreName}
                                            </span>
                                            <span className="text-sonora-muted shrink-0 ml-2">
                                                {formatNumber(g.playsCount)} •{' '}
                                                {t('admin.dashboard.tracksCount', {
                                                    count: g.tracksCount,
                                                })}
                                            </span>
                                        </div>
                                        <progress
                                            value={metricValue}
                                            max={maxGenreMetric}
                                            className="admin-stat-bar w-full h-2 rounded-full overflow-hidden"
                                        />
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-sonora-muted py-6 text-center">
                            {t('admin.common.empty')}
                        </p>
                    )}
                </section>

                <section className="p-5 rounded-2xl bg-sonora-dark/60 border border-white/10 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base sm:text-lg font-bold text-white">
                            {t('admin.dashboard.decadesTitle')}
                        </h2>
                        <Link
                            to="/admin/albums"
                            className="text-xs font-bold text-sonora-light hover:underline"
                        >
                            {t('admin.dashboard.viewAll')}
                        </Link>
                    </div>

                    {decadeStats.length > 0 ? (
                        <div className="flex flex-col gap-3.5">
                            {decadeStats.map((d) => (
                                <div key={d.decadeStart} className="flex flex-col gap-1.5">
                                    <div className="flex items-center justify-between text-xs sm:text-sm">
                                        <span className="font-bold text-white">
                                            {d.label ||
                                                t('admin.dashboard.decadeLabel', {
                                                    decade: d.decadeStart,
                                                })}
                                        </span>
                                        <span className="text-sonora-muted shrink-0 ml-2">
                                            {t('admin.dashboard.albumsCountShort', {
                                                count: d.albumsCount,
                                            })}{' '}
                                            •{' '}
                                            {t('admin.dashboard.tracksCount', {
                                                count: d.tracksCount,
                                            })}{' '}
                                            • {formatNumber(d.playsCount)}
                                        </span>
                                    </div>
                                    <progress
                                        value={
                                            d.playsCount > 0
                                                ? d.playsCount
                                                : d.tracksCount
                                        }
                                        max={maxDecadePlays}
                                        className="player-progress-hover w-full h-2 rounded-full overflow-hidden"
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-sonora-muted py-6 text-center">
                            {t('admin.common.empty')}
                        </p>
                    )}
                </section>

                <section className="p-5 rounded-2xl bg-sonora-dark/60 border border-white/10 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base sm:text-lg font-bold text-white">
                            {t('admin.dashboard.recentSongs')}
                        </h2>
                        <Link
                            to="/admin/songs"
                            className="text-xs font-bold text-sonora-light hover:underline"
                        >
                            {t('admin.dashboard.viewAll')}
                        </Link>
                    </div>

                    {recentSongs.length > 0 ? (
                        <div className="flex flex-col gap-1.5">
                            {recentSongs.map((song, idx) => {
                                const active = currentSong?.id === song.id
                                return (
                                    <div
                                        key={`${song.id}-${idx}`}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                                            active
                                                ? 'bg-sonora-warm/50'
                                                : 'hover:bg-white/5'
                                        }`}
                                    >
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handlePlayById(
                                                    song.id,
                                                    recentSongs.map((r) => r.id)
                                                )
                                            }
                                            className="relative group/play w-9 h-9 rounded-lg overflow-hidden bg-sonora-warm flex items-center justify-center shrink-0 text-white cursor-pointer"
                                        >
                                            <MediaImage
                                                src={resolveAnalyticsSongCover(
                                                    song.id,
                                                    song.coverUrl,
                                                    song.albumTitle
                                                )}
                                                alt={song.name}
                                                className="w-full h-full flex items-center justify-center"
                                                fallback={<Music size={15} className="text-white/75" />}
                                            />
                                            <span className="absolute inset-0 bg-sonora-dark/60 opacity-0 group-hover/play:opacity-100 transition-opacity flex items-center justify-center">
                                                {active && isPlaying ? (
                                                    <Pause size={14} fill="currentColor" />
                                                ) : (
                                                    <Play size={14} fill="currentColor" className="ml-0.5" />
                                                )}
                                            </span>
                                        </button>
                                        <div className="flex-1 min-w-0">
                                            <p
                                                className={`text-sm font-semibold truncate ${
                                                    active
                                                        ? 'text-sonora-light'
                                                        : 'text-white'
                                                }`}
                                            >
                                                {song.name}
                                            </p>
                                            <p className="text-xs text-sonora-muted truncate">
                                                {song.artistName ?? '—'} •{' '}
                                                {song.albumTitle ?? '—'}
                                            </p>
                                        </div>
                                        <span className="text-xs font-bold text-sonora-lavender shrink-0">
                                            {formatNumber(song.playCount)}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-sonora-muted py-6 text-center">
                            {t('admin.common.empty')}
                        </p>
                    )}
                </section>
            </div>
        </div>
    )
}
