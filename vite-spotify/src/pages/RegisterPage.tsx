import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff,ArrowLeft } from 'lucide-react'

export default function RegisterPage() {
    const [email, setEmail] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        console.log('Реєстрація (заглушка):', { email, username, password })
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] px-4">
            <div
                className="w-full max-w-md rounded-xl p-6 md:p-8 border shadow-sm transition-all relative"
                style={{
                    background: 'var(--sidebar-bg)',
                    borderColor: 'var(--border)'
                }}
            >
                <button
                    onClick={() => navigate('/')}
                    className="absolute left-4 top-4 p-2 rounded-full opacity-70 hover:opacity-100 hover:bg-white/10 transition-all flex items-center justify-center"
                    style={{ color: 'var(--text)' }}
                    title="На головну"
                >
                    <ArrowLeft size={20} />
                </button>

                <div className="flex flex-col items-center gap-2 mb-6 mt-2">
                    <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text)' }}>
                        Реєстрація
                    </h1>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold tracking-wide uppercase opacity-80" style={{ color: 'var(--text)' }}>
                            Електронна пошта
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@domain.com"
                            required
                            className="w-full px-4 py-2.5 rounded-md border outline-none text-sm transition-all focus:border-[var(--accent)]"
                            style={{
                                background: 'var(--bg-input)',
                                color: 'var(--text)',
                                borderColor: 'var(--border)'
                            }}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold tracking-wide uppercase opacity-80" style={{ color: 'var(--text)' }}>
                            Ім'я користувача
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Як вас називати?"
                            required
                            className="w-full px-4 py-2.5 rounded-md border outline-none text-sm transition-all focus:border-[var(--accent)]"
                            style={{
                                background: 'var(--bg-input)',
                                color: 'var(--text)',
                                borderColor: 'var(--border)'
                            }}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5 relative">
                        <label className="text-xs font-bold tracking-wide uppercase opacity-80" style={{ color: 'var(--text)' }}>
                            Пароль
                        </label>
                        <div className="relative w-full">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Придумайте надійний пароль"
                                required
                                className="w-full pl-4 pr-10 py-2.5 rounded-md border outline-none text-sm transition-all focus:border-[var(--accent)]"
                                style={{
                                    background: 'var(--bg-input)',
                                    color: 'var(--text)',
                                    borderColor: 'var(--border)'
                                }}
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

                    <button
                        type="submit"
                        className="w-full py-3 mt-2 rounded-full font-bold text-sm tracking-wide transition-all hover:scale-[1.01] active:scale-[0.99]"
                        style={{
                            background: 'var(--accent)',
                            color: '#000'
                        }}
                    >
                        Зареєструватися
                    </button>
                </form>

                <div className="my-6 border-t" style={{ borderColor: 'var(--border)' }} />

                <p className="text-center text-sm opacity-70" style={{ color: 'var(--text)' }}>
                    Вже маєте акаунт?{' '}
                    <Link
                        to="/login"
                        className="font-bold underline hover:text-[var(--accent)] transition-all ml-1"
                    >
                        Увійти у Spotify
                    </Link>
                </p>
            </div>
        </div>
    )
}