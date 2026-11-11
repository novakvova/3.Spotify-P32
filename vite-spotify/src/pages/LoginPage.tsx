import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
    useLoginEmailMutation,
    useLoginWithCodeMutation,
    useLoginWithPasswordMutation,
} from '../services/auth/authApi'
import { setCredentials } from '../store/slices/authSlice'
import { useAppDispatch } from '../store/hooks'

import logoSonoraIcon from '../assets/auth/logo-sonora-icon.png'
import googleIcon from '../assets/auth/google.svg'
import appleIcon from '../assets/auth/apple.svg'
import eyeClosedIcon from '../assets/auth/eye-closed.svg'
import eyeOpenIcon from '../assets/auth/eye-open.svg'
import backArrowIcon from '../assets/auth/back-arrow.svg'
import errorIcon from '../assets/auth/error-icon.svg'

const loginSchema = z.object({
    email: z
        .string()
        .trim()
        .min(1, 'Введіть коректну адресу електронної пошти')
        .email('Введіть коректну адресу електронної пошти'),
    password: z
        .string()
        .min(1, 'Неправильні адреса електронної пошти або пароль'),
})

type LoginFormValues = z.infer<typeof loginSchema>

const codeLoginSchema = z.object({
    d0: z.string().regex(/^\d$/, 'Цей код недійсний. Перевірте код і повторіть спробу'),
    d1: z.string().regex(/^\d$/, 'Цей код недійсний. Перевірте код і повторіть спробу'),
    d2: z.string().regex(/^\d$/, 'Цей код недійсний. Перевірте код і повторіть спробу'),
    d3: z.string().regex(/^\d$/, 'Цей код недійсний. Перевірте код і повторіть спробу'),
})

type CodeLoginFormValues = z.infer<typeof codeLoginSchema>

const CODE_KEYS: Array<keyof CodeLoginFormValues> = ['d0', 'd1', 'd2', 'd3']

export default function LoginPage() {
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const [loginEmail, { isLoading: isSendingCode }] = useLoginEmailMutation()
    const [loginWithCode, { isLoading: isVerifyingCode }] = useLoginWithCodeMutation()
    const [loginWithPassword, { isLoading: isLoggingInPassword }] =
        useLoginWithPasswordMutation()

    const [view, setView] = useState<'email' | 'password' | 'code'>('email')
    const [showPassword, setShowPassword] = useState(false)
    const [codeResentMessage, setCodeResentMessage] = useState('')

    const codeInputRefs = [
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
    ]

    const {
        register,
        handleSubmit,
        watch,
        trigger,
        setError,
        clearErrors,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
        mode: 'onSubmit',
    })

    const {
        handleSubmit: handleCodeFormSubmit,
        watch: watchCode,
        setValue: setCodeValue,
        setError: setCodeFormError,
        clearErrors: clearCodeErrors,
        formState: { errors: codeErrors },
    } = useForm<CodeLoginFormValues>({
        resolver: zodResolver(codeLoginSchema),
        defaultValues: {
            d0: '',
            d1: '',
            d2: '',
            d3: '',
        },
        mode: 'onSubmit',
    })

    const saveAuthAndRedirect = (
        token: string,
        emailStr: string,
        user?: {
            id: number
            username: string
            email: string
            fullName?: string
            birthDate?: string
            gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'NONEBINARY' | 'UNDISCLOSED'
            image: string | null
            roles: string[]
        }
    ) => {
        const fallbackUsername = emailStr.split('@')[0] || 'user'
        const resolvedUser = user ?? {
            id: 0,
            username: fallbackUsername,
            email: emailStr,
            image: null,
            roles: ['USER'],
        }
        dispatch(
            setCredentials({
                token,
                user: {
                    ...resolvedUser,
                    roles: Array.isArray(resolvedUser.roles)
                        ? resolvedUser.roles
                        : ['USER'],
                },
            })
        )
        navigate('/')
    }

    const handleEmailContinue = async (e: React.FormEvent) => {
        e.preventDefault()
        clearErrors('email')
        const valid = await trigger('email')
        if (!valid) {
            return
        }

        const trimmed = watch('email').trim()
        try {
            await loginEmail({ email: trimmed }).unwrap()
            clearErrors()
            clearCodeErrors()
            setCodeResentMessage('')
            setView('code')
        } catch (err: unknown) {
            const errorObj = err as {
                status?: number
                data?: { code?: string; message?: string }
            }
            if (errorObj?.status === 400) {
                setError('email', {
                    message:
                        errorObj?.data?.message ||
                        'Введіть коректну адресу електронної пошти',
                })
                return
            }
            clearErrors()
            clearCodeErrors()
            setCodeResentMessage('')
            setView('code')
        }
    }

    const onPasswordSubmit = async (formData: LoginFormValues) => {
        clearErrors('root')
        const trimmedEmail = formData.email.trim()

        try {
            const response = await loginWithPassword({
                email: trimmedEmail,
                password: formData.password,
            }).unwrap()

            saveAuthAndRedirect(response.token, trimmedEmail, response.user)
        } catch (err: unknown) {
            const errorObj = err as {
                data?: { message?: string; error?: string }
            }
            setError('root', {
                message:
                    errorObj?.data?.message ||
                    errorObj?.data?.error ||
                    'Неправильні адреса електронної пошти або пароль',
            })
        }
    }

    const handleCodeDigitChange = (index: number, rawValue: string) => {
        const digit = rawValue.replace(/\D/g, '').slice(-1)
        const key = CODE_KEYS[index]
        setCodeValue(key, digit)
        clearCodeErrors()
        if (codeResentMessage) setCodeResentMessage('')

        if (digit && index < 3) {
            codeInputRefs[index + 1].current?.focus()
        }
    }

    const handleCodeKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        const currentVal = watchCode(CODE_KEYS[index])
        if (e.key === 'Backspace' && !currentVal && index > 0) {
            codeInputRefs[index - 1].current?.focus()
        }
    }

    const handleCodePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault()
        const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4).split('')
        if (digits.length === 0) return

        CODE_KEYS.forEach((key, idx) => {
            setCodeValue(key, digits[idx] || '')
        })
        clearCodeErrors()
        const nextFocus = Math.min(digits.length, 3)
        codeInputRefs[nextFocus].current?.focus()
    }

    const handleResendCode = async () => {
        clearCodeErrors()
        setCodeResentMessage('')
        const trimmedEmail = watch('email').trim()
        if (!trimmedEmail) {
            setView('email')
            return
        }

        try {
            await loginEmail({ email: trimmedEmail }).unwrap()
            setCodeResentMessage('Код надіслано повторно')
        } catch (err: unknown) {
            const errorObj = err as {
                data?: { message?: string }
            }
            setCodeFormError('root', {
                message:
                    errorObj?.data?.message ||
                    'Код уже надіслано. Спробуйте за хвилину',
            })
        }
    }

    const onCodeSubmit = async (codeData: CodeLoginFormValues) => {
        clearCodeErrors('root')
        setCodeResentMessage('')
        const trimmedEmail = watch('email').trim()
        const fullCode = `${codeData.d0}${codeData.d1}${codeData.d2}${codeData.d3}`

        try {
            const response = await loginWithCode({
                email: trimmedEmail,
                code: fullCode,
            }).unwrap()

            saveAuthAndRedirect(response.token, trimmedEmail, response.user)
        } catch (err: unknown) {
            const errorObj = err as {
                data?: { message?: string }
            }
            setCodeFormError('root', {
                message:
                    errorObj?.data?.message ||
                    'Цей код недійсний. Перевірте код і повторіть спробу',
            })
        }
    }

    if (view === 'email') {
        const hasEmailError = Boolean(errors.email)

        return (
            <div
                className="min-h-screen w-full flex flex-col items-center px-4 py-12 text-white"
                style={{ backgroundColor: '#280a3a', fontFamily: "'Inter', sans-serif" }}
            >
                <div className="w-full flex flex-col items-center" style={{ maxWidth: '355px', marginTop: '70px' }}>
                    <Link to="/" className="shrink-0" style={{ width: '60px', height: '60px' }}>
                        <img
                            src={logoSonoraIcon}
                            alt="Sonora"
                            className="w-full h-full object-cover block"
                        />
                    </Link>

                    <h1
                        className="font-semibold text-center text-white w-full"
                        style={{
                            fontSize: '30px',
                            lineHeight: '50px',
                            marginTop: '20px',
                        }}
                    >
                        Раді бачити вас знову!
                    </h1>

                    <form
                        onSubmit={handleEmailContinue}
                        noValidate
                        className="w-full flex flex-col items-center"
                        style={{ marginTop: '48px' }}
                    >
                        <div className="w-full flex flex-col items-start" style={{ gap: '12px' }}>
                            <label
                                htmlFor="login-email-step"
                                className="font-bold text-white"
                                style={{ fontSize: '16px', lineHeight: '25px' }}
                            >
                                Електронна пошта
                            </label>

                            <div
                                className="w-full flex items-center justify-between"
                                style={{
                                    height: '50px',
                                    borderRadius: '5px',
                                    paddingLeft: '20px',
                                    paddingRight: '16px',
                                    border: hasEmailError ? '2px solid #dc2626' : '1px solid #ffffff',
                                }}
                            >
                                <input
                                    id="login-email-step"
                                    type="email"
                                    placeholder="name@domain.com"
                                    {...register('email', {
                                        onChange: () => {
                                            if (errors.email) clearErrors('email')
                                        },
                                    })}
                                    className="w-full bg-transparent outline-none font-bold text-white"
                                    style={{ fontSize: '16px', lineHeight: '25px' }}
                                />
                                {hasEmailError && (
                                    <div className="shrink-0 ml-2" style={{ width: '25px', height: '25px' }}>
                                        <img src={errorIcon} alt="" className="block" />
                                    </div>
                                )}
                            </div>

                            {errors.email?.message && (
                                <p
                                    className="font-semibold w-full"
                                    style={{
                                        fontSize: '14px',
                                        lineHeight: '18px',
                                        color: '#dc2626',
                                    }}
                                >
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        <div
                            className="w-full flex flex-col items-center"
                            style={{ marginTop: '36px', gap: '40px' }}
                        >
                            <button
                                type="submit"
                                disabled={isSendingCode}
                                className="cursor-pointer flex items-center justify-center font-bold text-black bg-white transition-opacity hover:opacity-90 disabled:opacity-60"
                                style={{
                                    width: '300px',
                                    height: '50px',
                                    borderRadius: '35px',
                                    fontSize: '16px',
                                }}
                            >
                                {isSendingCode ? 'Зачекайте...' : 'Далі'}
                            </button>

                            <p
                                className="font-bold text-center text-white"
                                style={{ fontSize: '16px', lineHeight: '25px' }}
                            >
                                або
                            </p>
                        </div>
                    </form>

                    <div className="w-full flex flex-col" style={{ marginTop: '40px', gap: '15px' }}>
                        <button
                            type="button"
                            className="cursor-pointer w-full flex items-center justify-between border border-white text-white font-semibold transition-opacity hover:opacity-85"
                            style={{
                                height: '55px',
                                borderRadius: '35px',
                                paddingLeft: '20px',
                                paddingRight: '20px',
                                fontSize: '16px',
                                lineHeight: '23px',
                            }}
                        >
                            <span className="shrink-0" style={{ width: '20px', height: '20px' }}>
                                <img src={googleIcon} alt="Google" className="block" />
                            </span>
                            <span className="flex-1 text-center">
                                Зареєструватися через
                                <br />
                                Google
                            </span>
                        </button>

                        <button
                            type="button"
                            className="cursor-pointer w-full flex items-center justify-between border border-white text-white font-semibold transition-opacity hover:opacity-85"
                            style={{
                                height: '55px',
                                borderRadius: '35px',
                                paddingLeft: '20px',
                                paddingRight: '20px',
                                fontSize: '16px',
                                lineHeight: '23px',
                            }}
                        >
                            <span className="shrink-0" style={{ width: '20px', height: '22px' }}>
                                <img src={appleIcon} alt="Apple" className="block" />
                            </span>
                            <span className="flex-1 text-center">Вхід через Apple</span>
                        </button>
                    </div>

                    <div
                        className="w-full flex flex-col items-center text-center"
                        style={{ marginTop: '70px', gap: '16px' }}
                    >
                        <p className="font-normal text-white" style={{ fontSize: '16px', lineHeight: '30px' }}>
                            Немає акаунту?
                        </p>
                        <Link
                            to="/register"
                            className="font-bold text-white hover:underline"
                            style={{ fontSize: '16px', lineHeight: '25px' }}
                        >
                            Зареєструватися
                        </Link>
                        <Link
                            to="/forgot-password"
                            className="font-semibold text-white hover:underline"
                            style={{ fontSize: '14px', lineHeight: '18px' }}
                        >
                            Забули пароль?
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    if (view === 'password') {
        const hasPasswordLoginError = Boolean(
            errors.email || errors.password || errors.root
        )
        const passwordErrorMessage =
            errors.root?.message ||
            errors.email?.message ||
            errors.password?.message ||
            'Неправильні адреса електронної пошти або пароль'

        return (
            <div
                className="min-h-screen w-full flex flex-col items-center px-4 py-12 text-white"
                style={{ backgroundColor: '#280a3a', fontFamily: "'Inter', sans-serif" }}
            >
                <div className="w-full flex flex-col items-start" style={{ maxWidth: '355px', marginTop: '110px' }}>
                    <div className="w-full relative flex items-center">
                        <button
                            type="button"
                            onClick={() => {
                                clearErrors()
                                setView('email')
                            }}
                            aria-label="Назад"
                            className="cursor-pointer flex items-center justify-center"
                            style={{
                                position: 'absolute',
                                left: '-42px',
                                top: '4px',
                                width: '24px',
                                height: '24px',
                            }}
                        >
                            <img src={backArrowIcon} alt="" className="block" />
                        </button>

                        <h1
                            className="font-bold text-white"
                            style={{ fontSize: '20px', lineHeight: '30px' }}
                        >
                            Увійти за допомогою пароля
                        </h1>
                    </div>

                    <form
                        onSubmit={handleSubmit(onPasswordSubmit)}
                        noValidate
                        className="w-full flex flex-col items-start"
                        style={{ marginTop: '28px' }}
                    >
                        <div className="w-full flex flex-col items-start" style={{ gap: '12px' }}>
                            <label
                                htmlFor="login-email-password"
                                className="font-bold text-white"
                                style={{ fontSize: '16px', lineHeight: '25px' }}
                            >
                                Електронна пошта
                            </label>

                            <input
                                id="login-email-password"
                                type="email"
                                placeholder="name@domain.com"
                                {...register('email', {
                                    onChange: () => {
                                        if (hasPasswordLoginError) clearErrors()
                                    },
                                })}
                                className="w-full bg-transparent outline-none font-bold"
                                style={{
                                    height: '50px',
                                    borderRadius: '5px',
                                    paddingLeft: '20px',
                                    paddingRight: '20px',
                                    fontSize: '16px',
                                    lineHeight: '25px',
                                    color: hasPasswordLoginError ? '#dc2626' : '#ffffff',
                                    border: hasPasswordLoginError
                                        ? '2px solid #dc2626'
                                        : '1px solid #ffffff',
                                }}
                            />
                        </div>

                        <div
                            className="w-full flex flex-col items-start"
                            style={{ marginTop: '24px', gap: '12px' }}
                        >
                            <label
                                htmlFor="login-password-input"
                                className="font-bold text-white"
                                style={{ fontSize: '16px', lineHeight: '25px' }}
                            >
                                Пароль
                            </label>

                            <div
                                className="w-full flex items-center justify-between"
                                style={{
                                    height: '50px',
                                    borderRadius: '5px',
                                    paddingLeft: '20px',
                                    paddingRight: '15px',
                                    border: hasPasswordLoginError
                                        ? '2px solid #dc2626'
                                        : '1px solid #ffffff',
                                }}
                            >
                                <input
                                    id="login-password-input"
                                    type={showPassword ? 'text' : 'password'}
                                    {...register('password', {
                                        onChange: () => {
                                            if (hasPasswordLoginError) clearErrors()
                                        },
                                    })}
                                    className="w-full bg-transparent outline-none font-bold"
                                    style={{
                                        fontSize: '16px',
                                        lineHeight: '25px',
                                        color: hasPasswordLoginError ? '#dc2626' : '#ffffff',
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="cursor-pointer shrink-0 ml-2 flex items-center justify-center"
                                    style={{ width: '25px', height: '25px' }}
                                >
                                    <img
                                        src={showPassword ? eyeOpenIcon : eyeClosedIcon}
                                        alt=""
                                        className="block"
                                    />
                                </button>
                            </div>

                            {hasPasswordLoginError && (
                                <p
                                    className="font-semibold w-full"
                                    style={{
                                        fontSize: '14px',
                                        lineHeight: '18px',
                                        color: '#dc2626',
                                        marginTop: '4px',
                                    }}
                                >
                                    {passwordErrorMessage}
                                </p>
                            )}
                        </div>

                        <div className="w-full flex justify-end" style={{ marginTop: '10px' }}>
                            <Link
                                to="/forgot-password"
                                className="font-semibold text-white hover:underline"
                                style={{ fontSize: '14px', lineHeight: '18px' }}
                            >
                                Забули пароль?
                            </Link>
                        </div>

                        <div className="w-full flex justify-center" style={{ marginTop: '32px' }}>
                            <button
                                type="submit"
                                disabled={isLoggingInPassword}
                                className="cursor-pointer flex items-center justify-center font-bold text-black bg-white transition-opacity hover:opacity-90 disabled:opacity-60"
                                style={{
                                    width: '300px',
                                    height: '50px',
                                    borderRadius: '35px',
                                    fontSize: '16px',
                                }}
                            >
                                {isLoggingInPassword ? 'Вхід...' : 'Увійти'}
                            </button>
                        </div>

                        <div className="w-full flex justify-center" style={{ marginTop: '56px' }}>
                            <button
                                type="button"
                                onClick={async () => {
                                    clearCodeErrors()
                                    setCodeResentMessage('')
                                    const trimmed = watch('email').trim()
                                    if (trimmed) {
                                        try {
                                            await loginEmail({ email: trimmed }).unwrap()
                                        } catch {
                                            setCodeResentMessage('')
                                        }
                                    }
                                    setView('code')
                                }}
                                className="cursor-pointer font-bold text-white text-center hover:underline"
                                style={{ fontSize: '16px', lineHeight: '25px' }}
                            >
                                Увійти без пароля
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )
    }

    const hasCodeError = Boolean(
        codeErrors.d0 || codeErrors.d1 || codeErrors.d2 || codeErrors.d3 || codeErrors.root
    )
    const codeErrorMessage =
        codeErrors.root?.message || 'Цей код недійсний. Перевірте код і повторіть спробу'

    return (
        <div
            className="min-h-screen w-full flex flex-col items-center px-4 py-12 text-white"
            style={{ backgroundColor: '#280a3a', fontFamily: "'Inter', sans-serif" }}
        >
            <div className="w-full flex flex-col items-start" style={{ maxWidth: '355px', marginTop: '110px' }}>
                <div className="w-full relative flex items-start">
                    <button
                        type="button"
                        onClick={() => {
                            clearCodeErrors()
                            setCodeResentMessage('')
                            setView('email')
                        }}
                        aria-label="Назад"
                        className="cursor-pointer flex items-center justify-center"
                        style={{
                            position: 'absolute',
                            left: '-42px',
                            top: '4px',
                            width: '24px',
                            height: '24px',
                        }}
                    >
                        <img src={backArrowIcon} alt="" className="block" />
                    </button>

                    <h1
                        className="font-bold text-white"
                        style={{ fontSize: '20px', lineHeight: '30px' }}
                    >
                        Введіть код, надісланий на вашу електронну пошту
                    </h1>
                </div>

                <form
                    onSubmit={handleCodeFormSubmit(onCodeSubmit)}
                    noValidate
                    className="w-full flex flex-col items-center"
                    style={{ marginTop: '32px' }}
                >
                    <div className="w-full flex items-center justify-between">
                        {CODE_KEYS.map((key, index) => (
                            <input
                                key={key}
                                ref={codeInputRefs[index]}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={watchCode(key)}
                                onChange={(e) => handleCodeDigitChange(index, e.target.value)}
                                onKeyDown={(e) => handleCodeKeyDown(index, e)}
                                onPaste={handleCodePaste}
                                className="bg-transparent outline-none font-bold text-center"
                                style={{
                                    width: '73px',
                                    height: '65px',
                                    borderRadius: '5px',
                                    fontSize: '20px',
                                    lineHeight: '24px',
                                    color: hasCodeError ? '#dc2626' : '#ffffff',
                                    border: hasCodeError ? '2px solid #dc2626' : '1px solid #ffffff',
                                }}
                            />
                        ))}
                    </div>

                    {hasCodeError && (
                        <p
                            className="font-semibold w-full"
                            style={{
                                fontSize: '14px',
                                lineHeight: '18px',
                                color: '#dc2626',
                                marginTop: '14px',
                            }}
                        >
                            {codeErrorMessage}
                        </p>
                    )}

                    {codeResentMessage && !hasCodeError && (
                        <p
                            className="font-semibold w-full text-center"
                            style={{
                                fontSize: '14px',
                                lineHeight: '18px',
                                color: '#10b981',
                                marginTop: '14px',
                            }}
                        >
                            {codeResentMessage}
                        </p>
                    )}

                    <button
                        type="button"
                        disabled={isSendingCode}
                        onClick={handleResendCode}
                        className="cursor-pointer flex items-center justify-center font-bold text-white border border-white transition-opacity hover:opacity-85 disabled:opacity-60"
                        style={{
                            width: '230px',
                            height: '50px',
                            borderRadius: '35px',
                            fontSize: '16px',
                            marginTop: hasCodeError ? '40px' : '56px',
                        }}
                    >
                        {isSendingCode ? 'Надсилання...' : 'Надіслати код ще раз'}
                    </button>

                    <button
                        type="submit"
                        disabled={isVerifyingCode}
                        className="cursor-pointer flex items-center justify-center font-bold text-black bg-white transition-opacity hover:opacity-90 disabled:opacity-60"
                        style={{
                            width: '300px',
                            height: '50px',
                            borderRadius: '35px',
                            fontSize: '16px',
                            marginTop: '40px',
                        }}
                    >
                        {isVerifyingCode ? 'Перевірка...' : 'Далі'}
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            clearErrors()
                            setView('password')
                        }}
                        className="cursor-pointer font-bold text-white text-center hover:underline"
                        style={{ fontSize: '16px', lineHeight: '25px', marginTop: '70px' }}
                    >
                        Увійти за допомогою пароля
                    </button>
                </form>
            </div>
        </div>
    )
}
