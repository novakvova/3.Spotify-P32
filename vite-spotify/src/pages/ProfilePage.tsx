import React, { useState, useEffect } from 'react'
import { useGetProfileQuery, useUpdateProfileMutation } from '../services/auth/authApi'
import { useAppDispatch } from '../store/hooks'
import { logout } from '../store/slices/authSlice'
import { User, Mail, Shield, Camera, Check, AlertCircle, Edit2, X, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function hasCustomAvatar(image: string | null | undefined): boolean {
    return !!image && !image.includes('default.jpg')
}

export default function ProfilePage() {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()

    const { data: profile, isLoading: isProfileLoading } = useGetProfileQuery(undefined, {
        refetchOnMountOrArgChange: true,
        skip: !localStorage.getItem('token'),
    })
    const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation()

    const [isEditing, setIsEditing] = useState(false)
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

    useEffect(() => {
        if (profile) {
            setUsername(profile.username)
            setEmail(profile.email)
            setImagePreview(profile.image ?? null)
        }
    }, [profile])

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setImageFile(file)
            setImagePreview(URL.createObjectURL(file))
        }
    }

    const handleCancel = () => {
        if (profile) {
            setUsername(profile.username)
            setEmail(profile.email)
            setImagePreview(profile.image ?? null)
        }
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
                text: 'Дані оновлено! Оскільки змінився username, потрібно увійти знову. Перенаправлення...',
                type: 'success',
            })
            setTimeout(() => {
                dispatch(logout())
                navigate('/login')
            }, 2000)
        } catch (err: unknown) {
            const errorMsg = (err as { data?: { error?: string } })?.data?.error
            setMsg({ text: errorMsg ?? 'Помилка при оновленні профілю', type: 'error' })
        }
    }

    if (isProfileLoading) return (
        <div className="flex items-center justify-center h-48">
            <p className="animate-pulse text-sm" style={{ color: 'var(--text-3)' }}>Завантаження профілю...</p>
        </div>
    )

    const avatarUrl = hasCustomAvatar(imagePreview) ? imagePreview : null

    return (
        <div className="max-w-xl mx-auto pb-10 select-none px-2">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-xs font-bold mb-6 opacity-80 hover:opacity-100 transition-all"
                style={{ color: 'var(--text)' }}
            >
                <ArrowLeft size={16} /> Назад
            </button>

            {!isEditing ? (
                <div className="flex flex-col items-center text-center gap-5 bg-gradient-to-b from-white/[0.03] to-transparent p-8 rounded-2xl border border-white/5 shadow-md">
                    <div className="w-28 h-28 relative">
                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt="avatar"
                                className="w-full h-full rounded-full object-cover border-2"
                                style={{ borderColor: 'var(--border)' }}
                            />
                        ) : (
                            <div
                                className="w-full h-full rounded-full flex items-center justify-center text-4xl font-black"
                                style={{ background: 'var(--accent)', color: '#000' }}
                            >
                                {profile?.username?.[0]?.toUpperCase() ?? '?'}
                            </div>
                        )}
                    </div>

                    <div>
                        <p className="text-xs font-black uppercase tracking-widest opacity-50 mb-1">Профіль користувача</p>
                        <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--text)' }}>
                            {profile?.username}
                        </h1>
                        <p className="text-sm mt-1 opacity-70 flex items-center justify-center gap-1.5" style={{ color: 'var(--text-2)' }}>
                            <Mail size={14} /> {profile?.email}
                        </p>
                    </div>

                    <div className="flex gap-1.5 flex-wrap justify-center mt-1">
                        {profile?.roles?.map(role => (
                            <span
                                key={role}
                                className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[11px] font-bold bg-white/5 border opacity-80"
                                style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}
                            >
                                <Shield size={10} style={{ color: 'var(--accent)' }} />
                                {role.replace('ROLE_', '')}
                            </span>
                        ))}
                    </div>

                    <button
                        onClick={() => setIsEditing(true)}
                        className="mt-4 px-6 py-2.5 rounded-full font-bold text-xs tracking-wide transition-all hover:scale-105 active:scale-95 flex items-center gap-2 border hover:bg-white/5"
                        style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                    >
                        <Edit2 size={12} /> Редагувати профіль
                    </button>
                </div>
            ) : (
                <div className="bg-white/[0.01] p-6 rounded-2xl border border-white/5 shadow-md">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-black tracking-tight" style={{ color: 'var(--text)' }}>
                            Редагування даних
                        </h2>
                        <button
                            onClick={handleCancel}
                            className="p-1 rounded-full hover:bg-white/10 opacity-70 hover:opacity-100 transition-all"
                        >
                            <X size={18} style={{ color: 'var(--text)' }} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <div className="flex flex-col items-center gap-2 mb-2">
                            <div className="relative group w-24 h-24">
                                {avatarUrl ? (
                                    <img
                                        src={imageFile ? imagePreview! : avatarUrl}
                                        alt="avatar"
                                        className="w-full h-full rounded-full object-cover border-2 shadow-md brightness-75 group-hover:brightness-50 transition-all"
                                        style={{ borderColor: 'var(--border)' }}
                                    />
                                ) : (
                                    <div
                                        className="w-full h-full rounded-full flex items-center justify-center text-3xl font-black brightness-75 group-hover:brightness-50 transition-all"
                                        style={{ background: 'var(--accent)', color: '#000' }}
                                    >
                                        {username?.[0]?.toUpperCase() ?? '?'}
                                    </div>
                                )}
                                <label className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                                    <Camera size={18} className="text-white" />
                                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                </label>
                            </div>
                            <p className="text-[11px] opacity-40">Натисніть на фото для зміни</p>
                        </div>


                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider opacity-75" style={{ color: 'var(--text)' }}>
                                Ім'я користувача
                            </label>
                            <div className="relative">
                                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" style={{ color: 'var(--text)' }} />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border outline-none text-sm transition-all focus:border-[var(--accent)]"
                                    style={{ background: 'var(--bg-input)', color: 'var(--text)', borderColor: 'var(--border)' }}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider opacity-75" style={{ color: 'var(--text)' }}>
                                Електронна пошта
                            </label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" style={{ color: 'var(--text)' }} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border outline-none text-sm transition-all focus:border-[var(--accent)]"
                                    style={{ background: 'var(--bg-input)', color: 'var(--text)', borderColor: 'var(--border)' }}
                                />
                            </div>
                        </div>

                        <div
                            className="text-xs px-4 py-3 rounded-xl border"
                            style={{
                                background: 'rgba(234,179,8,0.07)',
                                borderColor: 'rgba(234,179,8,0.2)',
                                color: '#ca8a04',
                            }}
                        >
                            ⚠ Після збереження сесія завершиться — потрібно буде увійти знову.
                        </div>

                        {msg && (
                            <div
                                className="text-xs px-4 py-3 rounded-xl flex items-center gap-2.5 border font-medium"
                                style={{
                                    background: msg.type === 'success' ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
                                    color: msg.type === 'success' ? '#22c55e' : '#ef4444',
                                    borderColor: msg.type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                                }}
                            >
                                {msg.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                                {msg.text}
                            </div>
                        )}

                        <div className="flex gap-3 mt-1">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="flex-1 py-2.5 rounded-full font-bold text-xs tracking-wide transition-all border hover:bg-white/5"
                                style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                            >
                                Скасувати
                            </button>
                            <button
                                type="submit"
                                disabled={isUpdating}
                                className="flex-1 py-2.5 rounded-full font-bold text-xs tracking-wide transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center"
                                style={{ background: 'var(--accent)', color: '#000' }}
                            >
                                {isUpdating ? 'Збереження...' : 'Зберегти'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    )
}