import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { useRegisterMutation } from '../services/auth/authApi'
import { setCredentials } from '../store/slices/authSlice'
import { useAppDispatch } from '../store/hooks'

export default function RegisterPage() {
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const [register, { isLoading }] = useRegisterMutation()
    const fileRef = useRef<HTMLInputElement>(null)

    const [email, setEmail] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [image, setImage] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [error, setError] = useState('')

    const onImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) { setImage(file); setPreview(URL.createObjectURL(file)) }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (password !== confirmPassword) return setError('Паролі не співпадають')
        if (!image) return setError('Завантажте фото профілю')

        const fd = new FormData()
        fd.append('username', username)
        fd.append('email', email)
        fd.append('password', password)
        fd.append('confirmPassword', confirmPassword)
        fd.append('image', image)

        try {
            const data = await register(fd).unwrap()
            localStorage.setItem('token', data.token)
            const profileRes = await fetch('/profile', {
                headers: {
                    Authorization: `Bearer ${data.token}`,
                    'Content-Type': 'application/json',
                },
            })

            let user = { id: 0, username, email, image: username + '.jpg', roles: ['user'] }

            if (profileRes.ok) {
                user = await profileRes.json()
            }

            dispatch(setCredentials({ token: data.token, user }))
            navigate('/')
        } catch (err: unknown) {
            const msg = (err as { data?: { error?: string } })?.data?.error
            setError(msg ?? 'Помилка реєстрації')
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] px-4">
            <div
                className="w-full max-w-md rounded-xl p-6 md:p-8 border shadow-sm relative"
                style={{ background: 'var(--sidebar-bg)', borderColor: 'var(--border)' }}
            >
                <button
                    onClick={() => navigate('/')}
                    className="absolute left-4 top-4 p-2 rounded-full opacity-70 hover:opacity-100 hover:bg-white/10 transition-all"
                    style={{ color: 'var(--text)' }}
                >
                    <ArrowLeft size={20} />
                </button>

                <div className="flex flex-col items-center gap-2 mb-5 mt-2">
                    <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text)' }}>
                        Реєстрація
                    </h1>
                </div>
                
                <div className="flex justify-center mb-5">
                    <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="w-20 h-20 rounded-full overflow-hidden border-2 border-dashed flex flex-col items-center justify-center transition-all hover:opacity-80"
                        style={{ borderColor: preview ? 'transparent' : 'var(--border)' }}
                    >
                        {preview
                            ? <img src={preview} alt="avatar" className="w-full h-full object-cover" />
                            : <>
                                <span className="text-2xl" style={{ color: 'var(--text-3)' }}>+</span>
                                <span className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>Фото</span>
                            </>
                        }
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" onChange={onImage} className="hidden" />
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold tracking-wide uppercase opacity-80" style={{ color: 'var(--text)' }}>
                            Email
                        </label>
                        <input
                            type="email" value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@domain.com" required
                            className="w-full px-4 py-2.5 rounded-md border outline-none text-sm transition-all focus:border-[var(--accent)]"
                            style={{ background: 'var(--bg-input)', color: 'var(--text)', borderColor: 'var(--border)' }}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold tracking-wide uppercase opacity-80" style={{ color: 'var(--text)' }}>
                            Ім'я користувача
                        </label>
                        <input
                            type="text" value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="username" required
                            className="w-full px-4 py-2.5 rounded-md border outline-none text-sm transition-all focus:border-[var(--accent)]"
                            style={{ background: 'var(--bg-input)', color: 'var(--text)', borderColor: 'var(--border)' }}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold tracking-wide uppercase opacity-80" style={{ color: 'var(--text)' }}>
                            Пароль
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'} value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Мінімум 6 символів" required
                                className="w-full pl-4 pr-10 py-2.5 rounded-md border outline-none text-sm transition-all focus:border-[var(--accent)]"
                                style={{ background: 'var(--bg-input)', color: 'var(--text)', borderColor: 'var(--border)' }}
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100"
                                    style={{ color: 'var(--text)' }}>
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold tracking-wide uppercase opacity-80" style={{ color: 'var(--text)' }}>
                            Підтвердження пароля
                        </label>
                        <input
                            type="password" value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Повторіть пароль" required
                            className="w-full px-4 py-2.5 rounded-md border outline-none text-sm transition-all focus:border-[var(--accent)]"
                            style={{ background: 'var(--bg-input)', color: 'var(--text)', borderColor: 'var(--border)' }}
                        />
                    </div>

                    {error && (
                        <div
                            className="text-xs px-3 py-2.5 rounded-lg"
                            style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}
                        >
                            {error}
                        </div>
                    )}

                    <button
                        type="submit" disabled={isLoading}
                        className="w-full py-3 mt-1 rounded-full font-bold text-sm tracking-wide transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                        style={{ background: 'var(--accent)', color: '#000' }}
                    >
                        {isLoading ? 'Зачекайте...' : 'Зареєструватися'}
                    </button>
                </form>

                <div className="my-5 border-t" style={{ borderColor: 'var(--border)' }} />

                <p className="text-center text-sm opacity-70" style={{ color: 'var(--text)' }}>
                    Вже маєте акаунт?{' '}
                    <Link to="/login" className="font-bold underline hover:text-[var(--accent)] transition-all ml-1">
                        Увійти
                    </Link>
                </p>
            </div>
        </div>
    )
}