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
} from 'lucide-react'
import { useGetAllSongsQuery } from '../../services/songs/songsApi'
import { useGetAlbumsQuery } from '../../services/albums/albumsApi'
import { useGetArtistsQuery } from '../../services/artists/artistsApi'
import { useGetGenresQuery } from '../../services/genres/genresApi'
import { useGetRolesQuery } from '../../services/roles/rolesApi'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
    playSong,
    togglePlay,
    selectCurrentSong,
    selectIsPlaying,
    selectSongPlayCounts,
} from '../../store/slices/playerSlice'
import type { ISong } from '../../types/ISong'
import { formatNumber, getEffectiveSongPlays } from './adminUtils'

export default function AdminDashboardPage() {
    const { t } = useTranslation()
    const dispatch = useAppDispatch()
    const currentSong = useAppSelector(selectCurrentSong)
    const isPlaying = useAppSelector(selectIsPlaying)
    const livePlayCounts = useAppSelector(selectSongPlayCounts)

    const [includeDemo, setIncludeDemo] = useState(true)
    const [genreMode, setGenreMode] = useState<'streams' | 'tracks'>('streams')

    const { data: songs = [], isLoading: isSongsLoading } = useGetAllSongsQuery()
    const { data: albums = [], isLoading: isAlbumsLoading } = useGetAlbumsQuery()
    const { data: artists = [], isLoading: isArtistsLoading } = useGetArtistsQuery()
    const { data: genres = [], isLoading: isGenresLoading } = useGetGenresQuery()
    const { data: roles = [] } = useGetRolesQuery()

    const isLoading = isSongsLoading || isAlbumsLoading || isArtistsLoading || isGenresLoading

    const totalLiveSessionPlays = Object.values(livePlayCounts).reduce(
        (acc, val) => acc + val,
        0
    )

    const songsWithPlays = songs.map((song) => ({
        song,
        plays: getEffectiveSongPlays(song, livePlayCounts, includeDemo),
    }))

    const totalStreams = songsWithPlays.reduce((sum, item) => sum + item.plays, 0)

    const topPlayedSongs = [...songsWithPlays]
        .sort((a, b) => b.plays - a.plays || b.song.id - a.song.id)
        .slice(0, 10)

    const maxTopSongPlays = Math.max(1, ...topPlayedSongs.map((item) => item.plays))

    const avgPlaysPerSong = songs.length > 0 ? Math.round(totalStreams / songs.length) : 0
    const avgSongsPerAlbum =
        albums.length > 0 ? (songs.length / albums.length).toFixed(1) : '0.0'
    const avgSongsPerArtist =
        artists.length > 0 ? (songs.length / artists.length).toFixed(1) : '0.0'

    const validYears = albums
        .map((a) => a.releaseYear)
        .filter((y) => Number.isFinite(y) && y > 1900)
    const releaseSpanText =
        validYears.length > 0
            ? `${Math.min(...validYears)} – ${Math.max(...validYears)}`
            : '—'

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
            value: formatNumber(songs.length),
            to: '/admin/songs',
            icon: Music,
            gradient: 'from-sonora-purple to-sonora-light',
        },
        {
            label: t('admin.dashboard.totalAlbums'),
            value: formatNumber(albums.length),
            to: '/admin/albums',
            icon: Disc,
            gradient: 'from-sonora-warm to-sonora-pink',
        },
        {
            label: t('admin.dashboard.totalArtists'),
            value: formatNumber(artists.length),
            to: '/admin/artists',
            icon: Mic2,
            gradient: 'from-purple-700 to-pink-500',
        },
        {
            label: t('admin.dashboard.totalGenres'),
            value: formatNumber(genres.length),
            to: '/admin/genres',
            icon: Layers,
            gradient: 'from-violet-900 to-purple-500',
        },
        {
            label: t('admin.dashboard.totalRoles'),
            value: formatNumber(roles.length),
            to: '/admin/roles',
            icon: Shield,
            gradient: 'from-fuchsia-800 to-purple-400',
        },
    ]

    const artistStats = artists
        .map((artist) => {
            const artistSongs = songsWithPlays.filter(
                (item) =>
                    item.song.artist_name?.toLowerCase() === artist.name.toLowerCase()
            )
            const artistAlbumsCount = albums.filter(
                (al) => al.artistId === artist.id
            ).length
            const plays = artistSongs.reduce((sum, item) => sum + item.plays, 0)
            return {
                id: artist.id,
                name: artist.name,
                tracksCount: artistSongs.length,
                albumsCount: artistAlbumsCount,
                plays,
            }
        })
        .sort((a, b) => b.plays - a.plays || b.tracksCount - a.tracksCount)
        .slice(0, 6)

    const maxArtistPlays = Math.max(1, ...artistStats.map((a) => a.plays))

    const albumStats = albums
        .map((album) => {
            const albumSongs = songsWithPlays.filter(
                (item) =>
                    item.song.album_title?.toLowerCase() === album.title.toLowerCase()
            )
            const artistObj = artists.find((ar) => ar.id === album.artistId)
            const plays = albumSongs.reduce((sum, item) => sum + item.plays, 0)
            return {
                id: album.id,
                title: album.title,
                year: album.releaseYear,
                artistName: artistObj?.name ?? albumSongs[0]?.song.artist_name ?? '—',
                tracksCount: albumSongs.length,
                plays,
            }
        })
        .sort((a, b) => b.plays - a.plays || b.tracksCount - a.tracksCount)
        .slice(0, 6)

    const maxAlbumPlays = Math.max(1, ...albumStats.map((al) => al.plays))

    const genreStatsAll = genres.map((g) => {
        const matching = songsWithPlays.filter((item) =>
            item.song.genres_names?.some(
                (gn) => gn.toLowerCase() === g.name.toLowerCase()
            )
        )
        const plays = matching.reduce((sum, item) => sum + item.plays, 0)
        return {
            id: g.id,
            name: g.name,
            count: matching.length,
            plays,
        }
    })

    const topGenreByStreams = [...genreStatsAll].sort((a, b) => b.plays - a.plays)[0]

    const genreStats = [...genreStatsAll]
        .sort((a, b) =>
            genreMode === 'streams'
                ? b.plays - a.plays || b.count - a.count
                : b.count - a.count || b.plays - a.plays
        )
        .slice(0, 8)

    const maxGenreMetric = Math.max(
        1,
        ...genreStats.map((g) => (genreMode === 'streams' ? g.plays : g.count))
    )

    const decadeMap = new Map<
        number,
        { decade: number; albumsCount: number; tracksCount: number; plays: number }
    >()
    for (const album of albums) {
        if (!Number.isFinite(album.releaseYear) || album.releaseYear <= 1900) continue
        const decade = Math.floor(album.releaseYear / 10) * 10
        const albumSongs = songsWithPlays.filter(
            (item) => item.song.album_title?.toLowerCase() === album.title.toLowerCase()
        )
        const plays = albumSongs.reduce((sum, item) => sum + item.plays, 0)
        const existing = decadeMap.get(decade) ?? {
            decade,
            albumsCount: 0,
            tracksCount: 0,
            plays: 0,
        }
        existing.albumsCount += 1
        existing.tracksCount += albumSongs.length
        existing.plays += plays
        decadeMap.set(decade, existing)
    }

    const decadeStats = Array.from(decadeMap.values()).sort(
        (a, b) => b.decade - a.decade
    )
    const maxDecadePlays = Math.max(
        1,
        ...decadeStats.map((d) => (d.plays > 0 ? d.plays : d.tracksCount))
    )

    const recentSongs = [...songsWithPlays]
        .sort((a, b) => b.song.id - a.song.id)
        .slice(0, 6)

    const secondaryMetrics = [
        {
            label: t('admin.dashboard.avgPlaysPerSong'),
            value: isLoading ? '…' : formatNumber(avgPlaysPerSong),
            icon: TrendingUp,
        },
        {
            label: t('admin.dashboard.avgSongsPerAlbum'),
            value: isLoading ? '…' : avgSongsPerAlbum,
            icon: BarChart3,
        },
        {
            label: t('admin.dashboard.avgSongsPerArtist'),
            value: isLoading ? '…' : avgSongsPerArtist,
            icon: Flame,
        },
        {
            label: t('admin.dashboard.topGenreKpi'),
            value: isLoading ? '…' : topGenreByStreams?.name ?? '—',
            sub: releaseSpanText !== '—' ? `${t('admin.dashboard.releaseSpanKpi')}: ${releaseSpanText}` : undefined,
            icon: Calendar,
        },
    ]

    const handlePlayPreview = (song: ISong, queueSource: ISong[]) => {
        if (currentSong?.id === song.id) {
            dispatch(togglePlay())
        } else {
            dispatch(playSong({ song, queue: queueSource }))
        }
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
                        {t('admin.dashboard.subtitle')}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sonora-dark/80 border border-sonora-light/30 text-xs font-semibold text-sonora-lavender">
                        <Headphones size={14} className="text-sonora-light" />
                        {t('admin.dashboard.liveSessionBadge', {
                            count: totalLiveSessionPlays,
                        })}
                    </span>

                    <div className="inline-flex items-center p-1 rounded-full bg-sonora-dark border border-white/10">
                        <button
                            type="button"
                            onClick={() => setIncludeDemo(true)}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                                includeDemo
                                    ? 'bg-sonora-light text-sonora-dark'
                                    : 'text-sonora-lavender hover:text-white'
                            }`}
                        >
                            {t('admin.dashboard.modeCombined')}
                        </button>
                        <button
                            type="button"
                            onClick={() => setIncludeDemo(false)}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                                !includeDemo
                                    ? 'bg-sonora-light text-sonora-dark'
                                    : 'text-sonora-lavender hover:text-white'
                            }`}
                        >
                            {t('admin.dashboard.modeLiveOnly')}
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 2xl:grid-cols-6 gap-3.5 sm:gap-4">
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
                            {isLoading ? '…' : value}
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
                        {topPlayedSongs.map(({ song, plays }, idx) => {
                            const active = currentSong?.id === song.id
                            const sharePercent =
                                totalStreams > 0
                                    ? ((plays / totalStreams) * 100).toFixed(1)
                                    : '0.0'
                            return (
                                <div
                                    key={song.id}
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
                                            handlePlayPreview(
                                                song,
                                                topPlayedSongs.map((item) => item.song)
                                            )
                                        }
                                        className="w-9 h-9 rounded-xl bg-sonora-warm hover:bg-sonora-light text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                                    >
                                        {active && isPlaying ? (
                                            <Pause size={15} fill="currentColor" />
                                        ) : (
                                            <Play
                                                size={15}
                                                fill="currentColor"
                                                className="ml-0.5"
                                            />
                                        )}
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
                                                    {song.artist_name ?? '—'} •{' '}
                                                    {song.album_title ?? '—'}
                                                </p>
                                            </div>

                                            <div className="text-right shrink-0">
                                                <p className="text-sm font-extrabold text-white">
                                                    {formatNumber(plays)}
                                                </p>
                                                <p className="text-xs text-sonora-lavender">
                                                    {t('admin.dashboard.sharePercent', {
                                                        percent: sharePercent,
                                                    })}
                                                </p>
                                            </div>
                                        </div>

                                        <progress
                                            value={plays}
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

                    {artistStats.length > 0 ? (
                        <div className="flex flex-col gap-3.5">
                            {artistStats.map((artist, idx) => (
                                <div key={artist.id} className="flex items-center gap-3">
                                    <span
                                        className={`w-7 h-7 rounded-lg text-xs font-extrabold flex items-center justify-center shrink-0 ${getRankBadgeClass(
                                            idx
                                        )}`}
                                    >
                                        {idx + 1}
                                    </span>
                                    <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                                        <div className="flex items-center justify-between gap-2 text-xs sm:text-sm">
                                            <div className="min-w-0 flex items-center gap-2">
                                                <span className="font-bold text-white truncate">
                                                    {artist.name}
                                                </span>
                                                <span className="text-xs text-sonora-muted shrink-0">
                                                    {t('admin.dashboard.albumsCountShort', {
                                                        count: artist.albumsCount,
                                                    })}{' '}
                                                    •{' '}
                                                    {t('admin.dashboard.tracksCount', {
                                                        count: artist.tracksCount,
                                                    })}
                                                </span>
                                            </div>
                                            <span className="font-extrabold text-sonora-lavender shrink-0">
                                                {t('admin.dashboard.playsShort', {
                                                    count: formatNumber(artist.plays),
                                                })}
                                            </span>
                                        </div>
                                        <progress
                                            value={artist.plays}
                                            max={maxArtistPlays}
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

                    {albumStats.length > 0 ? (
                        <div className="flex flex-col gap-3.5">
                            {albumStats.map((album, idx) => (
                                <div key={album.id} className="flex items-center gap-3">
                                    <span
                                        className={`w-7 h-7 rounded-lg text-xs font-extrabold flex items-center justify-center shrink-0 ${getRankBadgeClass(
                                            idx
                                        )}`}
                                    >
                                        {idx + 1}
                                    </span>
                                    <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                                        <div className="flex items-center justify-between gap-2 text-xs sm:text-sm">
                                            <div className="min-w-0">
                                                <span className="font-bold text-white truncate">
                                                    {album.title}
                                                </span>
                                                <span className="text-xs text-sonora-muted ml-2">
                                                    {album.artistName} ({album.year}) •{' '}
                                                    {t('admin.dashboard.tracksCount', {
                                                        count: album.tracksCount,
                                                    })}
                                                </span>
                                            </div>
                                            <span className="font-extrabold text-sonora-lavender shrink-0">
                                                {t('admin.dashboard.playsShort', {
                                                    count: formatNumber(album.plays),
                                                })}
                                            </span>
                                        </div>
                                        <progress
                                            value={album.plays}
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
                            {genreStats.map((g) => {
                                const metricValue =
                                    genreMode === 'streams' ? g.plays : g.count
                                return (
                                    <div key={g.id} className="flex flex-col gap-1.5">
                                        <div className="flex items-center justify-between text-xs sm:text-sm">
                                            <span className="font-semibold text-white truncate">
                                                {g.name}
                                            </span>
                                            <span className="text-sonora-muted shrink-0 ml-2">
                                                {formatNumber(g.plays)} •{' '}
                                                {t('admin.dashboard.tracksCount', {
                                                    count: g.count,
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
                                <div key={d.decade} className="flex flex-col gap-1.5">
                                    <div className="flex items-center justify-between text-xs sm:text-sm">
                                        <span className="font-bold text-white">
                                            {t('admin.dashboard.decadeLabel', {
                                                decade: d.decade,
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
                                            • {formatNumber(d.plays)}
                                        </span>
                                    </div>
                                    <progress
                                        value={d.plays > 0 ? d.plays : d.tracksCount}
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
                            {recentSongs.map(({ song, plays }) => {
                                const active = currentSong?.id === song.id
                                return (
                                    <div
                                        key={song.id}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                                            active
                                                ? 'bg-sonora-warm/50'
                                                : 'hover:bg-white/5'
                                        }`}
                                    >
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handlePlayPreview(
                                                    song,
                                                    recentSongs.map((r) => r.song)
                                                )
                                            }
                                            className="w-8 h-8 rounded-lg bg-sonora-warm flex items-center justify-center shrink-0 text-white hover:bg-sonora-light transition-colors cursor-pointer"
                                        >
                                            {active && isPlaying ? (
                                                <Pause size={14} fill="currentColor" />
                                            ) : (
                                                <Play
                                                    size={14}
                                                    fill="currentColor"
                                                    className="ml-0.5"
                                                />
                                            )}
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
                                                {song.artist_name ?? '—'} •{' '}
                                                {song.album_title ?? '—'}
                                            </p>
                                        </div>
                                        <span className="text-xs font-bold text-sonora-lavender shrink-0">
                                            {formatNumber(plays)}
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
