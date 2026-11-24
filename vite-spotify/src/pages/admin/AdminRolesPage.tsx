import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Plus,
    Edit2,
    Trash2,
    Shield,
    X,
    Check,
    AlertCircle,
    Info,
} from 'lucide-react'
import {
    useGetRolesQuery,
    useCreateRoleMutation,
    useUpdateRoleMutation,
    useDeleteRoleMutation,
} from '../../services/roles/rolesApi'
import type { IRole } from '../../types/IRole'
import { extractApiErrorMessage } from './adminUtils'

const SYSTEM_ROLES = ['admin', 'user']

export default function AdminRolesPage() {
    const { t } = useTranslation()

    const { data: roles = [], isLoading } = useGetRolesQuery()
    const [createRole, { isLoading: isCreating }] = useCreateRoleMutation()
    const [updateRole, { isLoading: isUpdating }] = useUpdateRoleMutation()
    const [deleteRole, { isLoading: isDeleting }] = useDeleteRoleMutation()

    const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null)
    const [editingRole, setEditingRole] = useState<IRole | null>(null)
    const [deletingTarget, setDeletingTarget] = useState<IRole | null>(null)

    const [name, setName] = useState('')
    const [formError, setFormError] = useState<string | null>(null)
    const [banner, setBanner] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

    const openCreateModal = () => {
        setEditingRole(null)
        setName('')
        setFormError(null)
        setModalMode('create')
    }

    const openEditModal = (role: IRole) => {
        setEditingRole(role)
        setName(role.name)
        setFormError(null)
        setModalMode('edit')
    }

    const closeModal = () => {
        setModalMode(null)
        setEditingRole(null)
        setFormError(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setFormError(null)
        setBanner(null)

        if (!name.trim()) {
            setFormError(t('admin.roles.validationRequired'))
            return
        }

        try {
            if (modalMode === 'create') {
                await createRole({ name: name.trim() }).unwrap()
            } else if (modalMode === 'edit' && editingRole) {
                await updateRole({ id: editingRole.id, name: name.trim() }).unwrap()
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
            await deleteRole(deletingTarget.id).unwrap()
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

    return (
        <div className="w-full flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                        {t('admin.roles.title')}
                    </h1>
                    <p className="text-sm text-sonora-muted mt-1">
                        {t('admin.roles.subtitle')}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={openCreateModal}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-sonora-light text-sonora-dark font-bold text-sm hover:opacity-90 transition-opacity cursor-pointer shrink-0"
                >
                    <Plus size={18} />
                    {t('admin.roles.addBtn')}
                </button>
            </div>

            <div className="flex items-start gap-3 px-4 py-3 rounded-2xl bg-yellow-500/10 border border-yellow-500/25 text-xs sm:text-sm text-yellow-400">
                <Info size={18} className="shrink-0 mt-0.5" />
                <span>{t('admin.roles.systemWarning')}</span>
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

            {isLoading ? (
                <p className="text-sm text-sonora-muted py-12 text-center animate-pulse">
                    {t('admin.common.loading')}
                </p>
            ) : roles.length === 0 ? (
                <p className="text-sm text-sonora-muted py-12 text-center">
                    {t('admin.common.empty')}
                </p>
            ) : (
                <div className="w-full overflow-x-auto rounded-2xl border border-white/10 bg-sonora-dark/50">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-sonora-muted">
                                <th className="py-3.5 px-4 font-bold w-16">{t('admin.common.id')}</th>
                                <th className="py-3.5 px-4 font-bold">{t('admin.roles.colName')}</th>
                                <th className="py-3.5 px-4 font-bold">{t('admin.roles.colType')}</th>
                                <th className="py-3.5 px-4 font-bold text-right w-28">
                                    {t('admin.common.actions')}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                            {roles.map((role) => {
                                const isSystem = SYSTEM_ROLES.includes(role.name.toLowerCase())
                                return (
                                    <tr key={role.id} className="hover:bg-white/5 transition-colors">
                                        <td className="py-3 px-4 font-mono text-xs text-sonora-muted">
                                            #{role.id}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2.5">
                                                <Shield
                                                    size={16}
                                                    className={
                                                        isSystem
                                                            ? 'text-sonora-light'
                                                            : 'text-sonora-muted'
                                                    }
                                                />
                                                <span className="font-bold text-white">
                                                    {role.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span
                                                className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                                                    isSystem
                                                        ? 'bg-sonora-light/15 text-sonora-light border-sonora-light/30'
                                                        : 'bg-white/5 text-sonora-lavender border-white/10'
                                                }`}
                                            >
                                                {isSystem
                                                    ? t('admin.roles.systemRole')
                                                    : t('admin.roles.customRole')}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="inline-flex items-center justify-end gap-1.5">
                                                <button
                                                    type="button"
                                                    disabled={isSystem}
                                                    onClick={() => openEditModal(role)}
                                                    className="p-2 rounded-lg text-sonora-lavender hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                                    title={t('admin.common.edit')}
                                                >
                                                    <Edit2 size={15} />
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={isSystem}
                                                    onClick={() => setDeletingTarget(role)}
                                                    className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/15 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
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
                        className="w-full max-w-md rounded-3xl bg-sonora-panel border border-white/20 p-6 sm:p-7 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-xl font-extrabold text-white">
                                {modalMode === 'create'
                                    ? t('admin.roles.createTitle')
                                    : t('admin.roles.editTitle')}
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
                                    {t('admin.roles.nameLabel')}
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder={t('admin.roles.namePlaceholder')}
                                    required
                                    className="w-full px-4 py-2.5 rounded-xl bg-sonora-dark border border-white/15 text-sm text-white outline-none focus:border-sonora-light"
                                />
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
