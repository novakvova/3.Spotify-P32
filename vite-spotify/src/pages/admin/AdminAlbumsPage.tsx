import React, { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Disc,
    X,
    Check,
    AlertCircle,
    Info,
} from 'lucide-react'
import {
    useGetAlbumsQuery,
    useCreateAlbumMutation,
    useUpdateAlbumMutation,
    useDeleteAlbumMutation,
} from '../../services/albums/albumsApi'
import { useGetArtistsQuery } from '../../services/artists/artistsApi'
import { useGetAllSongsQuery } from '../../services/songs/songsApi'
import type { IAlbum } from '../../types/IAlbum'
import { extractApiErrorMessage } from './adminUtils'

export default function AdminAlbumsPage() {
    const { t } = useTranslation()
    const [searchParams, setSearchParams] = useSearchParams()

    const { data: albums = [], isLoading } = useGetAlbumsQuery()
    const { data: artists = [] } = useGetArtistsQuery()
    const { data: songs = [] } = useGetAllSongsQuery()

    const [createAlbum, { isLoading: isCreating }] = useCreateAlbumMutation()
    const [updateAlbum, { isLoading: isUpdating }] = useUpdateAlbumMutation()
    const [deleteAlbum, { isLoading: isDeleting }] = useDeleteAlbumMutation()

    const [search, setSearch] = useState('')
    const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null)
    const [editingAlbum, setEditingAlbum] = useState<IAlbum | null>(null)
    const [deletingTarget, setDeletingTarget] = useState<IAlbum | null>(null)

    const [title, setTitle] = useState('')
    const [releaseYear, setReleaseYear] = useState<string>(String(new Date().getFullYear()))
    const [artistId, setArtistId] = useState<string>('')
    const [formError, setFormError] = useState<string | null>(null)
    const [banner, setBanner] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

    const openCreateModal = useCallback(() => {
        setEditingAlbum(null)
        setTitle('')
        setReleaseYear(String(new Date().getFullYear()))
        setArtistId(artists[0] ? String(artists[0].id) : '')
        setFormError(null)
        setModalMode('create')
    }, [artists])

    useEffect(() => {
        if (searchParams.get('create') === '1') {
            openCreateModal()
            setSearchParams({}, { replace: true })
        }
    }, [searchParams, setSearchParams, openCreateModal])

    const openEditModal = (album: IAlbum) => {
        setEditingAlbum(album)
        setTitle(album.title)
        setReleaseYear(String(album.releaseYear))
        setArtistId(String(album.artistId))
        setFormError(null)
        setModalMode('edit')
    }

    const closeModal = () => {
        setModalMode(null)
        setEditingAlbum(null)
        setFormError(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setFormError(null)
        setBanner(null)

        const parsedYear = parseInt(releaseYear, 10)
        const parsedArtistId = parseInt(artistId, 10)

        if (!title.trim() || isNaN(parsedYear) || isNaN(parsedArtistId)) {
            setFormError(t('admin.albums.validationRequired'))
            return
        }

        try {
            if (modalMode === 'create') {
                await createAlbum({
                    title: title.trim(),
                    releaseYear: parsedYear,
                    artistId: parsedArtistId,
                }).unwrap()
            } else if (modalMode === 'edit' && editingAlbum) {
                await updateAlbum({
                    id: editingAlbum.id,
                    title: title.trim(),
                    releaseYear: parsedYear,
                    artistId: parsedArtistId,
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
            await deleteAlbum(deletingTarget.id).unwrap()
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

    const getArtistName = (id: number) =>
        artists.find((a) => a.id === id)?.name ?? t('catalog.unknownArtist')

    const getTrackCount = (albumTitle: string) =>
        songs.filter((s) => s.album_title?.toLowerCase() === albumTitle.toLowerCase()).length

    const q = search.trim().toLowerCase()
    const filteredAlbums = albums.filter((album) => {
        if (!q) return true
        return (
            album.title.toLowerCase().includes(q) ||
            getArtistName(album.artistId).toLowerCase().includes(q) ||
            String(album.releaseYear).includes(q)
        )
    })

    return (
        <div className="w-full flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                        {t('admin.albums.title')}
                    </h1>
                    <p className="text-sm text-sonora-muted mt-1">
                        {t('admin.albums.subtitle')}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={openCreateModal}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-sonora-light text-sonora-dark font-bold text-sm hover:opacity-90 transition-opacity cursor-pointer shrink-0"
                >
                    <Plus size={18} />
                    {t('admin.albums.addBtn')}
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
            ) : filteredAlbums.length === 0 ? (
                <p className="text-sm text-sonora-muted py-12 text-center">
                    {t('admin.common.empty')}
                </p>
            ) : (
                <div className="w-full overflow-x-auto rounded-2xl border border-white/10 bg-sonora-dark/50">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-sonora-muted">
                                <th className="py-3.5 px-4 font-bold w-16">{t('admin.common.id')}</th>
                                <th className="py-3.5 px-4 font-bold">{t('admin.albums.colTitle')}</th>
                                <th className="py-3.5 px-4 font-bold">{t('admin.albums.colArtist')}</th>
                                <th className="py-3.5 px-4 font-bold hidden sm:table-cell">
                                    {t('admin.albums.colYear')}
                                </th>
                                <th className="py-3.5 px-4 font-bold hidden md:table-cell">
                                    {t('admin.albums.colTracks')}
                                </th>
                                <th className="py-3.5 px-4 font-bold text-right w-28">
                                    {t('admin.common.actions')}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                            {filteredAlbums.map((album) => (
                                <tr key={album.id} className="hover:bg-white/5 transition-colors">
                                    <td className="py-3 px-4 font-mono text-xs text-sonora-muted">
                                        #{album.id}
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-sonora-purple to-sonora-light flex items-center justify-center shrink-0 text-white">
                                                <Disc size={15} />
                                            </div>
                                            <span className="font-semibold text-white truncate max-w-44 sm:max-w-64">
                                                {album.title}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-sonora-lavender truncate max-w-40">
                                        {getArtistName(album.artistId)}
                                    </td>
                                    <td className="py-3 px-4 text-sonora-muted hidden sm:table-cell">
                                        {album.releaseYear}
                                    </td>
                                    <td className="py-3 px-4 text-sonora-muted hidden md:table-cell">
                                        {getTrackCount(album.title)}
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <div className="inline-flex items-center justify-end gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => openEditModal(album)}
                                                className="p-2 rounded-lg text-sonora-lavender hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                                                title={t('admin.common.edit')}
                                            >
                                                <Edit2 size={15} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setDeletingTarget(album)}
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
                                    ? t('admin.albums.createTitle')
                                    : t('admin.albums.editTitle')}
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
                                    {t('admin.albums.titleLabel')}
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder={t('admin.albums.titlePlaceholder')}
                                    required
                                    className="w-full px-4 py-2.5 rounded-xl bg-sonora-dark border border-white/15 text-sm text-white outline-none focus:border-sonora-light"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-sonora-lavender">
                                        {t('admin.albums.yearLabel')}
                                    </label>
                                    <input
                                        type="number"
                                        min={1900}
                                        max={2100}
                                        value={releaseYear}
                                        onChange={(e) => setReleaseYear(e.target.value)}
                                        required
                                        className="w-full px-4 py-2.5 rounded-xl bg-sonora-dark border border-white/15 text-sm text-white outline-none focus:border-sonora-light"
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-sonora-lavender">
                                        {t('admin.albums.artistLabel')}
                                    </label>
                                    <select
                                        value={artistId}
                                        onChange={(e) => setArtistId(e.target.value)}
                                        required
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-sonora-dark border border-white/15 text-sm text-white outline-none focus:border-sonora-light cursor-pointer"
                                    >
                                        <option value="" disabled className="bg-sonora-dark text-white">
                                            {t('admin.albums.selectArtist')}
                                        </option>
                                        {artists.map((artist) => (
                                            <option
                                                key={artist.id}
                                                value={String(artist.id)}
                                                className="bg-sonora-dark text-white"
                                            >
                                                {artist.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {modalMode === 'edit' && (
                                <div className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/25 text-xs text-yellow-400">
                                    <Info size={15} className="shrink-0 mt-0.5" />
                                    <span>{t('admin.albums.backendUpdateHint')}</span>
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
                            {t('admin.common.confirmDeleteDesc', { name: deletingTarget.title })}
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
