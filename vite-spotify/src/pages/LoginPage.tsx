import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { useLoginMutation } from '../services/auth/authApi'
import { setCredentials } from '../store/slices/authSlice'
import { useAppDispatch } from '../store/hooks'

export default function LoginPage() {
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const [login, { isLoading }] = useLoginMutation()

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        try {
            const data = await login({ username, password }).unwrap()

            localStorage.setItem('token', data.token)
            dispatch(setCredentials({
                token: data.token,
                user: { id: 0, username, email: '', image: null, roles: [] },
            }))

            const profileRes = await fetch('/profile', {
                headers: {
                    Authorization: `Bearer ${data.token}`,
                    'Content-Type': 'application/json',
                },
            })

            if (profileRes.ok) {
                const profile = await profileRes.json()
                dispatch(setCredentials({ token: data.token, user: profile }))
            }

            navigate('/')
        } catch (err: unknown) {
            const msg = (err as { data?: { error?: string } })?.data?.error
            setError(msg ?? 'Невірний логін або пароль')
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

                <div className="flex flex-col items-center gap-2 mb-6 mt-2">
                    <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text)' }}>
                        Вхід у Spotify
                    </h1>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold tracking-wide uppercase opacity-80" style={{ color: 'var(--text)' }}>
                            Ім'я користувача
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="username"
                            required
                            className="w-full px-4 py-2.5 rounded-md border outline-none text-sm transition-all focus:border-[var(--accent)]"
                            style={{ background: 'var(--bg-input)', color: 'var(--text)', borderColor: 'var(--border)' }}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold tracking-wide uppercase opacity-80" style={{ color: 'var(--text)' }}>
                            Пароль
                        </label>
                        <div className="relative w-full">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Введіть пароль"
                                required
                                className="w-full pl-4 pr-10 py-2.5 rounded-md border outline-none text-sm transition-all focus:border-[var(--accent)]"
                                style={{ background: 'var(--bg-input)', color: 'var(--text)', borderColor: 'var(--border)' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition-all"
                                style={{ color: 'var(--text)' }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
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
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 mt-1 rounded-full font-bold text-sm tracking-wide transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                        style={{ background: 'var(--accent)', color: '#000' }}
                    >
                        {isLoading ? 'Вхід...' : 'Увійти'}
                    </button>
                </form>

                <div className="my-6 border-t" style={{ borderColor: 'var(--border)' }} />

                <p className="text-center text-sm opacity-70" style={{ color: 'var(--text)' }}>
                    Немає акаунта?{' '}
                    <Link to="/register" className="font-bold underline hover:text-[var(--accent)] transition-all ml-1">
                        Зареєструватися
                    </Link>
                </p>
            </div>
        </div>
    )
}