import { useMemo, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
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

function buildLoginSchema(t: TFunction) {
    return z.object({
        email: z
            .string()
            .trim()
            .min(1, t('login.errors.emailInvalid'))
            .email(t('login.errors.emailInvalid')),
        password: z.string().min(1, t('login.errors.invalidCredentials')),
    })
}

function buildCodeSchema(t: TFunction) {
    const message = t('login.errors.invalidCode')
    return z.object({
        d0: z.string().regex(/^\d$/, message),
        d1: z.string().regex(/^\d$/, message),
        d2: z.string().regex(/^\d$/, message),
        d3: z.string().regex(/^\d$/, message),
    })
}

type LoginFormValues = z.infer<ReturnType<typeof buildLoginSchema>>
type CodeLoginFormValues = z.infer<ReturnType<typeof buildCodeSchema>>

const CODE_KEYS: Array<keyof CodeLoginFormValues> = ['d0', 'd1', 'd2', 'd3']

export default function LoginPage() {
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const { t } = useTranslation()
    const [loginEmail, { isLoading: isSendingCode }] = useLoginEmailMutation()
    const [loginWithCode, { isLoading: isVerifyingCode }] = useLoginWithCodeMutation()
    const [loginWithPassword, { isLoading: isLoggingInPassword }] =
        useLoginWithPasswordMutation()

    const loginSchema = useMemo(() => buildLoginSchema(t), [t])
    const codeLoginSchema = useMemo(() => buildCodeSchema(t), [t])

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
                    message: errorObj?.data?.message || t('login.errors.emailInvalid'),
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
                    t('login.errors.invalidCredentials'),
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
            setCodeResentMessage(t('login.codeResent'))
        } catch (err: unknown) {
            const errorObj = err as {
                data?: { message?: string }
            }
            setCodeFormError('root', {
                message: errorObj?.data?.message || t('login.errors.codeAlreadySent'),
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
                message: errorObj?.data?.message || t('login.errors.invalidCode'),
            })
        }
    }

    if (view === 'email') {
        const hasEmailError = Boolean(errors.email)

        return (
            <div className="min-h-screen w-full flex flex-col items-center px-4 py-12 text-white bg-sonora-dark font-inter">
                <div className="w-full flex flex-col items-center max-w-sm mt-18">
                    <Link to="/player" className="shrink-0 w-15 h-15">
                        <img
                            src={logoSonoraIcon}
                            alt="Sonora"
                            className="w-full h-full object-cover block"
                        />
                    </Link>

                    <h1 className="font-semibold text-center text-white w-full text-3xl leading-12 mt-5">
                        {t('login.emailTitle')}
                    </h1>

                    <form
                        onSubmit={handleEmailContinue}
                        noValidate
                        className="w-full flex flex-col items-center mt-12"
                    >
                        <div className="w-full flex flex-col items-start gap-3">
                            <label
                                htmlFor="login-email-step"
                                className="font-bold text-white text-base leading-6"
                            >
                                {t('login.emailLabel')}
                            </label>

                            <div
                                className={`w-full flex items-center justify-between h-12.5 rounded pl-5 pr-4 ${
                                    hasEmailError ? 'border-2 border-red-600' : 'border border-white'
                                }`}
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
                                    className="w-full bg-transparent outline-none font-bold text-white text-base leading-6"
                                />
                                {hasEmailError && (
                                    <div className="shrink-0 ml-2 w-6 h-6">
                                        <img src={errorIcon} alt="" className="block" />
                                    </div>
                                )}
                            </div>

                            {errors.email?.message && (
                                <p className="font-semibold w-full text-sm leading-snug text-red-600">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        <div className="w-full flex flex-col items-center mt-9 gap-10">
                            <button
                                type="submit"
                                disabled={isSendingCode}
                                className="cursor-pointer flex items-center justify-center font-bold text-black bg-white transition-opacity hover:opacity-90 disabled:opacity-60 w-75 h-12.5 rounded-full text-base"
                            >
                                {isSendingCode ? t('login.waiting') : t('login.next')}
                            </button>

                            <p className="font-bold text-center text-white text-base leading-6">
                                {t('login.or')}
                            </p>
                        </div>
                    </form>

                    <div className="w-full flex flex-col mt-10 gap-3.5">
                        <button
                            type="button"
                            className="cursor-pointer w-full flex items-center justify-between border border-white text-white font-semibold transition-opacity hover:opacity-85 h-14 rounded-full px-5 text-base leading-6"
                        >
                            <span className="shrink-0 w-5 h-5">
                                <img src={googleIcon} alt={t('login.google')} className="block" />
                            </span>
                            <span className="flex-1 text-center">
                                {t('login.signUpWithGoogle1')}
                                <br />
                                {t('login.google')}
                            </span>
                        </button>

                        <button
                            type="button"
                            className="cursor-pointer w-full flex items-center justify-between border border-white text-white font-semibold transition-opacity hover:opacity-85 h-14 rounded-full px-5 text-base leading-6"
                        >
                            <span className="shrink-0 w-5 h-5.5">
                                <img src={appleIcon} alt="Apple" className="block" />
                            </span>
                            <span className="flex-1 text-center">{t('login.loginWithApple')}</span>
                        </button>
                    </div>

                    <div className="w-full flex flex-col items-center text-center mt-18 gap-4">
                        <p className="font-normal text-white text-base leading-7">
                            {t('login.noAccount')}
                        </p>
                        <Link
                            to="/register"
                            className="font-bold text-white hover:underline text-base leading-6"
                        >
                            {t('login.signUp')}
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
            t('login.errors.invalidCredentials')

        return (
            <div
                key="password-view"
                className="min-h-screen w-full flex flex-col items-center px-4 py-12 text-white bg-sonora-dark font-inter"
            >
                <div className="w-full flex flex-col items-start max-w-sm mt-28">
                    <div className="w-full relative flex items-start">
                        <button
                            type="button"
                            onClick={() => {
                                clearErrors()
                                setView('code')
                            }}
                            aria-label={t('login.back')}
                            className="cursor-pointer flex items-center justify-center absolute -left-10.5 top-1 w-6 h-6"
                        >
                            <img src={backArrowIcon} alt="" className="block" />
                        </button>

                        <h1
                            key="password-heading"
                            data-login-heading="password"
                            className="font-bold text-white text-xl leading-7.5"
                        >
                            {t('login.passwordTitle')}
                        </h1>
                    </div>

                    <form
                        onSubmit={handleSubmit(onPasswordSubmit)}
                        noValidate
                        className="w-full flex flex-col items-start mt-7"
                    >
                        <div className="w-full flex flex-col items-start gap-3">
                            <label
                                htmlFor="login-email-password"
                                className="font-bold text-white text-base leading-6"
                            >
                                {t('login.emailLabel')}
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
                                className={`w-full bg-transparent outline-none font-bold h-12.5 rounded px-5 text-base leading-6 ${
                                    hasPasswordLoginError
                                        ? 'text-red-600 border-2 border-red-600'
                                        : 'text-white border border-white'
                                }`}
                            />
                        </div>

                        <div className="w-full flex flex-col items-start mt-6 gap-3">
                            <label
                                htmlFor="login-password-input"
                                className="font-bold text-white text-base leading-6"
                            >
                                {t('login.passwordLabel')}
                            </label>

                            <div
                                className={`w-full flex items-center justify-between h-12.5 rounded pl-5 pr-4 ${
                                    hasPasswordLoginError
                                        ? 'border-2 border-red-600'
                                        : 'border border-white'
                                }`}
                            >
                                <input
                                    id="login-password-input"
                                    type={showPassword ? 'text' : 'password'}
                                    {...register('password', {
                                        onChange: () => {
                                            if (hasPasswordLoginError) clearErrors()
                                        },
                                    })}
                                    className={`w-full bg-transparent outline-none font-bold text-base leading-6 ${
                                        hasPasswordLoginError ? 'text-red-600' : 'text-white'
                                    }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="cursor-pointer shrink-0 ml-2 flex items-center justify-center w-6 h-6"
                                >
                                    <img
                                        src={showPassword ? eyeOpenIcon : eyeClosedIcon}
                                        alt=""
                                        className="block"
                                    />
                                </button>
                            </div>

                            {hasPasswordLoginError && (
                                <p className="font-semibold w-full text-sm leading-snug text-red-600 mt-1">
                                    {passwordErrorMessage}
                                </p>
                            )}
                        </div>

                        <div className="w-full flex justify-center mt-9">
                            <button
                                type="submit"
                                disabled={isLoggingInPassword}
                                className="cursor-pointer flex items-center justify-center font-bold text-black bg-white transition-opacity hover:opacity-90 disabled:opacity-60 w-75 h-12.5 rounded-full text-base"
                            >
                                {isLoggingInPassword ? t('login.loggingIn') : t('login.logIn')}
                            </button>
                        </div>

                        <div className="w-full flex flex-col items-center mt-10 gap-4">
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
                                className="cursor-pointer font-bold text-white text-center hover:underline text-base leading-6"
                            >
                                {t('login.loginWithoutPassword')}
                            </button>

                            <Link
                                to="/forgot-password"
                                className="font-bold text-white text-center hover:underline text-base leading-6"
                            >
                                {t('login.forgotPassword')}
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        )
    }

    const hasCodeError = Boolean(
        codeErrors.d0 || codeErrors.d1 || codeErrors.d2 || codeErrors.d3 || codeErrors.root
    )
    const codeErrorMessage = codeErrors.root?.message || t('login.errors.invalidCode')

    return (
        <div className="min-h-screen w-full flex flex-col items-center px-4 py-12 text-white bg-sonora-dark font-inter">
            <div className="w-full flex flex-col items-start max-w-sm mt-28">
                <div className="w-full relative flex items-start">
                    <button
                        type="button"
                        onClick={() => {
                            clearCodeErrors()
                            setCodeResentMessage('')
                            setView('email')
                        }}
                        aria-label={t('login.back')}
                        className="cursor-pointer flex items-center justify-center absolute -left-10.5 top-1 w-6 h-6"
                    >
                        <img src={backArrowIcon} alt="" className="block" />
                    </button>

                    <h1 className="font-bold text-white text-xl leading-7.5">
                        {t('login.codeTitle')}
                    </h1>
                </div>

                <form
                    onSubmit={handleCodeFormSubmit(onCodeSubmit)}
                    noValidate
                    className="w-full flex flex-col items-center mt-8"
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
                                className={`bg-transparent outline-none font-bold text-center w-18 h-16 rounded text-xl leading-6 ${
                                    hasCodeError
                                        ? 'text-red-600 border-2 border-red-600'
                                        : 'text-white border border-white'
                                }`}
                            />
                        ))}
                    </div>

                    {hasCodeError && (
                        <p className="font-semibold w-full text-sm leading-snug text-red-600 mt-3.5">
                            {codeErrorMessage}
                        </p>
                    )}

                    {codeResentMessage && !hasCodeError && (
                        <p className="font-semibold w-full text-center text-sm leading-snug text-emerald-500 mt-3.5">
                            {codeResentMessage}
                        </p>
                    )}

                    <button
                        type="button"
                        disabled={isSendingCode}
                        onClick={handleResendCode}
                        className={`cursor-pointer flex items-center justify-center font-bold text-white border border-white transition-opacity hover:opacity-85 disabled:opacity-60 w-58 h-12.5 rounded-full text-base ${
                            hasCodeError ? 'mt-10' : 'mt-14'
                        }`}
                    >
                        {isSendingCode ? t('login.sendingCode') : t('login.resendCode')}
                    </button>

                    <button
                        type="submit"
                        disabled={isVerifyingCode}
                        className="cursor-pointer flex items-center justify-center font-bold text-black bg-white transition-opacity hover:opacity-90 disabled:opacity-60 w-75 h-12.5 rounded-full text-base mt-10"
                    >
                        {isVerifyingCode ? t('login.verifying') : t('login.next')}
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            clearErrors()
                            setView('password')
                        }}
                        className="cursor-pointer font-bold text-white text-center hover:underline text-base leading-6 mt-18"
                    >
                        {t('login.usePassword')}
                    </button>
                </form>
            </div>
        </div>
    )
}
