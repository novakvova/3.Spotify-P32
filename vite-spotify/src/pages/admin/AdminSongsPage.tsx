import React, { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Play,
    Pause,
    Upload,
    X,
    Check,
    AlertCircle,
    Headphones,
    Music,
    ImagePlus,
    Database,
    Sparkles,
} from 'lucide-react'
import {
    useGetAllSongsQuery,
    useCreateSongMutation,
    useUpdateSongMutation,
    useDeleteSongMutation,
} from '../../services/songs/songsApi'
import { useGetArtistsQuery } from '../../services/artists/artistsApi'
import { useGetAlbumsQuery } from '../../services/albums/albumsApi'
import { useGetGenresQuery } from '../../services/genres/genresApi'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
    playSong,
    togglePlay,
    setAdminStatsMode,
    selectCurrentSong,
    selectIsPlaying,
    selectAdminStatsMode,
} from '../../store/slices/playerSlice'
import {
    analyticsApi,
    useGetSongsPlaysQuery,
} from '../../services/analytics/analyticsApi'
import type { ISong } from '../../types/ISong'
import MediaImage from '../../components/MediaImage'
import { resolveSongCover } from '../../utils/format'
import {
    extractApiErrorMessage,
    formatNumber,
    getDeterministicDemoPlays,
} from './adminUtils'

type SongSortOption = 'id' | 'plays_desc' | 'plays_asc' | 'name_asc'

export default function AdminSongsPage() {
    const { t } = useTranslation()
    const dispatch = useAppDispatch()
    const [searchParams, setSearchParams] = useSearchParams()
    const currentSong = useAppSelector(selectCurrentSong)
    const isPlaying = useAppSelector(selectIsPlaying)
    const statsMode = useAppSelector(selectAdminStatsMode)
    const isDemo = statsMode === 'demo'

    const { data: songs = [], isLoading } = useGetAllSongsQuery()
    const { data: songsPlays = [] } = useGetSongsPlaysQuery(undefined, {
        refetchOnMountOrArgChange: true,
    })
    const { data: artists = [] } = useGetArtistsQuery()
    const { data: albums = [] } = useGetAlbumsQuery()
    const { data: genres = [] } = useGetGenresQuery()

    const [createSong, { isLoading: isCreating }] = useCreateSongMutation()
    const [updateSong, { isLoading: isUpdating }] = useUpdateSongMutation()
    const [deleteSong, { isLoading: isDeleting }] = useDeleteSongMutation()

    const [search, setSearch] = useState('')
    const [sortBy, setSortBy] = useState<SongSortOption>('plays_desc')
    const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null)
    const [editingSong, setEditingSong] = useState<ISong | null>(null)
    const [deletingTarget, setDeletingTarget] = useState<ISong | null>(null)

    const [name, setName] = useState('')
    const [artistName, setArtistName] = useState('')
    const [albumTitle, setAlbumTitle] = useState('')
    const [selectedGenres, setSelectedGenres] = useState<string[]>([])
    const [audioFile, setAudioFile] = useState<File | null>(null)
    const [coverFile, setCoverFile] = useState<File | null>(null)
    const [coverPreview, setCoverPreview] = useState<string | null>(null)
    const [formError, setFormError] = useState<string | null>(null)
    const [banner, setBanner] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

    const openCreateModal = useCallback(() => {
        setEditingSong(null)
        setName('')
        setArtistName(artists[0]?.name ?? '')
        setAlbumTitle(albums[0]?.title ?? '')
        setSelectedGenres([])
        setAudioFile(null)
        setCoverFile(null)
        setCoverPreview(null)
        setFormError(null)
        setModalMode('create')
    }, [artists, albums])

    useEffect(() => {
        if (searchParams.get('create') === '1') {
            openCreateModal()
            setSearchParams({}, { replace: true })
        }
    }, [searchParams, setSearchParams, openCreateModal])

    const openEditModal = (song: ISong) => {
        setEditingSong(song)
        setName(song.name)
        setArtistName(song.artist_name ?? '')
        setAlbumTitle(song.album_title ?? '')
        setSelectedGenres(song.genres_names ?? [])
        setAudioFile(null)
        setCoverFile(null)
        setCoverPreview(song.coverUrl ?? null)
        setFormError(null)
        setModalMode('edit')
    }

    const closeModal = () => {
        setModalMode(null)
        setEditingSong(null)
        setCoverFile(null)
        setCoverPreview(null)
        setFormError(null)
    }

    const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null
        setCoverFile(file)
        if (file) {
            setCoverPreview(URL.createObjectURL(file))
        } else {
            setCoverPreview(editingSong?.coverUrl ?? null)
        }
    }

    const toggleGenre = (genreName: string) => {
        setSelectedGenres((prev) =>
            prev.includes(genreName)
                ? prev.filter((g) => g !== genreName)
                : [...prev, genreName]
        )
    }

    const selectedArtistObj = artists.find(
        (a) => a.name.toLowerCase() === artistName.toLowerCase()
    )
    const filteredAlbumsForSelect =
        selectedArtistObj && albums.some((al) => al.artistId === selectedArtistObj.id)
            ? albums.filter((al) => al.artistId === selectedArtistObj.id)
            : albums

    const handleArtistChange = (nextArtistName: string) => {
        setArtistName(nextArtistName)
        const foundArtist = artists.find(
            (a) => a.name.toLowerCase() === nextArtistName.toLowerCase()
        )
        if (foundArtist) {
            const artistAlbums = albums.filter((al) => al.artistId === foundArtist.id)
            if (
                artistAlbums.length > 0 &&
                !artistAlbums.some((al) => al.title === albumTitle)
            ) {
                setAlbumTitle(artistAlbums[0].title)
            }
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setFormError(null)
        setBanner(null)

        if (!name.trim() || !artistName.trim() || !albumTitle.trim()) {
            setFormError(t('admin.songs.validationRequired'))
            return
        }

        try {
            if (modalMode === 'create') {
                if (!audioFile) {
                    setFormError(t('admin.songs.validationFile'))
                    return
                }
                const formData = new FormData()
                formData.append('name', name.trim())
                formData.append('artist_name', artistName.trim())
                formData.append('album_title', albumTitle.trim())
                if (selectedGenres.length > 0) {
                    formData.append('genres_names', selectedGenres.join(','))
                }
                formData.append('file', audioFile)
                if (coverFile) {
                    formData.append('cover', coverFile)
                }
                await createSong(formData).unwrap()
            } else if (modalMode === 'edit' && editingSong) {
                const formData = new FormData()
                formData.append('name', name.trim())
                formData.append('artist_name', artistName.trim())
                formData.append('album_title', albumTitle.trim())
                if (selectedGenres.length > 0) {
                    formData.append('genres_names', selectedGenres.join(','))
                }
                if (coverFile) {
                    formData.append('cover', coverFile)
                }
                await updateSong({
                    id: editingSong.id,
                    formData,
                }).unwrap()
            }
            dispatch(analyticsApi.util.invalidateTags(['Analytics']))
            setBanner({ text: t('admin.common.successSaved'), type: 'success' })
            closeModal()
        } catch (err) {
            setFormError(extractApiErrorMessage(err, t('admin.common.errorGeneric')))
        }
    }

    const handleConfirmDelete = async () => {
        if (!deletingTarget) return
        setBanner(null)
        try {
            await deleteSong(deletingTarget.id).unwrap()
            dispatch(analyticsApi.util.invalidateTags(['Analytics']))
            setBanner({ text: t('admin.common.successDeleted'), type: 'success' })
            setDeletingTarget(null)
        } catch (err) {
            setBanner({
                text: extractApiErrorMessage(err, t('admin.common.errorGeneric')),
                type: 'error',
            })
            setDeletingTarget(null)
        }
    }

    const playsBySongId = new Map<number, number>(
        songsPlays.map((stat) => [stat.id, stat.playCount])
    )
    const getSongPlayCount = (song: ISong): number =>
        isDemo
            ? getDeterministicDemoPlays(song)
            : (playsBySongId.get(song.id) ?? song.playCount ?? 0)

    const q = search.trim().toLowerCase()
    const filteredSongs = songs
        .filter((song) => {
            if (!q) return true
            return (
                song.name.toLowerCase().includes(q) ||
                (song.artist_name ?? '').toLowerCase().includes(q) ||
                (song.album_title ?? '').toLowerCase().includes(q) ||
                (song.genres_names ?? []).some((g) => g.toLowerCase().includes(q))
            )
        })
        .sort((a, b) => {
            if (sortBy === 'plays_desc') {
                return getSongPlayCount(b) - getSongPlayCount(a) || b.id - a.id
            }
            if (sortBy === 'plays_asc') {
                return getSongPlayCount(a) - getSongPlayCount(b) || a.id - b.id
            }
            if (sortBy === 'name_asc') {
                return a.name.localeCompare(b.name)
            }
            return a.id - b.id
        })

    const handlePlay = (song: ISong) => {
        if (currentSong?.id === song.id) {
            dispatch(togglePlay())
        } else {
            dispatch(playSong({ song, queue: filteredSongs }))
        }
    }

    return (
        <div className="w-full flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                        {t('admin.songs.title')}
                    </h1>
                    <p className="text-sm text-sonora-muted mt-1">
                        {t('admin.songs.subtitle')}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={openCreateModal}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-sonora-light text-sonora-dark font-bold text-sm hover:opacity-90 transition-opacity cursor-pointer shrink-0"
                >
                    <Plus size={18} />
                    {t('admin.songs.uploadBtn')}
                </button>
            </div>

            {banner && (
                <div
                    className={`px-4 py-3 rounded-xl border text-xs sm:text-sm font-medium flex items-center justify-between gap-3 ${
                        banner.type === 'success'
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : 'bg-red-500/10 border-red-500/30 text-red-400'
                    }`}
                >
                    <div className="flex items-center gap-2">
                        {banner.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                        <span>{banner.text}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setBanner(null)}
                        className="opacity-70 hover:opacity-100 cursor-pointer"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="relative w-full max-w-md">
                    <Search
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sonora-muted pointer-events-none"
                    />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={t('admin.common.search')}
                        className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-sonora-dark border border-white/15 text-sm text-white placeholder:text-sonora-muted outline-none focus:border-sonora-light transition-colors"
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={() => setSearch('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-sonora-muted hover:text-white cursor-pointer"
                        >
                            <X size={15} />
                        </button>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                    <div className="inline-flex items-center p-1 rounded-full bg-sonora-dark border border-white/15">
                        <button
                            type="button"
                            onClick={() => dispatch(setAdminStatsMode('real'))}
                            title={t('admin.dashboard.modeRealHint')}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                                !isDemo
                                    ? 'bg-sonora-light text-sonora-dark'
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
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                                isDemo
                                    ? 'bg-sonora-pink text-sonora-dark'
                                    : 'text-sonora-lavender hover:text-white'
                            }`}
                        >
                            <Sparkles size={13} />
                            <span>{t('admin.dashboard.modeDemo')}</span>
                        </button>
                    </div>

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SongSortOption)}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-sonora-dark border border-white/15 text-sm font-semibold text-white outline-none focus:border-sonora-light transition-colors cursor-pointer"
                    >
                        <option value="plays_desc">{t('admin.songs.sortPlaysDesc')}</option>
                        <option value="plays_asc">{t('admin.songs.sortPlaysAsc')}</option>
                        <option value="name_asc">{t('admin.songs.sortNameAsc')}</option>
                        <option value="id">{t('admin.songs.sortDefault')}</option>
                    </select>
                </div>
            </div>

            {isLoading ? (
                <p className="text-sm text-sonora-muted py-12 text-center animate-pulse">
                    {t('admin.common.loading')}
                </p>
            ) : filteredSongs.length === 0 ? (
                <p className="text-sm text-sonora-muted py-12 text-center">
                    {t('admin.common.empty')}
                </p>
            ) : (
                <div className="w-full overflow-x-auto rounded-2xl border border-white/10 bg-sonora-dark/50">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-sonora-muted">
                                <th className="py-3.5 px-4 font-bold w-16">{t('admin.common.id')}</th>
                                <th className="py-3.5 px-4 font-bold">{t('admin.songs.colTrack')}</th>
                                <th className="py-3.5 px-4 font-bold hidden md:table-cell">
                                    {t('admin.songs.colAlbum')}
                                </th>
                                <th className="py-3.5 px-4 font-bold hidden lg:table-cell">
                                    {t('admin.songs.colGenres')}
                                </th>
                                <th className="py-3.5 px-4 font-bold">
                                    {t('admin.songs.colPlays')}
                                </th>
                                <th className="py-3.5 px-4 font-bold text-right w-28">
                                    {t('admin.common.actions')}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                            {filteredSongs.map((song) => {
                                const active = currentSong?.id === song.id
                                const songPlays = getSongPlayCount(song)
                                return (
                                    <tr
                                        key={song.id}
                                        className={`transition-colors ${
                                            active ? 'bg-sonora-warm/40' : 'hover:bg-white/5'
                                        }`}
                                    >
                                        <td className="py-3 px-4 font-mono text-xs text-sonora-muted">
                                            #{song.id}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <button
                                                    type="button"
                                                    onClick={() => handlePlay(song)}
                                                    className="relative group/play w-10 h-10 rounded-lg overflow-hidden bg-sonora-warm text-white flex items-center justify-center shrink-0 cursor-pointer"
                                                >
                                                    <MediaImage
                                                        src={resolveSongCover(song, albums)}
                                                        alt={song.name}
                                                        className="w-full h-full flex items-center justify-center"
                                                        fallback={<Music size={15} className="text-white/70" />}
                                                    />
                                                    <span className="absolute inset-0 bg-sonora-dark/65 opacity-0 group-hover/play:opacity-100 transition-opacity flex items-center justify-center">
                                                        {active && isPlaying ? (
                                                            <Pause size={14} fill="currentColor" />
                                                        ) : (
                                                            <Play size={14} fill="currentColor" className="ml-0.5" />
                                                        )}
                                                    </span>
                                                </button>
                                                <div className="min-w-0">
                                                    <p
                                                        className={`font-semibold truncate max-w-48 sm:max-w-64 ${
                                                            active ? 'text-sonora-light' : 'text-white'
                                                        }`}
                                                    >
                                                        {song.name}
                                                    </p>
                                                    <p className="text-xs text-sonora-muted truncate max-w-48 sm:max-w-64">
                                                        {song.artist_name ?? '—'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-sonora-lavender hidden md:table-cell truncate max-w-44">
                                            {song.album_title ?? '—'}
                                        </td>
                                        <td className="py-3 px-4 hidden lg:table-cell">
                                            <div className="flex flex-wrap gap-1">
                                                {song.genres_names?.map((g) => (
                                                    <span
                                                        key={g}
                                                        className="px-2 py-0.5 rounded-full text-xs bg-sonora-panel border border-white/10 text-sonora-lavender"
                                                    >
                                                        {g}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="inline-flex items-center gap-1.5 font-bold text-white whitespace-nowrap">
                                                <Headphones
                                                    size={14}
                                                    className="text-sonora-light shrink-0"
                                                />
                                                {formatNumber(songPlays)}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="inline-flex items-center justify-end gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() => openEditModal(song)}
                                                    className="p-2 rounded-lg text-sonora-lavender hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                                                    title={t('admin.common.edit')}
                                                >
                                                    <Edit2 size={15} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setDeletingTarget(song)}
                                                    className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/15 transition-colors cursor-pointer"
                                                    title={t('admin.common.delete')}
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {modalMode && (
                <div
                    className="fixed inset-0 z-50 bg-sonora-deep/80 backdrop-blur-xs flex items-center justify-center p-4"
                    onClick={closeModal}
                >
                    <div
                        className="w-full max-w-lg rounded-3xl bg-sonora-panel border border-white/20 p-6 sm:p-7 shadow-2xl max-h-screen overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-xl font-extrabold text-white">
                                {modalMode === 'create'
                                    ? t('admin.songs.createTitle')
                                    : t('admin.songs.editTitle')}
                            </h2>
                            <button
                                type="button"
                                onClick={closeModal}
                                className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-sonora-lavender">
                                    {t('admin.songs.nameLabel')}
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder={t('admin.songs.namePlaceholder')}
                                    required
                                    className="w-full px-4 py-2.5 rounded-xl bg-sonora-dark border border-white/15 text-sm text-white outline-none focus:border-sonora-light"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-sonora-lavender">
                                        {t('admin.songs.artistLabel')}
                                    </label>
                                    <select
                                        value={artistName}
                                        onChange={(e) => handleArtistChange(e.target.value)}
                                        required
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-sonora-dark border border-white/15 text-sm text-white outline-none focus:border-sonora-light cursor-pointer"
                                    >
                                        <option value="" disabled className="bg-sonora-dark text-white">
                                            {t('admin.songs.selectArtist')}
                                        </option>
                                        {artists.map((artist) => (
                                            <option
                                                key={artist.id}
                                                value={artist.name}
                                                className="bg-sonora-dark text-white"
                                            >
                                                {artist.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-sonora-lavender">
                                        {t('admin.songs.albumLabel')}
                                    </label>
                                    <select
                                        value={albumTitle}
                                        onChange={(e) => setAlbumTitle(e.target.value)}
                                        required
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-sonora-dark border border-white/15 text-sm text-white outline-none focus:border-sonora-light cursor-pointer"
                                    >
                                        <option value="" disabled className="bg-sonora-dark text-white">
                                            {t('admin.songs.selectAlbum')}
                                        </option>
                                        {filteredAlbumsForSelect.map((album) => (
                                            <option
                                                key={album.id}
                                                value={album.title}
                                                className="bg-sonora-dark text-white"
                                            >
                                                {album.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-sonora-lavender">
                                    {t('admin.songs.genresLabel')}
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {genres.map((genre) => {
                                        const selected = selectedGenres.includes(genre.name)
                                        return (
                                            <button
                                                key={genre.id}
                                                type="button"
                                                onClick={() => toggleGenre(genre.name)}
                                                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer border ${
                                                    selected
                                                        ? 'bg-sonora-light text-sonora-dark border-sonora-light'
                                                        : 'bg-sonora-dark text-sonora-lavender border-white/15 hover:border-white/40'
                                                }`}
                                            >
                                                {genre.name}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-sonora-lavender">
                                    {t('admin.songs.coverLabel')}
                                </label>
                                <label className="flex items-center gap-3.5 px-4 py-3 rounded-2xl border border-dashed border-white/20 hover:border-sonora-light bg-sonora-dark/60 cursor-pointer transition-colors">
                                    <MediaImage
                                        src={coverPreview}
                                        alt=""
                                        className="w-12 h-12 rounded-xl overflow-hidden bg-sonora-warm/50 flex items-center justify-center shrink-0 text-sonora-light"
                                        fallback={<ImagePlus size={20} />}
                                    />
                                    <span className="text-xs sm:text-sm font-semibold text-white truncate">
                                        {coverFile
                                            ? t('admin.songs.fileSelected', { name: coverFile.name })
                                            : t('admin.songs.coverHint')}
                                    </span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleCoverChange}
                                        className="hidden"
                                    />
                                </label>
                            </div>

                            {modalMode === 'create' && (
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-sonora-lavender">
                                        {t('admin.songs.fileLabel')}
                                    </label>
                                    <label className="flex flex-col items-center justify-center gap-2 px-4 py-5 rounded-2xl border-2 border-dashed border-white/20 hover:border-sonora-light bg-sonora-dark/60 cursor-pointer transition-colors text-center">
                                        <Upload size={22} className="text-sonora-light" />
                                        <span className="text-xs sm:text-sm font-semibold text-white">
                                            {audioFile
                                                ? t('admin.songs.fileSelected', { name: audioFile.name })
                                                : t('admin.songs.fileHint')}
                                        </span>
                                        <input
                                            type="file"
                                            accept="audio/mpeg,.mp3,audio/*"
                                            onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                            )}

                            {formError && (
                                <div className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs font-semibold text-red-400">
                                    {formError}
                                </div>
                            )}

                            <div className="flex items-center justify-end gap-3 mt-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-5 py-2.5 rounded-full border border-white/20 text-xs sm:text-sm font-bold text-white hover:bg-white/10 transition-colors cursor-pointer"
                                >
                                    {t('admin.common.cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreating || isUpdating}
                                    className="px-6 py-2.5 rounded-full bg-sonora-light text-sonora-dark text-xs sm:text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer"
                                >
                                    {isCreating || isUpdating
                                        ? t('admin.common.saving')
                                        : t('admin.common.save')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {deletingTarget && (
                <div
                    className="fixed inset-0 z-50 bg-sonora-deep/80 backdrop-blur-xs flex items-center justify-center p-4"
                    onClick={() => setDeletingTarget(null)}
                >
                    <div
                        className="w-full max-w-md rounded-3xl bg-sonora-panel border border-white/20 p-6 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-extrabold text-white mb-2">
                            {t('admin.common.confirmDeleteTitle')}
                        </h3>
                        <p className="text-sm text-sonora-lavender leading-relaxed mb-6">
                            {t('admin.common.confirmDeleteDesc', { name: deletingTarget.name })}
                        </p>
                        <div className="flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setDeletingTarget(null)}
                                className="px-5 py-2.5 rounded-full border border-white/20 text-xs sm:text-sm font-bold text-white hover:bg-white/10 transition-colors cursor-pointer"
                            >
                                {t('admin.common.cancel')}
                            </button>
                            <button
                                type="button"
                                disabled={isDeleting}
                                onClick={handleConfirmDelete}
                                className="px-6 py-2.5 rounded-full bg-red-500 text-white text-xs sm:text-sm font-bold hover:bg-red-600 disabled:opacity-50 transition-colors cursor-pointer"
                            >
                                {isDeleting ? t('admin.common.deleting') : t('admin.common.delete')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
