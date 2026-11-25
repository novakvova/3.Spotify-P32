import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    X,
    Check,
    AlertCircle,
    ImagePlus,
} from 'lucide-react'
import {
    useGetArtistsQuery,
    useCreateArtistMutation,
    useUpdateArtistMutation,
    useDeleteArtistMutation,
} from '../../services/artists/artistsApi'
import { useGetAlbumsQuery } from '../../services/albums/albumsApi'
import { useGetAllSongsQuery } from '../../services/songs/songsApi'
import { useGetArtistsBreakdownQuery } from '../../services/analytics/analyticsApi'
import type { IArtist } from '../../types/IArtist'
import MediaImage from '../../components/MediaImage'
import { extractApiErrorMessage } from './adminUtils'

export default function AdminArtistsPage() {
    const { t } = useTranslation()
    const [searchParams, setSearchParams] = useSearchParams()

    const { data: artists = [], isLoading } = useGetArtistsQuery()
    const { data: albums = [] } = useGetAlbumsQuery()
    const { data: songs = [] } = useGetAllSongsQuery()
    const { data: artistsBreakdown = [] } = useGetArtistsBreakdownQuery(undefined, {
        refetchOnMountOrArgChange: true,
    })

    const [createArtist, { isLoading: isCreating }] = useCreateArtistMutation()
    const [updateArtist, { isLoading: isUpdating }] = useUpdateArtistMutation()
    const [deleteArtist, { isLoading: isDeleting }] = useDeleteArtistMutation()

    const [search, setSearch] = useState('')
    const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null)
    const [editingArtist, setEditingArtist] = useState<IArtist | null>(null)
    const [deletingTarget, setDeletingTarget] = useState<IArtist | null>(null)

    const [name, setName] = useState('')
    const [birthDate, setBirthDate] = useState('1995-01-01')
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [formError, setFormError] = useState<string | null>(null)
    const [banner, setBanner] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

    const openCreateModal = () => {
        setEditingArtist(null)
        setName('')
        setBirthDate('1995-01-01')
        setImageFile(null)
        setImagePreview(null)
        setFormError(null)
        setModalMode('create')
    }

    useEffect(() => {
        if (searchParams.get('create') === '1') {
            openCreateModal()
            setSearchParams({}, { replace: true })
        }
    }, [searchParams, setSearchParams])

    const openEditModal = (artist: IArtist) => {
        setEditingArtist(artist)
        setName(artist.name)
        setBirthDate(artist.birthDate ? artist.birthDate.slice(0, 10) : '1995-01-01')
        setImageFile(null)
        setImagePreview(artist.imageUrl ?? null)
        setFormError(null)
        setModalMode('edit')
    }

    const closeModal = () => {
        setModalMode(null)
        setEditingArtist(null)
        setImageFile(null)
        setImagePreview(null)
        setFormError(null)
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null
        setImageFile(file)
        if (file) {
            setImagePreview(URL.createObjectURL(file))
        } else {
            setImagePreview(editingArtist?.imageUrl ?? null)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setFormError(null)
        setBanner(null)

        if (!name.trim() || !birthDate) {
            setFormError(t('admin.artists.validationRequired'))
            return
        }

        try {
            const formData = new FormData()
            formData.append('name', name.trim())
            formData.append('birthDate', birthDate)
            if (imageFile) {
                formData.append('image', imageFile)
            }

            if (modalMode === 'create') {
                await createArtist(formData).unwrap()
            } else if (modalMode === 'edit' && editingArtist) {
                await updateArtist({
                    id: editingArtist.id,
                    formData,
                }).unwrap()
            }
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
            await deleteArtist(deletingTarget.id).unwrap()
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

    const artistStatsMap = new Map(
        artistsBreakdown.map((item) => [item.id, item])
    )

    const getAlbumCount = (artistId: number) =>
        artistStatsMap.get(artistId)?.albumsCount ??
        albums.filter((al) => al.artistId === artistId).length

    const getSongCount = (artist: IArtist) =>
        artistStatsMap.get(artist.id)?.tracksCount ??
        songs.filter((s) => s.artist_name?.toLowerCase() === artist.name.toLowerCase()).length

    const q = search.trim().toLowerCase()
    const filteredArtists = artists.filter((artist) => {
        if (!q) return true
        return artist.name.toLowerCase().includes(q)
    })

    return (
        <div className="w-full flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                        {t('admin.artists.title')}
                    </h1>
                    <p className="text-sm text-sonora-muted mt-1">
                        {t('admin.artists.subtitle')}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={openCreateModal}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-sonora-light text-sonora-dark font-bold text-sm hover:opacity-90 transition-opacity cursor-pointer shrink-0"
                >
                    <Plus size={18} />
                    {t('admin.artists.addBtn')}
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

            {isLoading ? (
                <p className="text-sm text-sonora-muted py-12 text-center animate-pulse">
                    {t('admin.common.loading')}
                </p>
            ) : filteredArtists.length === 0 ? (
                <p className="text-sm text-sonora-muted py-12 text-center">
                    {t('admin.common.empty')}
                </p>
            ) : (
                <div className="w-full overflow-x-auto rounded-2xl border border-white/10 bg-sonora-dark/50">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-sonora-muted">
                                <th className="py-3.5 px-4 font-bold w-16">{t('admin.common.id')}</th>
                                <th className="py-3.5 px-4 font-bold">{t('admin.artists.colName')}</th>
                                <th className="py-3.5 px-4 font-bold hidden sm:table-cell">
                                    {t('admin.artists.colBirthDate')}
                                </th>
                                <th className="py-3.5 px-4 font-bold hidden md:table-cell">
                                    {t('admin.artists.colAlbums')}
                                </th>
                                <th className="py-3.5 px-4 font-bold hidden md:table-cell">
                                    {t('admin.artists.colSongs')}
                                </th>
                                <th className="py-3.5 px-4 font-bold text-right w-28">
                                    {t('admin.common.actions')}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                            {filteredArtists.map((artist) => (
                                <tr key={artist.id} className="hover:bg-white/5 transition-colors">
                                    <td className="py-3 px-4 font-mono text-xs text-sonora-muted">
                                        #{artist.id}
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-3">
                                            <MediaImage
                                                src={artist.imageUrl}
                                                alt={artist.name}
                                                className="w-10 h-10 rounded-full overflow-hidden bg-linear-to-br from-sonora-purple to-sonora-pink flex items-center justify-center shrink-0 font-bold text-xs text-white"
                                                fallback={<span>{artist.name[0]?.toUpperCase() ?? '?'}</span>}
                                            />
                                            <span className="font-semibold text-white truncate max-w-44 sm:max-w-64">
                                                {artist.name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-sonora-lavender hidden sm:table-cell">
                                        {artist.birthDate || '—'}
                                    </td>
                                    <td className="py-3 px-4 text-sonora-muted hidden md:table-cell">
                                        {getAlbumCount(artist.id)}
                                    </td>
                                    <td className="py-3 px-4 text-sonora-muted hidden md:table-cell">
                                        {getSongCount(artist)}
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <div className="inline-flex items-center justify-end gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => openEditModal(artist)}
                                                className="p-2 rounded-lg text-sonora-lavender hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                                                title={t('admin.common.edit')}
                                            >
                                                <Edit2 size={15} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setDeletingTarget(artist)}
                                                className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/15 transition-colors cursor-pointer"
                                                title={t('admin.common.delete')}
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
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
                        className="w-full max-w-md rounded-3xl bg-sonora-panel border border-white/20 p-6 sm:p-7 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-xl font-extrabold text-white">
                                {modalMode === 'create'
                                    ? t('admin.artists.createTitle')
                                    : t('admin.artists.editTitle')}
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
                                    {t('admin.artists.nameLabel')}
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder={t('admin.artists.namePlaceholder')}
                                    required
                                    className="w-full px-4 py-2.5 rounded-xl bg-sonora-dark border border-white/15 text-sm text-white outline-none focus:border-sonora-light"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-sonora-lavender">
                                    {t('admin.artists.birthDateLabel')}
                                </label>
                                <input
                                    type="date"
                                    value={birthDate}
                                    onChange={(e) => setBirthDate(e.target.value)}
                                    required
                                    className="w-full px-4 py-2.5 rounded-xl bg-sonora-dark border border-white/15 text-sm text-white outline-none focus:border-sonora-light"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-sonora-lavender">
                                    {t('admin.artists.imageLabel')}
                                </label>
                                <label className="flex items-center gap-3.5 px-4 py-3 rounded-2xl border border-dashed border-white/20 hover:border-sonora-light bg-sonora-dark/60 cursor-pointer transition-colors">
                                    <MediaImage
                                        src={imagePreview}
                                        alt=""
                                        className="w-12 h-12 rounded-full overflow-hidden bg-sonora-warm/50 flex items-center justify-center shrink-0 text-sonora-light"
                                        fallback={<ImagePlus size={20} />}
                                    />
                                    <span className="text-xs sm:text-sm font-semibold text-white truncate">
                                        {imageFile
                                            ? t('admin.songs.fileSelected', { name: imageFile.name })
                                            : t('admin.artists.imageHint')}
                                    </span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </label>
                            </div>

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
