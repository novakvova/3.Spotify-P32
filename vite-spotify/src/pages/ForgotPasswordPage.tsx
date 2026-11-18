import { useMemo, useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import {
    useForgotPasswordMutation,
    useResetPasswordMutation,
} from '../services/auth/authApi'
import { ChevronRight, CircleCheck, Mail } from 'lucide-react'

import logoSonoraIcon from '../assets/auth/logo-sonora-icon.png'
import eyeClosedIcon from '../assets/auth/eye-closed.svg'
import eyeOpenIcon from '../assets/auth/eye-open.svg'
import backArrowIcon from '../assets/auth/back-arrow.svg'
import errorIcon from '../assets/auth/error-icon.svg'

const PASSWORD_MIN = 10
const PASSWORD_MAX = 72

function buildEmailSchema(t: TFunction) {
    const message = t('forgotPassword.validation.emailInvalid')
    return z.object({
        email: z.string().trim().min(1, message).email(message),
    })
}

function buildPasswordSchema(t: TFunction) {
    return z
        .object({
            password: z
                .string()
                .min(PASSWORD_MIN, t('forgotPassword.validation.passwordMin'))
                .max(PASSWORD_MAX, t('forgotPassword.validation.passwordMax'))
                .refine((val) => /\p{L}/u.test(val), t('forgotPassword.validation.passwordLetter'))
                .refine(
                    (val) => /[\d\p{P}\p{S}]/u.test(val),
                    t('forgotPassword.validation.passwordDigitOrSpecial')
                ),
            confirmPassword: z.string().min(1, t('forgotPassword.validation.confirmRequired')),
        })
        .refine((values) => values.password === values.confirmPassword, {
            path: ['confirmPassword'],
            message: t('forgotPassword.validation.mismatch'),
        })
}

type EmailFormValues = z.infer<ReturnType<typeof buildEmailSchema>>
type PasswordFormValues = z.infer<ReturnType<typeof buildPasswordSchema>>

interface ApiErrorShape {
    status?: number
    data?: { code?: string; message?: string; error?: string }
}

function apiError(err: unknown): ApiErrorShape {
    return (err ?? {}) as ApiErrorShape
}

function apiMessage(err: unknown, fallback: string): string {
    const parsed = apiError(err)
    return parsed.data?.message || parsed.data?.error || fallback
}

function ResetShell({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen w-full flex flex-col items-center px-4 py-12 text-white bg-sonora-dark font-inter">
            <div className="my-auto w-full flex flex-col items-center">{children}</div>
        </div>
    )
}

function ErrorText({ message }: { message?: string }) {
    if (!message) return null
    return (
        <p className="font-semibold w-full text-sm leading-snug text-red-600">
            {message}
        </p>
    )
}

function ResetLogo() {
    return (
        <Link to="/player" className="shrink-0 w-15 h-15">
            <img
                src={logoSonoraIcon}
                alt="Sonora"
                className="w-full h-full object-cover block"
            />
        </Link>
    )
}

function BackButton({ onClick }: { onClick: () => void }) {
    const { t } = useTranslation()
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={t('forgotPassword.back')}
            className="cursor-pointer flex items-center justify-center w-6 h-6"
        >
            <img src={backArrowIcon} alt="" className="block" />
        </button>
    )
}

function LoginLink({ className = 'mt-10' }: { className?: string }) {
    const { t } = useTranslation()
    return (
        <Link
            to="/login"
            className={`font-bold text-white text-center hover:underline text-base leading-6 ${className}`}
        >
            {t('forgotPassword.forgotLogin')}
        </Link>
    )
}

export default function ForgotPasswordPage() {
    const navigate = useNavigate()
    const { token } = useParams<{ token: string }>()
    const { t } = useTranslation()

    const emailSchema = useMemo(() => buildEmailSchema(t), [t])
    const passwordSchema = useMemo(() => buildPasswordSchema(t), [t])

    const [linkSent, setLinkSent] = useState(false)
    const [sentEmail, setSentEmail] = useState('')
    const [devLink, setDevLink] = useState<string | null>(null)
    const [sentNotice, setSentNotice] = useState('')
    const [sentError, setSentError] = useState('')
    const [done, setDone] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const [requestLink, { isLoading: isRequestingLink }] = useForgotPasswordMutation()
    const [resetPassword, { isLoading: isResettingPassword }] = useResetPasswordMutation()

    const emailForm = useForm<EmailFormValues>({
        resolver: zodResolver(emailSchema),
        defaultValues: { email: '' },
        mode: 'onSubmit',
    })

    const passwordForm = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordSchema),
        defaultValues: { password: '', confirmPassword: '' },
        mode: 'onSubmit',
    })

    const passwordValue = passwordForm.watch('password') || ''
    const hasLetter = /\p{L}/u.test(passwordValue)
    const hasDigitOrSpecial = /[\d\p{P}\p{S}]/u.test(passwordValue)
    const hasValidLength =
        passwordValue.length >= PASSWORD_MIN && passwordValue.length <= PASSWORD_MAX

    const onEmailSubmit = async (values: EmailFormValues) => {
        const trimmed = values.email.trim()
        emailForm.clearErrors()

        try {
            const response = await requestLink({ email: trimmed }).unwrap()
            setSentEmail(trimmed)
            setDevLink(response.devLink ?? null)
            setSentNotice('')
            setSentError('')
            setLinkSent(true)
        } catch (err) {
            emailForm.setError('email', {
                message: apiMessage(err, t('forgotPassword.errors.sendFailed')),
            })
        }
    }

    const handleResend = async () => {
        setSentNotice('')
        setSentError('')
        try {
            const response = await requestLink({ email: sentEmail }).unwrap()
            setDevLink(response.devLink ?? null)
            setSentNotice(t('forgotPassword.resent'))
        } catch (err) {
            setSentError(apiMessage(err, t('forgotPassword.errors.sendFailed')))
        }
    }

    const onPasswordSubmit = async (values: PasswordFormValues) => {
        if (!token) return
        passwordForm.clearErrors('root')

        try {
            await resetPassword({ resetToken: token, newPassword: values.password }).unwrap()
            passwordForm.reset()
            setDone(true)
        } catch (err) {
            const parsed = apiError(err)
            if (parsed.status === 401 || parsed.data?.code === 'RESET_TOKEN_INVALID') {
                passwordForm.setError('root', {
                    type: 'token',
                    message: apiMessage(err, t('forgotPassword.errors.resetTokenInvalid')),
                })
                return
            }
            passwordForm.setError('root', {
                message: apiMessage(err, t('forgotPassword.errors.resetFailed')),
            })
        }
    }

    if (done) {
        return (
            <ResetShell>
                <div className="w-full relative flex flex-col items-start sm:block max-w-lg">
                    <div className="mb-4 sm:mb-0 sm:absolute sm:left-0 sm:top-0">
                        <BackButton onClick={() => navigate('/login')} />
                    </div>

                    <div className="w-full mx-auto flex flex-col items-center text-center max-w-sm">
                        <CircleCheck
                            strokeWidth={1.5}
                            className="w-20 h-20 text-violet-500"
                        />

                        <h1 className="font-semibold text-white text-3xl leading-10 mt-6">
                            {t('forgotPassword.doneTitle')}
                        </h1>

                        <p className="text-white text-base leading-6 mt-4">
                            {t('forgotPassword.doneText')}
                        </p>

                        <button
                            type="button"
                            onClick={() => navigate('/login')}
                            className="cursor-pointer flex items-center justify-center font-bold text-black bg-white transition-opacity hover:opacity-90 w-75 h-12.5 rounded-full text-base mt-9"
                        >
                            {t('forgotPassword.backToLogin')}
                        </button>
                    </div>
                </div>
            </ResetShell>
        )
    }

    if (token) {
        const tokenExpired = passwordForm.formState.errors.root?.type === 'token'
        const hasError = Boolean(
            passwordForm.formState.errors.password ||
                passwordForm.formState.errors.confirmPassword ||
                passwordForm.formState.errors.root
        )

        return (
            <ResetShell>
                <div className="w-full flex flex-col items-center max-w-sm mt-18">
                    <ResetLogo />

                    <h1 className="font-semibold text-center text-white w-full text-3xl leading-12 mt-5">
                        {t('forgotPassword.newPasswordTitle')}
                    </h1>

                    {tokenExpired ? (
                        <div className="w-full flex flex-col items-center mt-8">
                            <ErrorText message={passwordForm.formState.errors.root?.message} />
                            <button
                                type="button"
                                onClick={() => navigate('/forgot-password')}
                                className="cursor-pointer flex items-center justify-center font-bold text-black bg-white transition-opacity hover:opacity-90 w-75 h-12.5 rounded-full text-base mt-6"
                            >
                                {t('forgotPassword.requestNewLink')}
                            </button>
                        </div>
                    ) : (
                        <form
                            onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                            noValidate
                            className="w-full flex flex-col items-start mt-7"
                        >
                            <div className="w-full flex flex-col items-start gap-3">
                                <label
                                    htmlFor="reset-password"
                                    className="font-bold text-white text-base leading-6"
                                >
                                    {t('forgotPassword.passwordLabel')}
                                </label>

                                <div
                                    className={`w-full flex items-center justify-between h-12.5 rounded px-5 pr-4 ${
                                        hasError
                                            ? 'border-2 border-red-600'
                                            : 'border border-white'
                                    }`}
                                >
                                    <input
                                        id="reset-password"
                                        type={showPassword ? 'text' : 'password'}
                                        {...passwordForm.register('password', {
                                            onChange: () => {
                                                if (passwordForm.formState.errors.root) {
                                                    passwordForm.clearErrors('root')
                                                }
                                            },
                                        })}
                                        className="w-full bg-transparent outline-none font-bold text-white text-base leading-6"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="cursor-pointer shrink-0 ml-2 flex items-center justify-center w-6 h-6"
                                        aria-label={
                                            showPassword
                                                ? t('forgotPassword.hidePassword')
                                                : t('forgotPassword.showPassword')
                                        }
                                    >
                                        <img
                                            src={showPassword ? eyeOpenIcon : eyeClosedIcon}
                                            alt=""
                                            className="block"
                                        />
                                    </button>
                                </div>

                                <ErrorText
                                    message={passwordForm.formState.errors.password?.message}
                                />

                                <div className="w-full flex flex-col items-start gap-1.5 mt-0.5">
                                    <Requirement fulfilled={hasValidLength}>
                                        {t('forgotPassword.req.length')}
                                    </Requirement>
                                    <Requirement fulfilled={hasLetter}>
                                        {t('forgotPassword.req.letter')}
                                    </Requirement>
                                    <Requirement fulfilled={hasDigitOrSpecial}>
                                        {t('forgotPassword.req.digitOrSpecial')}
                                    </Requirement>
                                </div>
                            </div>

                            <div className="w-full flex flex-col items-start mt-6 gap-3">
                                <label
                                    htmlFor="reset-password-confirm"
                                    className="font-bold text-white text-base leading-6"
                                >
                                    {t('forgotPassword.confirmLabel')}
                                </label>

                                <div
                                    className={`w-full flex items-center justify-between h-12.5 rounded px-5 pr-4 ${
                                        hasError
                                            ? 'border-2 border-red-600'
                                            : 'border border-white'
                                    }`}
                                >
                                    <input
                                        id="reset-password-confirm"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        {...passwordForm.register('confirmPassword')}
                                        className="w-full bg-transparent outline-none font-bold text-white text-base leading-6"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                                        className="cursor-pointer shrink-0 ml-2 flex items-center justify-center w-6 h-6"
                                        aria-label={
                                            showConfirmPassword
                                                ? t('forgotPassword.hidePassword')
                                                : t('forgotPassword.showPassword')
                                        }
                                    >
                                        <img
                                            src={showConfirmPassword ? eyeOpenIcon : eyeClosedIcon}
                                            alt=""
                                            className="block"
                                        />
                                    </button>
                                </div>

                                <ErrorText
                                    message={
                                        passwordForm.formState.errors.confirmPassword?.message
                                    }
                                />
                            </div>

                            <ErrorText message={passwordForm.formState.errors.root?.message} />

                            <div className="w-full flex justify-center mt-9">
                                <button
                                    type="submit"
                                    disabled={isResettingPassword}
                                    className="cursor-pointer flex items-center justify-center font-bold text-black bg-white transition-opacity hover:opacity-90 disabled:opacity-60 w-75 h-12.5 rounded-full text-base"
                                >
                                    {isResettingPassword
                                        ? t('forgotPassword.saving')
                                        : t('forgotPassword.changePassword')}
                                </button>
                            </div>
                        </form>
                    )}

                    <LoginLink className="mt-14" />
                </div>
            </ResetShell>
        )
    }

    if (linkSent) {
        return (
            <ResetShell>
                <div className="w-full relative flex flex-col items-start sm:block max-w-lg">
                    <div className="mb-4 sm:mb-0 sm:absolute sm:left-0 sm:top-0">
                        <BackButton
                            onClick={() => {
                                setLinkSent(false)
                                setSentNotice('')
                                setSentError('')
                                setDevLink(null)
                            }}
                        />
                    </div>

                    <div className="w-full mx-auto flex flex-col items-center text-center max-w-sm">
                        <Mail
                            strokeWidth={1.5}
                            className="w-20 h-20 text-violet-500"
                        />

                        <h1 className="font-semibold text-white text-3xl leading-10 mt-6">
                            {t('forgotPassword.checkEmailTitle')}
                        </h1>

                        <p className="text-white text-base leading-6 mt-4">
                            {t('forgotPassword.checkEmailText')}
                        </p>

                        {sentNotice && (
                            <p className="font-semibold w-full text-center text-sm leading-snug text-emerald-500 mt-3.5">
                                {sentNotice}
                            </p>
                        )}

                        {sentError && <ErrorText message={sentError} />}

                        <button
                            type="button"
                            onClick={() => navigate('/login')}
                            className="cursor-pointer flex items-center justify-center font-bold text-black bg-white transition-opacity hover:opacity-90 w-75 h-12.5 rounded-full text-base mt-9"
                        >
                            {t('forgotPassword.backToLogin')}
                        </button>

                        <button
                            type="button"
                            disabled={isRequestingLink}
                            onClick={handleResend}
                            className="cursor-pointer inline-flex items-center justify-center gap-1 font-bold transition-opacity hover:opacity-80 disabled:opacity-60 text-base leading-6 text-violet-500 mt-7"
                        >
                            {isRequestingLink ? t('forgotPassword.sending') : t('forgotPassword.resendLink')}
                            {!isRequestingLink && <ChevronRight size={18} />}
                        </button>

                        {devLink && (
                            <a
                                href={devLink}
                                className="font-semibold text-center break-all hover:underline text-xs leading-snug text-sonora-lavender mt-3.5"
                            >
                                {t('forgotPassword.devLink')}
                            </a>
                        )}
                    </div>
                </div>
            </ResetShell>
        )
    }

    const hasEmailError = Boolean(emailForm.formState.errors.email)

    return (
        <ResetShell>
            <div className="w-full relative flex flex-col items-start sm:block max-w-lg">
                <div className="mb-4 sm:mb-0 sm:absolute sm:left-0 sm:top-0">
                    <BackButton onClick={() => navigate('/login')} />
                </div>

                <div className="w-full mx-auto flex flex-col items-center max-w-sm">
                    <ResetLogo />

                    <h1 className="font-semibold text-center text-white w-full text-3xl leading-12 mt-5">
                        {t('forgotPassword.title')}
                    </h1>

                    <form
                        onSubmit={emailForm.handleSubmit(onEmailSubmit)}
                        noValidate
                        className="w-full flex flex-col items-center mt-10"
                    >
                        <div className="w-full flex flex-col items-start gap-3">
                            <label
                                htmlFor="reset-email"
                                className="font-bold text-white text-base leading-6"
                            >
                                {t('forgotPassword.emailLabel')}
                            </label>

                            <div
                                className={`w-full flex items-center justify-between h-12.5 rounded px-5 pr-4 ${
                                    hasEmailError
                                        ? 'border-2 border-red-600'
                                        : 'border border-white'
                                }`}
                            >
                                <input
                                    id="reset-email"
                                    type="email"
                                    placeholder="name@domain.com"
                                    {...emailForm.register('email', {
                                        onChange: () => {
                                            if (hasEmailError) emailForm.clearErrors('email')
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

                            <p className="text-left text-xs leading-4 text-sonora-muted">
                                {t('forgotPassword.emailHint')}
                            </p>

                            <ErrorText message={emailForm.formState.errors.email?.message} />
                        </div>

                        <button
                            type="submit"
                            disabled={isRequestingLink}
                            className="cursor-pointer flex items-center justify-center font-bold text-black bg-white transition-opacity hover:opacity-90 disabled:opacity-60 w-75 h-12.5 rounded-full text-base mt-9"
                        >
                            {isRequestingLink ? t('forgotPassword.sending') : t('forgotPassword.send')}
                        </button>
                    </form>

                    <p className="font-bold text-center text-white w-full text-base leading-6 mt-7">
                        {t('forgotPassword.or')}
                    </p>

                    <LoginLink className="mt-10" />
                </div>
            </div>
        </ResetShell>
    )
}

function Requirement({ fulfilled, children }: { fulfilled: boolean; children: ReactNode }) {
    return (
        <p className={`text-sm leading-snug ${fulfilled ? 'text-emerald-500' : 'text-sonora-lavender'}`}>
            {fulfilled ? '✓' : '•'} {children}
        </p>
    )
}
