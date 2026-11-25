import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
    Plus,
    Search,
    Shield,
    Ban,
    CheckCircle2,
    Trash2,
    X,
    Check,
    AlertCircle,
    Users,
    UserCheck,
    UserX,
    Info,
} from 'lucide-react'
import {
    useGetAdminUsersQuery,
    useCreateAdminUserMutation,
    useUpdateAdminUserRolesMutation,
    useSetAdminUserBlockedMutation,
    useDeleteAdminUserMutation,
} from '../../services/users/adminUsersApi'
import { useGetRolesQuery } from '../../services/roles/rolesApi'
import { useGetProfileQuery } from '../../services/auth/authApi'
import { useAppSelector } from '../../store/hooks'
import { selectCurrentUser } from '../../store/slices/authSlice'
import type { IAdminUser, UserGender } from '../../types/IAdminUser'
import MediaImage from '../../components/MediaImage'
import { extractApiErrorMessage } from './adminUtils'

type UserFilterMode = 'all' | 'active' | 'blocked' | 'admins'

const GENDERS: UserGender[] = ['UNDISCLOSED', 'MALE', 'FEMALE', 'NONEBINARY', 'OTHER']

function resolveUserAvatarSrc(image: string | null): string | null {
    if (!image || !image.trim()) return null
    const trimmed = image.trim()
    if (trimmed.startsWith('/') || trimmed.startsWith('http')) {
        return trimmed
    }
    return `/uploads/small/${trimmed}`
}

function isAdminRoleName(role: string): boolean {
    return role.toLowerCase().includes('admin')
}

export default function AdminUsersPage() {
    const { t } = useTranslation()
    const [searchParams, setSearchParams] = useSearchParams()
    const currentUser = useAppSelector(selectCurrentUser)
    const { data: profile } = useGetProfileQuery()

    const { data: users = [], isLoading } = useGetAdminUsersQuery()
    const { data: allRoles = [] } = useGetRolesQuery()

    const [createAdminUser, { isLoading: isCreating }] = useCreateAdminUserMutation()
    const [updateAdminUserRoles, { isLoading: isUpdatingRoles }] =
        useUpdateAdminUserRolesMutation()
    const [setAdminUserBlocked, { isLoading: isTogglingBlock }] =
        useSetAdminUserBlockedMutation()
    const [deleteAdminUser, { isLoading: isDeleting }] = useDeleteAdminUserMutation()

    const [search, setSearch] = useState('')
    const [filterMode, setFilterMode] = useState<UserFilterMode>('all')
    const [banner, setBanner] = useState<{ text: string; type: 'success' | 'error' } | null>(
        null
    )

    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [email, setEmail] = useState('')
    const [username, setUsername] = useState('')
    const [fullName, setFullName] = useState('')
    const [password, setPassword] = useState('')
    const [birthDate, setBirthDate] = useState('2000-01-01')
    const [gender, setGender] = useState<UserGender>('UNDISCLOSED')
    const [createRoles, setCreateRoles] = useState<string[]>([])
    const [createBlocked, setCreateBlocked] = useState(false)
    const [createError, setCreateError] = useState<string | null>(null)

    const [rolesTarget, setRolesTarget] = useState<IAdminUser | null>(null)
    const [editingRoles, setEditingRoles] = useState<string[]>([])
    const [rolesError, setRolesError] = useState<string | null>(null)

    const [deletingTarget, setDeletingTarget] = useState<IAdminUser | null>(null)

    const availableRoleNames = useMemo(
        () =>
            allRoles.length > 0
                ? allRoles.map((r) => r.name)
                : ['user', 'admin'],
        [allRoles]
    )

    const getDefaultUserRole = useCallback(() => {
        const foundUser = availableRoleNames.find(
            (r) => r.toLowerCase() === 'user' || r.toLowerCase() === 'role_user'
        )
        return foundUser ?? availableRoleNames[0] ?? 'user'
    }, [availableRoleNames])

    const openCreateModal = useCallback(() => {
        setEmail('')
        setUsername('')
        setFullName('')
        setPassword('')
        setBirthDate('2000-01-01')
        setGender('UNDISCLOSED')
        setCreateRoles([getDefaultUserRole()])
        setCreateBlocked(false)
        setCreateError(null)
        setIsCreateOpen(true)
    }, [getDefaultUserRole])

    useEffect(() => {
        if (searchParams.get('create') === '1') {
            openCreateModal()
            setSearchParams({}, { replace: true })
        }
    }, [searchParams, setSearchParams, openCreateModal])

    const currentAdminEmail = (profile?.email || currentUser?.email || '').toLowerCase()
    const currentAdminUsername = (
        profile?.username ||
        currentUser?.username ||
        ''
    ).toLowerCase()

    const isSelfUser = (u: IAdminUser): boolean => {
        if (currentAdminEmail && u.email.toLowerCase() === currentAdminEmail) {
            return true
        }
        if (currentAdminUsername && u.username.toLowerCase() === currentAdminUsername) {
            return true
        }
        return false
    }

    const toggleRoleInList = (
        list: string[],
        roleName: string,
        preventRemovingAdmin = false
    ): string[] => {
        if (list.includes(roleName)) {
            if (preventRemovingAdmin && isAdminRoleName(roleName)) {
                const otherAdmins = list.filter(
                    (r) => r !== roleName && isAdminRoleName(r)
                )
                if (otherAdmins.length === 0) {
                    return list
                }
            }
            return list.filter((r) => r !== roleName)
        }
        return [...list, roleName]
    }

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setCreateError(null)
        setBanner(null)

        if (
            !email.trim() ||
            !username.trim() ||
            !password.trim() ||
            createRoles.length === 0
        ) {
            setCreateError(t('admin.users.validationCreate'))
            return
        }

        try {
            await createAdminUser({
                email: email.trim(),
                username: username.trim(),
                fullName: fullName.trim() || username.trim(),
                birthDate,
                gender,
                password,
                roles: createRoles,
                blocked: createBlocked,
            }).unwrap()
            setBanner({ text: t('admin.common.successSaved'), type: 'success' })
            setIsCreateOpen(false)
        } catch (err) {
            setCreateError(extractApiErrorMessage(err, t('admin.common.errorGeneric')))
        }
    }

    const openRolesModal = (target: IAdminUser) => {
        setRolesTarget(target)
        setEditingRoles(target.roles.length > 0 ? [...target.roles] : [getDefaultUserRole()])
        setRolesError(null)
    }

    const handleRolesSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!rolesTarget) return
        setRolesError(null)
        setBanner(null)

        if (editingRoles.length === 0) {
            setRolesError(t('admin.users.validationRoles'))
            return
        }

        try {
            await updateAdminUserRoles({
                id: rolesTarget.id,
                roles: editingRoles,
            }).unwrap()
            setBanner({ text: t('admin.users.successRolesUpdated'), type: 'success' })
            setRolesTarget(null)
        } catch (err) {
            setRolesError(extractApiErrorMessage(err, t('admin.common.errorGeneric')))
        }
    }

    const handleToggleBlock = async (target: IAdminUser) => {
        if (isSelfUser(target)) return
        setBanner(null)
        const nextBlocked = !target.blocked
        try {
            await setAdminUserBlocked({
                id: target.id,
                blocked: nextBlocked,
            }).unwrap()
            setBanner({
                text: nextBlocked
                    ? t('admin.users.successBlocked')
                    : t('admin.users.successUnblocked'),
                type: 'success',
            })
        } catch (err) {
            setBanner({
                text: extractApiErrorMessage(err, t('admin.common.errorGeneric')),
                type: 'error',
            })
        }
    }

    const handleConfirmDelete = async () => {
        if (!deletingTarget) return
        setBanner(null)
        try {
            await deleteAdminUser(deletingTarget.id).unwrap()
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

    const totalActive = users.filter((u) => !u.blocked).length
    const totalBlocked = users.filter((u) => u.blocked).length
    const totalAdmins = users.filter((u) => u.roles.some(isAdminRoleName)).length

    const q = search.trim().toLowerCase()
    const filteredUsers = users
        .filter((u) => {
            if (filterMode === 'active' && u.blocked) return false
            if (filterMode === 'blocked' && !u.blocked) return false
            if (filterMode === 'admins' && !u.roles.some(isAdminRoleName)) return false
            if (!q) return true
            return (
                u.email.toLowerCase().includes(q) ||
                u.username.toLowerCase().includes(q) ||
                (u.fullName ?? '').toLowerCase().includes(q) ||
                u.roles.some((r) => r.toLowerCase().includes(q))
            )
        })
        .sort((a, b) => a.id - b.id)

    const formatCreatedDate = (iso: string | null): string => {
        if (!iso) return '—'
        const parsed = new Date(iso)
        if (Number.isNaN(parsed.getTime())) return iso.slice(0, 10)
        return parsed.toLocaleDateString()
    }

    const summaryCards = [
        {
            label: t('admin.users.totalUsers'),
            value: users.length,
            icon: Users,
            accent: 'text-sonora-light bg-sonora-warm/60',
        },
        {
            label: t('admin.users.activeUsers'),
            value: totalActive,
            icon: UserCheck,
            accent: 'text-emerald-400 bg-emerald-500/15',
        },
        {
            label: t('admin.users.blockedUsers'),
            value: totalBlocked,
            icon: UserX,
            accent: 'text-red-400 bg-red-500/15',
        },
        {
            label: t('admin.users.adminsCount'),
            value: totalAdmins,
            icon: Shield,
            accent: 'text-sonora-pink bg-sonora-pink/15',
        },
    ]

    const filterButtons: Array<{ key: UserFilterMode; label: string }> = [
        { key: 'all', label: t('admin.users.filterAll') },
        { key: 'active', label: t('admin.users.filterActive') },
        { key: 'blocked', label: t('admin.users.filterBlocked') },
        { key: 'admins', label: t('admin.users.filterAdmins') },
    ]

    return (
        <div className="w-full flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                        {t('admin.users.title')}
                    </h1>
                    <p className="text-sm text-sonora-muted mt-1">
                        {t('admin.users.subtitle')}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={openCreateModal}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-sonora-light text-sonora-dark font-bold text-sm hover:opacity-90 transition-opacity cursor-pointer shrink-0"
                >
                    <Plus size={18} />
                    {t('admin.users.addBtn')}
                </button>
            </div>

            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3.5">
                {summaryCards.map(({ label, value, icon: Icon, accent }) => (
                    <div
                        key={label}
                        className="px-4 py-3.5 rounded-2xl bg-sonora-dark/60 border border-white/10 flex items-center gap-3.5"
                    >
                        <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${accent}`}
                        >
                            <Icon size={19} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-sonora-muted truncate">{label}</p>
                            <p className="text-xl font-black text-white">
                                {isLoading ? '…' : value}
                            </p>
                        </div>
                    </div>
                ))}
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
                        {banner.type === 'success' ? (
                            <Check size={16} />
                        ) : (
                            <AlertCircle size={16} />
                        )}
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

                <div className="inline-flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-sonora-dark border border-white/10 self-start lg:self-auto">
                    {filterButtons.map((btn) => (
                        <button
                            key={btn.key}
                            type="button"
                            onClick={() => setFilterMode(btn.key)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                                filterMode === btn.key
                                    ? 'bg-sonora-light text-sonora-dark'
                                    : 'text-sonora-lavender hover:text-white'
                            }`}
                        >
                            {btn.label}
                        </button>
                    ))}
                </div>
            </div>

            {isLoading ? (
                <p className="text-sm text-sonora-muted py-12 text-center animate-pulse">
                    {t('admin.common.loading')}
                </p>
            ) : filteredUsers.length === 0 ? (
                <p className="text-sm text-sonora-muted py-12 text-center">
                    {t('admin.common.empty')}
                </p>
            ) : (
                <div className="w-full overflow-x-auto rounded-2xl border border-white/10 bg-sonora-dark/50">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-sonora-muted">
                                <th className="py-3.5 px-4 font-bold w-16">{t('admin.common.id')}</th>
                                <th className="py-3.5 px-4 font-bold">{t('admin.users.colUser')}</th>
                                <th className="py-3.5 px-4 font-bold hidden md:table-cell">
                                    {t('admin.users.colEmail')}
                                </th>
                                <th className="py-3.5 px-4 font-bold">{t('admin.users.colRoles')}</th>
                                <th className="py-3.5 px-4 font-bold">{t('admin.users.colStatus')}</th>
                                <th className="py-3.5 px-4 font-bold hidden xl:table-cell">
                                    {t('admin.users.colCreated')}
                                </th>
                                <th className="py-3.5 px-4 font-bold text-right w-36">
                                    {t('admin.common.actions')}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                            {filteredUsers.map((u) => {
                                const self = isSelfUser(u)
                                const initial = (u.fullName || u.username || u.email || '?')
                                    .charAt(0)
                                    .toUpperCase()
                                return (
                                    <tr
                                        key={u.id}
                                        className={`transition-colors ${
                                            u.blocked
                                                ? 'bg-red-500/5 hover:bg-red-500/10'
                                                : 'hover:bg-white/5'
                                        }`}
                                    >
                                        <td className="py-3 px-4 font-mono text-xs text-sonora-muted">
                                            #{u.id}
                                        </td>

                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <MediaImage
                                                    src={resolveUserAvatarSrc(u.image)}
                                                    alt={u.username}
                                                    className="w-10 h-10 rounded-full overflow-hidden bg-linear-to-br from-sonora-purple to-sonora-pink flex items-center justify-center shrink-0 font-bold text-sm text-white"
                                                    fallback={<span>{initial}</span>}
                                                />
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-semibold text-white truncate max-w-40 sm:max-w-56">
                                                            {u.fullName || u.username}
                                                        </p>
                                                        {self && (
                                                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-sonora-light/20 text-sonora-light border border-sonora-light/30 shrink-0">
                                                                {t('admin.users.youBadge')}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-sonora-muted truncate max-w-44 sm:max-w-60">
                                                        @{u.username}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="py-3 px-4 text-sonora-lavender hidden md:table-cell truncate max-w-56">
                                            {u.email}
                                        </td>

                                        <td className="py-3 px-4">
                                            <div className="flex flex-wrap gap-1.5">
                                                {u.roles.map((role) => (
                                                    <span
                                                        key={role}
                                                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                                                            isAdminRoleName(role)
                                                                ? 'bg-sonora-light/20 text-sonora-light border-sonora-light/35'
                                                                : 'bg-sonora-panel text-sonora-lavender border-white/10'
                                                        }`}
                                                    >
                                                        {isAdminRoleName(role) && <Shield size={11} />}
                                                        {role}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>

                                        <td className="py-3 px-4">
                                            {u.blocked ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/15 text-red-400 border border-red-500/30 whitespace-nowrap">
                                                    <Ban size={12} />
                                                    {t('admin.users.statusBlocked')}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 whitespace-nowrap">
                                                    <CheckCircle2 size={12} />
                                                    {t('admin.users.statusActive')}
                                                </span>
                                            )}
                                        </td>

                                        <td className="py-3 px-4 text-xs text-sonora-muted hidden xl:table-cell whitespace-nowrap">
                                            {formatCreatedDate(u.createdAt)}
                                        </td>

                                        <td className="py-3 px-4 text-right">
                                            <div className="inline-flex items-center justify-end gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => openRolesModal(u)}
                                                    className="p-2 rounded-lg text-sonora-lavender hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                                                    title={t('admin.users.editRolesAction')}
                                                >
                                                    <Shield size={15} />
                                                </button>

                                                <button
                                                    type="button"
                                                    disabled={self || isTogglingBlock}
                                                    onClick={() => handleToggleBlock(u)}
                                                    className={`p-2 rounded-lg transition-colors ${
                                                        self
                                                            ? 'opacity-30 cursor-not-allowed text-sonora-muted'
                                                            : u.blocked
                                                            ? 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/15 cursor-pointer'
                                                            : 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/15 cursor-pointer'
                                                    }`}
                                                    title={
                                                        self
                                                            ? t('admin.users.selfProtectHint')
                                                            : u.blocked
                                                            ? t('admin.users.unblockAction')
                                                            : t('admin.users.blockAction')
                                                    }
                                                >
                                                    {u.blocked ? (
                                                        <CheckCircle2 size={15} />
                                                    ) : (
                                                        <Ban size={15} />
                                                    )}
                                                </button>

                                                <button
                                                    type="button"
                                                    disabled={self}
                                                    onClick={() => setDeletingTarget(u)}
                                                    className={`p-2 rounded-lg transition-colors ${
                                                        self
                                                            ? 'opacity-30 cursor-not-allowed text-sonora-muted'
                                                            : 'text-red-400 hover:text-red-300 hover:bg-red-500/15 cursor-pointer'
                                                    }`}
                                                    title={
                                                        self
                                                            ? t('admin.users.selfProtectHint')
                                                            : t('admin.common.delete')
                                                    }
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

            <div className="flex items-start gap-2.5 px-4 py-3 rounded-2xl bg-sonora-dark/45 border border-white/10 text-xs text-sonora-muted">
                <Info size={16} className="text-sonora-light shrink-0 mt-0.5" />
                <span>{t('admin.users.selfProtectHint')}</span>
            </div>

            {isCreateOpen && (
                <div
                    className="fixed inset-0 z-50 bg-sonora-deep/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
                    onClick={() => setIsCreateOpen(false)}
                >
                    <div
                        className="w-full max-w-lg rounded-3xl bg-sonora-panel border border-white/20 p-6 sm:p-7 shadow-2xl my-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-xl font-extrabold text-white">
                                {t('admin.users.createTitle')}
                            </h2>
                            <button
                                type="button"
                                onClick={() => setIsCreateOpen(false)}
                                className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-sonora-lavender">
                                        {t('admin.users.emailLabel')}
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder={t('admin.users.emailPlaceholder')}
                                        required
                                        className="w-full px-4 py-2.5 rounded-xl bg-sonora-dark border border-white/15 text-sm text-white outline-none focus:border-sonora-light"
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-sonora-lavender">
                                        {t('admin.users.usernameLabel')}
                                    </label>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder={t('admin.users.usernamePlaceholder')}
                                        required
                                        className="w-full px-4 py-2.5 rounded-xl bg-sonora-dark border border-white/15 text-sm text-white outline-none focus:border-sonora-light"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-sonora-lavender">
                                        {t('admin.users.fullNameLabel')}
                                    </label>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder={t('admin.users.fullNamePlaceholder')}
                                        className="w-full px-4 py-2.5 rounded-xl bg-sonora-dark border border-white/15 text-sm text-white outline-none focus:border-sonora-light"
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-sonora-lavender">
                                        {t('admin.users.passwordLabel')}
                                    </label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder={t('admin.users.passwordPlaceholder')}
                                        required
                                        className="w-full px-4 py-2.5 rounded-xl bg-sonora-dark border border-white/15 text-sm text-white outline-none focus:border-sonora-light"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-sonora-lavender">
                                        {t('admin.users.birthDateLabel')}
                                    </label>
                                    <input
                                        type="date"
                                        value={birthDate}
                                        onChange={(e) => setBirthDate(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl bg-sonora-dark border border-white/15 text-sm text-white outline-none focus:border-sonora-light"
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-sonora-lavender">
                                        {t('admin.users.genderLabel')}
                                    </label>
                                    <select
                                        value={gender}
                                        onChange={(e) => setGender(e.target.value as UserGender)}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-sonora-dark border border-white/15 text-sm text-white outline-none focus:border-sonora-light cursor-pointer"
                                    >
                                        {GENDERS.map((g) => (
                                            <option key={g} value={g} className="bg-sonora-dark text-white">
                                                {t(`profile.genders.${g}`, { defaultValue: g })}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-sonora-lavender">
                                    {t('admin.users.rolesLabel')}
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {availableRoleNames.map((roleName) => {
                                        const selected = createRoles.includes(roleName)
                                        return (
                                            <button
                                                key={roleName}
                                                type="button"
                                                onClick={() =>
                                                    setCreateRoles((prev) =>
                                                        toggleRoleInList(prev, roleName, false)
                                                    )
                                                }
                                                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer border ${
                                                    selected
                                                        ? 'bg-sonora-light text-sonora-dark border-sonora-light'
                                                        : 'bg-sonora-dark text-sonora-lavender border-white/15 hover:border-white/40'
                                                }`}
                                            >
                                                {roleName}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            <label className="inline-flex items-center gap-2.5 text-xs sm:text-sm text-sonora-lavender cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={createBlocked}
                                    onChange={(e) => setCreateBlocked(e.target.checked)}
                                    className="w-4 h-4 rounded accent-sonora-light cursor-pointer"
                                />
                                <span>{t('admin.users.blockedInitialLabel')}</span>
                            </label>

                            {createError && (
                                <div className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs font-semibold text-red-400">
                                    {createError}
                                </div>
                            )}

                            <div className="flex items-center justify-end gap-3 mt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateOpen(false)}
                                    className="px-5 py-2.5 rounded-full border border-white/20 text-xs sm:text-sm font-bold text-white hover:bg-white/10 transition-colors cursor-pointer"
                                >
                                    {t('admin.common.cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreating}
                                    className="px-6 py-2.5 rounded-full bg-sonora-light text-sonora-dark text-xs sm:text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer"
                                >
                                    {isCreating ? t('admin.common.saving') : t('admin.common.create')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {rolesTarget && (
                <div
                    className="fixed inset-0 z-50 bg-sonora-deep/80 backdrop-blur-xs flex items-center justify-center p-4"
                    onClick={() => setRolesTarget(null)}
                >
                    <div
                        className="w-full max-w-md rounded-3xl bg-sonora-panel border border-white/20 p-6 sm:p-7 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg sm:text-xl font-extrabold text-white truncate pr-2">
                                {t('admin.users.rolesModalTitle', {
                                    name: rolesTarget.fullName || rolesTarget.username,
                                })}
                            </h2>
                            <button
                                type="button"
                                onClick={() => setRolesTarget(null)}
                                className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 cursor-pointer shrink-0"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleRolesSubmit} className="flex flex-col gap-5">
                            <div className="flex flex-wrap gap-2">
                                {availableRoleNames.map((roleName) => {
                                    const selected = editingRoles.includes(roleName)
                                    const selfLockedAdmin =
                                        isSelfUser(rolesTarget) &&
                                        isAdminRoleName(roleName) &&
                                        selected
                                    return (
                                        <button
                                            key={roleName}
                                            type="button"
                                            disabled={selfLockedAdmin}
                                            onClick={() =>
                                                setEditingRoles((prev) =>
                                                    toggleRoleInList(
                                                        prev,
                                                        roleName,
                                                        isSelfUser(rolesTarget)
                                                    )
                                                )
                                            }
                                            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-colors border ${
                                                selected
                                                    ? 'bg-sonora-light text-sonora-dark border-sonora-light'
                                                    : 'bg-sonora-dark text-sonora-lavender border-white/15 hover:border-white/40'
                                            } ${
                                                selfLockedAdmin
                                                    ? 'opacity-65 cursor-not-allowed'
                                                    : 'cursor-pointer'
                                            }`}
                                        >
                                            {isAdminRoleName(roleName) && <Shield size={13} />}
                                            {roleName}
                                        </button>
                                    )
                                })}
                            </div>

                            {isSelfUser(rolesTarget) && (
                                <p className="text-xs text-sonora-muted">
                                    {t('admin.users.selfProtectHint')}
                                </p>
                            )}

                            {rolesError && (
                                <div className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs font-semibold text-red-400">
                                    {rolesError}
                                </div>
                            )}

                            <div className="flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setRolesTarget(null)}
                                    className="px-5 py-2.5 rounded-full border border-white/20 text-xs sm:text-sm font-bold text-white hover:bg-white/10 transition-colors cursor-pointer"
                                >
                                    {t('admin.common.cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUpdatingRoles}
                                    className="px-6 py-2.5 rounded-full bg-sonora-light text-sonora-dark text-xs sm:text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer"
                                >
                                    {isUpdatingRoles
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
                            {t('admin.common.confirmDeleteDesc', {
                                name: `${deletingTarget.username} (${deletingTarget.email})`,
                            })}
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
                                {isDeleting
                                    ? t('admin.common.deleting')
                                    : t('admin.common.delete')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
