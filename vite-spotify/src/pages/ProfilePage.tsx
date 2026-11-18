import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useGetProfileQuery, useUpdateProfileMutation } from '../services/auth/authApi'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { logout, selectCurrentUser, selectIsAuthenticated } from '../store/slices/authSlice'
import { User, Mail, Shield, Camera, Check, AlertCircle, Edit2, X, ArrowLeft, Calendar, LogOut } from 'lucide-react'
import { Navigate, useNavigate } from 'react-router-dom'

const GENDER_LABELS: Record<string, string> = {
    MALE: 'Чоловік',
    FEMALE: 'Жінка',
    NONEBINARY: 'Небінарна',
    OTHER: 'Інше',
    UNDISCLOSED: 'Не вказано',
}

export default function ProfilePage() {
    const { t } = useTranslation()
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const isAuthenticated = useAppSelector(selectIsAuthenticated)
    const currentUser = useAppSelector(selectCurrentUser)

    const { data: profile, isLoading: isProfileLoading } = useGetProfileQuery(undefined, {
        refetchOnMountOrArgChange: true,
        skip: !isAuthenticated,
    })
    const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation()

    const displayUser = {
        username: profile?.username || currentUser?.username || '',
        fullName: currentUser?.fullName || profile?.username || currentUser?.username || '',
        email: profile?.email || currentUser?.email || '',
        birthDate: currentUser?.birthDate || '',
        gender: currentUser?.gender || '',
        image: profile?.image ?? currentUser?.image ?? null,
        roles: profile?.roles?.length ? profile.roles : (currentUser?.roles ?? ['USER']),
    }

    const [isEditing, setIsEditing] = useState(false)
    const [username, setUsername] = useState(displayUser.username)
    const [email, setEmail] = useState(displayUser.email)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

    useEffect(() => {
        setUsername(profile?.username || currentUser?.username || '')
        setEmail(profile?.email || currentUser?.email || '')
    }, [profile, currentUser])

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setImageFile(file)
        }
    }

    const handleCancel = () => {
        setUsername(displayUser.username)
        setEmail(displayUser.email)
        setImageFile(null)
        setMsg(null)
        setIsEditing(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setMsg(null)

        const formData = new FormData()
        if (username.trim()) formData.append('username', username.trim())
        if (email.trim()) formData.append('email', email.trim())
        if (imageFile) formData.append('image', imageFile)

        try {
            await updateProfile(formData).unwrap()
            setMsg({
                text: t('profile.updatedSuccess'),
                type: 'success',
            })
            setTimeout(() => {
                dispatch(logout())
                navigate('/login')
            }, 2000)
        } catch (err: unknown) {
            const errorMsg = (err as { data?: { error?: string } })?.data?.error
            setMsg({ text: errorMsg ?? t('profile.updateError'), type: 'error' })
        }
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    if (isProfileLoading && !currentUser)
        return (
            <div className="flex items-center justify-center h-48">
                <p className="animate-pulse text-sm text-sonora-muted">{t('profile.loading')}</p>
            </div>
        )

    return (
        <div className="max-w-xl mx-auto pb-10 select-none px-2">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-xs font-bold mb-6 opacity-80 hover:opacity-100 transition-all cursor-pointer text-white"
            >
                <ArrowLeft size={16} /> {t('profile.back')}
            </button>

            {!isEditing ? (
                <div className="flex flex-col items-center text-center gap-5 p-8 rounded-2xl border border-white/5 shadow-md">
                    <div className="w-28 h-28 relative">
                        <div className="w-full h-full rounded-full flex items-center justify-center text-4xl font-black text-white bg-sonora-light">
                            {(displayUser.fullName || displayUser.username || '?')[0]?.toUpperCase() ?? '?'}
                        </div>
                    </div>

                    <div>
                        <p className="text-xs font-black uppercase tracking-widest opacity-50 mb-1 text-white">{t('profile.badge')}</p>
                        <h1 className="text-3xl font-black tracking-tight text-white">
                            {displayUser.fullName || displayUser.username}
                        </h1>
                        {displayUser.username && displayUser.fullName && displayUser.fullName !== displayUser.username && (
                            <p className="text-xs mt-0.5 opacity-60 text-sonora-lavender">
                                @{displayUser.username}
                            </p>
                        )}
                        <p className="text-sm mt-1 opacity-70 flex items-center justify-center gap-1.5 text-sonora-lavender">
                            <Mail size={14} /> {displayUser.email}
                        </p>
                        {(displayUser.birthDate || displayUser.gender) && (
                            <p className="text-xs mt-2 opacity-70 flex items-center justify-center gap-3 text-sonora-lavender">
                                {displayUser.birthDate && (
                                    <span className="inline-flex items-center gap-1">
                                        <Calendar size={12} /> {displayUser.birthDate}
                                    </span>
                                )}
                                {displayUser.gender && (
                                    <span>
                                        {t('profile.genderLabel', {
                                            gender: t(`profile.genders.${displayUser.gender}`, {
                                                defaultValue: GENDER_LABELS[displayUser.gender] ?? displayUser.gender,
                                            }),
                                        })}
                                    </span>
                                )}
                            </p>
                        )}
                    </div>

                    <div className="flex gap-1.5 flex-wrap justify-center mt-1">
                        {displayUser.roles.map((role) => (
                            <span
                                key={role}
                                className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold bg-white/5 border border-white/10 opacity-80 text-sonora-lavender"
                            >
                                <Shield size={10} className="text-sonora-light" />
                                {role.replace('ROLE_', '')}
                            </span>
                        ))}
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-6 py-2.5 rounded-full font-bold text-xs tracking-wide transition-all hover:scale-105 active:scale-95 flex items-center gap-2 border border-white/15 text-white hover:bg-white/5 cursor-pointer"
                        >
                            <Edit2 size={12} /> {t('profile.editProfile')}
                        </button>

                        <button
                            onClick={() => {
                                dispatch(logout())
                                navigate('/')
                            }}
                            className="px-6 py-2.5 rounded-full font-bold text-xs tracking-wide transition-all hover:scale-105 active:scale-95 flex items-center gap-2 border border-red-500/40 text-red-500 hover:bg-red-500/10 cursor-pointer"
                        >
                            <LogOut size={12} /> {t('profile.logOut')}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="p-6 rounded-2xl border border-white/5 shadow-md">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-black tracking-tight text-white">
                            {t('profile.editTitle')}
                        </h2>
                        <button
                            onClick={handleCancel}
                            className="p-1 rounded-full hover:bg-white/10 opacity-70 hover:opacity-100 transition-all cursor-pointer"
                        >
                            <X size={18} className="text-white" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <div className="flex flex-col items-center gap-2 mb-2">
                            <div className="relative group w-24 h-24">
                                <div className="w-full h-full rounded-full flex items-center justify-center text-3xl font-black text-white bg-sonora-light brightness-90 group-hover:brightness-75 transition-all">
                                    {(displayUser.fullName || username)?.[0]?.toUpperCase() ?? '?'}
                                </div>
                                <label className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                                    <Camera size={18} className="text-white" />
                                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                </label>
                            </div>
                            <p className="text-xs opacity-40 text-white">{t('profile.changePhotoHint')}</p>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider opacity-75 text-white">
                                {t('profile.usernameLabel')}
                            </label>
                            <div className="relative">
                                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40 text-white" />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-white/15 outline-none text-sm transition-all bg-sonora-dark text-white"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider opacity-75 text-white">
                                {t('profile.emailLabel')}
                            </label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40 text-white" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-white/15 outline-none text-sm transition-all bg-sonora-dark text-white"
                                />
                            </div>
                        </div>

                        <div className="text-xs px-4 py-3 rounded-xl border border-yellow-500/20 bg-yellow-500/10 text-yellow-600">
                            {t('profile.sessionWarning')}
                        </div>

                        {msg && (
                            <div
                                className={`text-xs px-4 py-3 rounded-xl flex items-center gap-2.5 border font-medium ${
                                    msg.type === 'success'
                                        ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                        : 'bg-red-500/10 text-red-500 border-red-500/20'
                                }`}
                            >
                                {msg.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                                {msg.text}
                            </div>
                        )}

                        <div className="flex gap-3 mt-1">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="flex-1 py-2.5 rounded-full font-bold text-xs tracking-wide transition-all border border-white/15 text-white hover:bg-white/5 cursor-pointer"
                            >
                                {t('profile.cancel')}
                            </button>
                            <button
                                type="submit"
                                disabled={isUpdating}
                                className="flex-1 py-2.5 rounded-full font-bold text-xs tracking-wide transition-all disabled:opacity-50 flex items-center justify-center cursor-pointer bg-sonora-light text-black"
                            >
                                {isUpdating ? t('profile.saving') : t('profile.save')}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    )
}
