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
        <div
            className="min-h-screen w-full flex flex-col items-center px-4 py-12 text-white"
            style={{ backgroundColor: '#280a3a', fontFamily: "'Inter', sans-serif" }}
        >
            <div className="my-auto w-full flex flex-col items-center">{children}</div>
        </div>
    )
}

function ErrorText({ message }: { message?: string }) {
    if (!message) return null
    return (
        <p
            className="font-semibold w-full"
            style={{ fontSize: '14px', lineHeight: '18px', color: '#dc2626' }}
        >
            {message}
        </p>
    )
}

function ResetLogo() {
    return (
        <Link to="/" className="shrink-0" style={{ width: '60px', height: '60px' }}>
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
            className="cursor-pointer flex items-center justify-center"
            style={{ width: '24px', height: '24px' }}
        >
            <img src={backArrowIcon} alt="" className="block" />
        </button>
    )
}

function LoginLink({ marginTop }: { marginTop: string }) {
    const { t } = useTranslation()
    return (
        <Link
            to="/login"
            className="font-bold text-white text-center hover:underline"
            style={{ fontSize: '16px', lineHeight: '25px', marginTop }}
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
                <div
                    className="w-full relative flex flex-col items-start sm:block"
                    style={{ maxWidth: '500px' }}
                >
                    <div className="mb-4 sm:mb-0 sm:absolute sm:left-0 sm:top-0">
                        <BackButton onClick={() => navigate('/login')} />
                    </div>

                    <div
                        className="w-full mx-auto flex flex-col items-center text-center"
                        style={{ maxWidth: '355px' }}
                    >
                        <CircleCheck
                            strokeWidth={1.5}
                            style={{ width: '80px', height: '80px', color: '#8b5cf6' }}
                        />

                        <h1
                            className="font-semibold text-white"
                            style={{ fontSize: '30px', lineHeight: '42px', marginTop: '24px' }}
                        >
                            {t('forgotPassword.doneTitle')}
                        </h1>

                        <p
                            className="text-white"
                            style={{ fontSize: '16px', lineHeight: '24px', marginTop: '16px' }}
                        >
                            {t('forgotPassword.doneText')}
                        </p>

                        <button
                            type="button"
                            onClick={() => navigate('/login')}
                            className="cursor-pointer flex items-center justify-center font-bold text-black bg-white transition-opacity hover:opacity-90"
                            style={{
                                width: '300px',
                                height: '50px',
                                borderRadius: '35px',
                                fontSize: '16px',
                                marginTop: '36px',
                            }}
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
                <div
                    className="w-full flex flex-col items-center"
                    style={{ maxWidth: '355px', marginTop: '70px' }}
                >
                    <ResetLogo />

                    <h1
                        className="font-semibold text-center text-white w-full"
                        style={{ fontSize: '30px', lineHeight: '50px', marginTop: '20px' }}
                    >
                        {t('forgotPassword.newPasswordTitle')}
                    </h1>

                    {tokenExpired ? (
                        <div
                            className="w-full flex flex-col items-center"
                            style={{ marginTop: '32px' }}
                        >
                            <ErrorText message={passwordForm.formState.errors.root?.message} />
                            <button
                                type="button"
                                onClick={() => navigate('/forgot-password')}
                                className="cursor-pointer flex items-center justify-center font-bold text-black bg-white transition-opacity hover:opacity-90"
                                style={{
                                    width: '300px',
                                    height: '50px',
                                    borderRadius: '35px',
                                    fontSize: '16px',
                                    marginTop: '24px',
                                }}
                            >
                                {t('forgotPassword.requestNewLink')}
                            </button>
                        </div>
                    ) : (
                        <form
                            onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                            noValidate
                            className="w-full flex flex-col items-start"
                            style={{ marginTop: '28px' }}
                        >
                            <div
                                className="w-full flex flex-col items-start"
                                style={{ gap: '12px' }}
                            >
                                <label
                                    htmlFor="reset-password"
                                    className="font-bold text-white"
                                    style={{ fontSize: '16px', lineHeight: '25px' }}
                                >
                                    {t('forgotPassword.passwordLabel')}
                                </label>

                                <div
                                    className="w-full flex items-center justify-between"
                                    style={{
                                        height: '50px',
                                        borderRadius: '5px',
                                        paddingLeft: '20px',
                                        paddingRight: '15px',
                                        border: hasError
                                            ? '2px solid #dc2626'
                                            : '1px solid #ffffff',
                                    }}
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
                                        className="w-full bg-transparent outline-none font-bold text-white"
                                        style={{ fontSize: '16px', lineHeight: '25px' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="cursor-pointer shrink-0 ml-2 flex items-center justify-center"
                                        style={{ width: '25px', height: '25px' }}
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

                                <div
                                    className="w-full flex flex-col items-start"
                                    style={{ gap: '6px', marginTop: '2px' }}
                                >
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

                            <div
                                className="w-full flex flex-col items-start"
                                style={{ marginTop: '24px', gap: '12px' }}
                            >
                                <label
                                    htmlFor="reset-password-confirm"
                                    className="font-bold text-white"
                                    style={{ fontSize: '16px', lineHeight: '25px' }}
                                >
                                    {t('forgotPassword.confirmLabel')}
                                </label>

                                <div
                                    className="w-full flex items-center justify-between"
                                    style={{
                                        height: '50px',
                                        borderRadius: '5px',
                                        paddingLeft: '20px',
                                        paddingRight: '15px',
                                        border: hasError
                                            ? '2px solid #dc2626'
                                            : '1px solid #ffffff',
                                    }}
                                >
                                    <input
                                        id="reset-password-confirm"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        {...passwordForm.register('confirmPassword')}
                                        className="w-full bg-transparent outline-none font-bold text-white"
                                        style={{ fontSize: '16px', lineHeight: '25px' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                                        className="cursor-pointer shrink-0 ml-2 flex items-center justify-center"
                                        style={{ width: '25px', height: '25px' }}
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

                            <div
                                className="w-full flex justify-center"
                                style={{ marginTop: '36px' }}
                            >
                                <button
                                    type="submit"
                                    disabled={isResettingPassword}
                                    className="cursor-pointer flex items-center justify-center font-bold text-black bg-white transition-opacity hover:opacity-90 disabled:opacity-60"
                                    style={{
                                        width: '300px',
                                        height: '50px',
                                        borderRadius: '35px',
                                        fontSize: '16px',
                                    }}
                                >
                                    {isResettingPassword
                                        ? t('forgotPassword.saving')
                                        : t('forgotPassword.changePassword')}
                                </button>
                            </div>
                        </form>
                    )}

                    <LoginLink marginTop="56px" />
                </div>
            </ResetShell>
        )
    }

    if (linkSent) {
        return (
            <ResetShell>
                <div
                    className="w-full relative flex flex-col items-start sm:block"
                    style={{ maxWidth: '500px' }}
                >
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

                    <div
                        className="w-full mx-auto flex flex-col items-center text-center"
                        style={{ maxWidth: '355px' }}
                    >
                        <Mail
                            strokeWidth={1.5}
                            style={{ width: '80px', height: '80px', color: '#8b5cf6' }}
                        />

                        <h1
                            className="font-semibold text-white"
                            style={{ fontSize: '30px', lineHeight: '42px', marginTop: '24px' }}
                        >
                            {t('forgotPassword.checkEmailTitle')}
                        </h1>

                        <p
                            className="text-white"
                            style={{ fontSize: '16px', lineHeight: '24px', marginTop: '16px' }}
                        >
                            {t('forgotPassword.checkEmailText')}
                        </p>

                        {sentNotice && (
                            <p
                                className="font-semibold w-full text-center"
                                style={{
                                    fontSize: '14px',
                                    lineHeight: '18px',
                                    color: '#10b981',
                                    marginTop: '14px',
                                }}
                            >
                                {sentNotice}
                            </p>
                        )}

                        {sentError && <ErrorText message={sentError} />}

                        <button
                            type="button"
                            onClick={() => navigate('/login')}
                            className="cursor-pointer flex items-center justify-center font-bold text-black bg-white transition-opacity hover:opacity-90"
                            style={{
                                width: '300px',
                                height: '50px',
                                borderRadius: '35px',
                                fontSize: '16px',
                                marginTop: '36px',
                            }}
                        >
                            {t('forgotPassword.backToLogin')}
                        </button>

                        <button
                            type="button"
                            disabled={isRequestingLink}
                            onClick={handleResend}
                            className="cursor-pointer inline-flex items-center justify-center gap-1 font-bold transition-opacity hover:opacity-80 disabled:opacity-60"
                            style={{
                                fontSize: '16px',
                                lineHeight: '25px',
                                color: '#8b5cf6',
                                marginTop: '28px',
                            }}
                        >
                            {isRequestingLink ? t('forgotPassword.sending') : t('forgotPassword.resendLink')}
                            {!isRequestingLink && <ChevronRight size={18} />}
                        </button>

                        {devLink && (
                            <a
                                href={devLink}
                                className="font-semibold text-center break-all hover:underline"
                                style={{
                                    fontSize: '13px',
                                    lineHeight: '18px',
                                    color: '#c4a7d8',
                                    marginTop: '14px',
                                }}
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
            <div
                className="w-full relative flex flex-col items-start sm:block"
                style={{ maxWidth: '500px' }}
            >
                <div className="mb-4 sm:mb-0 sm:absolute sm:left-0 sm:top-0">
                    <BackButton onClick={() => navigate('/login')} />
                </div>

                <div
                    className="w-full mx-auto flex flex-col items-center"
                    style={{ maxWidth: '355px' }}
                >
                    <ResetLogo />

                    <h1
                        className="font-semibold text-center text-white w-full"
                        style={{ fontSize: '30px', lineHeight: '50px', marginTop: '20px' }}
                    >
                        {t('forgotPassword.title')}
                    </h1>

                    <form
                        onSubmit={emailForm.handleSubmit(onEmailSubmit)}
                        noValidate
                        className="w-full flex flex-col items-center"
                        style={{ marginTop: '40px' }}
                    >
                        <div className="w-full flex flex-col items-start" style={{ gap: '12px' }}>
                            <label
                                htmlFor="reset-email"
                                className="font-bold text-white"
                                style={{ fontSize: '16px', lineHeight: '25px' }}
                            >
                                {t('forgotPassword.emailLabel')}
                            </label>

                            <div
                                className="w-full flex items-center justify-between"
                                style={{
                                    height: '50px',
                                    borderRadius: '5px',
                                    paddingLeft: '20px',
                                    paddingRight: '16px',
                                    border: hasEmailError
                                        ? '2px solid #dc2626'
                                        : '1px solid #ffffff',
                                }}
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
                                    className="w-full bg-transparent outline-none font-bold text-white"
                                    style={{ fontSize: '16px', lineHeight: '25px' }}
                                />
                                {hasEmailError && (
                                    <div
                                        className="shrink-0 ml-2"
                                        style={{ width: '25px', height: '25px' }}
                                    >
                                        <img src={errorIcon} alt="" className="block" />
                                    </div>
                                )}
                            </div>

                            <p
                                className="text-left"
                                style={{
                                    fontSize: '12px',
                                    lineHeight: '17px',
                                    color: '#b3a1c3',
                                }}
                            >
                                {t('forgotPassword.emailHint')}
                            </p>

                            <ErrorText message={emailForm.formState.errors.email?.message} />
                        </div>

                        <button
                            type="submit"
                            disabled={isRequestingLink}
                            className="cursor-pointer flex items-center justify-center font-bold text-black bg-white transition-opacity hover:opacity-90 disabled:opacity-60"
                            style={{
                                width: '300px',
                                height: '50px',
                                borderRadius: '35px',
                                fontSize: '16px',
                                marginTop: '36px',
                            }}
                        >
                            {isRequestingLink ? t('forgotPassword.sending') : t('forgotPassword.send')}
                        </button>
                    </form>

                    <p
                        className="font-bold text-center text-white w-full"
                        style={{ fontSize: '16px', lineHeight: '25px', marginTop: '28px' }}
                    >
                        {t('forgotPassword.or')}
                    </p>

                    <LoginLink marginTop="40px" />
                </div>
            </div>
        </ResetShell>
    )
}

function Requirement({ fulfilled, children }: { fulfilled: boolean; children: ReactNode }) {
    return (
        <p
            style={{
                fontSize: '14px',
                lineHeight: '18px',
                color: fulfilled ? '#10b981' : '#c4a7d8',
            }}
        >
            {fulfilled ? '✓' : '•'} {children}
        </p>
    )
}
