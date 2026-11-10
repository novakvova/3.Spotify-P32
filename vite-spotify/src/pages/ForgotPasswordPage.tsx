import { useRef, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
    useForgotPasswordMutation,
    useResetPasswordMutation,
    useVerifyResetCodeMutation,
} from '../services/auth/authApi'

import logoSonoraIcon from '../assets/auth/logo-sonora-icon.png'
import eyeClosedIcon from '../assets/auth/eye-closed.svg'
import eyeOpenIcon from '../assets/auth/eye-open.svg'
import backArrowIcon from '../assets/auth/back-arrow.svg'
import errorIcon from '../assets/auth/error-icon.svg'
import checkCircleIcon from '../assets/auth/check-circle.svg'

const PASSWORD_MIN = 10
const PASSWORD_MAX = 72
const CODE_LENGTH = 6
const CODE_ERROR = 'Цей код недійсний. Перевірте код і повторіть спробу'

const emailSchema = z.object({
    email: z
        .string()
        .trim()
        .min(1, 'Введіть коректну адресу електронної пошти')
        .email('Введіть коректну адресу електронної пошти'),
})

const codeSchema = z.object({
    d0: z.string().regex(/^\d$/, CODE_ERROR),
    d1: z.string().regex(/^\d$/, CODE_ERROR),
    d2: z.string().regex(/^\d$/, CODE_ERROR),
    d3: z.string().regex(/^\d$/, CODE_ERROR),
    d4: z.string().regex(/^\d$/, CODE_ERROR),
    d5: z.string().regex(/^\d$/, CODE_ERROR),
})

const passwordSchema = z
    .object({
        password: z
            .string()
            .min(PASSWORD_MIN, 'Пароль має містити щонайменше 10 символів')
            .max(PASSWORD_MAX, 'Пароль занадто довгий')
            .refine((val) => /\p{L}/u.test(val), 'Пароль має містити принаймні 1 літеру')
            .refine(
                (val) => /[\d\p{P}\p{S}]/u.test(val),
                'Пароль має містити принаймні 1 число або 1 спеціальний символ'
            ),
        confirmPassword: z.string().min(1, 'Підтвердіть пароль'),
    })
    .refine((values) => values.password === values.confirmPassword, {
        path: ['confirmPassword'],
        message: 'Паролі не збігаються',
    })

type EmailFormValues = z.infer<typeof emailSchema>
type CodeFormValues = z.infer<typeof codeSchema>
type PasswordFormValues = z.infer<typeof passwordSchema>

type ResetStep = 'email' | 'code' | 'password' | 'done'

const CODE_KEYS: Array<keyof CodeFormValues> = ['d0', 'd1', 'd2', 'd3', 'd4', 'd5']

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
            {children}
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

function BackButton({ onClick }: { onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
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
    )
}

export default function ForgotPasswordPage() {
    const navigate = useNavigate()

    const [step, setStep] = useState<ResetStep>('email')
    const [email, setEmail] = useState('')
    const [resetToken, setResetToken] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [codeNotice, setCodeNotice] = useState('')
    const [devCode, setDevCode] = useState<string | null>(null)

    const [requestCode, { isLoading: isRequestingCode }] = useForgotPasswordMutation()
    const [verifyCode, { isLoading: isVerifyingCode }] = useVerifyResetCodeMutation()
    const [resetPassword, { isLoading: isResettingPassword }] = useResetPasswordMutation()

    const emailForm = useForm<EmailFormValues>({
        resolver: zodResolver(emailSchema),
        defaultValues: { email: '' },
        mode: 'onSubmit',
    })

    const codeForm = useForm<CodeFormValues>({
        resolver: zodResolver(codeSchema),
        defaultValues: { d0: '', d1: '', d2: '', d3: '', d4: '', d5: '' },
        mode: 'onSubmit',
    })

    const passwordForm = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordSchema),
        defaultValues: { password: '', confirmPassword: '' },
        mode: 'onSubmit',
    })

    const codeInputRefs = [
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
    ]

    const passwordValue = passwordForm.watch('password') || ''
    const hasLetter = /\p{L}/u.test(passwordValue)
    const hasDigitOrSpecial = /[\d\p{P}\p{S}]/u.test(passwordValue)
    const hasValidLength = passwordValue.length >= PASSWORD_MIN && passwordValue.length <= PASSWORD_MAX

    const fillCodeFromDev = (code: string | null | undefined) => {
        if (!code) return
        code.split('').slice(0, CODE_LENGTH).forEach((digit, index) => {
            codeForm.setValue(CODE_KEYS[index], digit)
        })
    }

    const goToEmailStep = () => {
        codeForm.reset()
        passwordForm.reset()
        codeForm.clearErrors()
        passwordForm.clearErrors()
        setCodeNotice('')
        setDevCode(null)
        setStep('email')
    }

    const onEmailSubmit = async (values: EmailFormValues) => {
        const trimmed = values.email.trim()
        emailForm.clearErrors()

        try {
            const response = await requestCode({ email: trimmed }).unwrap()
            setEmail(trimmed)
            setDevCode(response.devCode ?? null)
            setCodeNotice('')
            codeForm.reset()
            fillCodeFromDev(response.devCode)
            setStep('code')
        } catch (err) {
            const parsed = apiError(err)
            if (parsed.status === 429) {
                // код уже надіслано раніше — даємо змогу ввести його
                setEmail(trimmed)
                setStep('code')
                setCodeNotice('')
                codeForm.setError('root', {
                    message: apiMessage(err, 'Код уже надіслано. Спробуйте за хвилину'),
                })
                return
            }
            emailForm.setError('email', {
                message: apiMessage(err, 'Не вдалося надіслати код. Спробуйте ще раз'),
            })
        }
    }

    const handleResend = async () => {
        codeForm.clearErrors()
        setCodeNotice('')
        try {
            const response = await requestCode({ email }).unwrap()
            setDevCode(response.devCode ?? null)
            fillCodeFromDev(response.devCode)
            setCodeNotice('Код надіслано повторно')
        } catch (err) {
            codeForm.setError('root', {
                message: apiMessage(err, 'Код уже надіслано. Спробуйте за хвилину'),
            })
        }
    }

    const handleDigitChange = (index: number, rawValue: string) => {
        const digit = rawValue.replace(/\D/g, '').slice(-1)
        codeForm.setValue(CODE_KEYS[index], digit)
        codeForm.clearErrors()
        setCodeNotice('')

        if (digit && index < CODE_LENGTH - 1) {
            codeInputRefs[index + 1].current?.focus()
        }
    }

    const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !codeForm.watch(CODE_KEYS[index]) && index > 0) {
            codeInputRefs[index - 1].current?.focus()
        }
    }

    const handleCodePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault()
        const digits = e.clipboardData
            .getData('text')
            .replace(/\D/g, '')
            .slice(0, CODE_LENGTH)
            .split('')
        if (digits.length === 0) return

        CODE_KEYS.forEach((key, index) => {
            codeForm.setValue(key, digits[index] || '')
        })
        codeForm.clearErrors()
        setCodeNotice('')
        codeInputRefs[Math.min(digits.length, CODE_LENGTH - 1)].current?.focus()
    }

    const onCodeSubmit = async (values: CodeFormValues) => {
        codeForm.clearErrors('root')
        setCodeNotice('')
        const code = CODE_KEYS.map((key) => values[key]).join('')

        try {
            const response = await verifyCode({ email, code }).unwrap()
            setResetToken(response.resetToken)
            passwordForm.reset()
            setStep('password')
        } catch (err) {
            codeForm.setError('root', { message: apiMessage(err, CODE_ERROR) })
        }
    }

    const onPasswordSubmit = async (values: PasswordFormValues) => {
        passwordForm.clearErrors('root')

        try {
            await resetPassword({ resetToken, newPassword: values.password }).unwrap()
            passwordForm.reset()
            setStep('done')
        } catch (err) {
            const parsed = apiError(err)
            if (parsed.status === 401 || parsed.data?.code === 'RESET_TOKEN_INVALID') {
                setResetToken('')
                passwordForm.setError('root', {
                    type: 'token',
                    message: apiMessage(
                        err,
                        'Сеанс відновлення прострочено. Запросіть новий код'
                    ),
                })
                return
            }
            passwordForm.setError('root', {
                message: apiMessage(err, 'Не вдалося змінити пароль. Спробуйте ще раз'),
            })
        }
    }

    if (step === 'email') {
        const hasError = Boolean(emailForm.formState.errors.email)

        return (
            <ResetShell>
                <div
                    className="w-full flex flex-col items-center"
                    style={{ maxWidth: '355px', marginTop: '70px' }}
                >
                    <Link to="/" className="shrink-0" style={{ width: '60px', height: '60px' }}>
                        <img
                            src={logoSonoraIcon}
                            alt="Sonora"
                            className="w-full h-full object-cover block"
                        />
                    </Link>

                    <h1
                        className="font-semibold text-center text-white w-full"
                        style={{ fontSize: '30px', lineHeight: '50px', marginTop: '20px' }}
                    >
                        Відновлення паролю
                    </h1>

                    <p
                        className="text-center text-white"
                        style={{ fontSize: '15px', lineHeight: '22px', marginTop: '12px' }}
                    >
                        Введіть адресу електронної пошти, і ми надішлемо код для зміни паролю
                    </p>

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
                                Електронна пошта
                            </label>

                            <div
                                className="w-full flex items-center justify-between"
                                style={{
                                    height: '50px',
                                    borderRadius: '5px',
                                    paddingLeft: '20px',
                                    paddingRight: '16px',
                                    border: hasError ? '2px solid #dc2626' : '1px solid #ffffff',
                                }}
                            >
                                <input
                                    id="reset-email"
                                    type="email"
                                    placeholder="name@domain.com"
                                    {...emailForm.register('email', {
                                        onChange: () => {
                                            if (hasError) emailForm.clearErrors('email')
                                        },
                                    })}
                                    className="w-full bg-transparent outline-none font-bold text-white"
                                    style={{ fontSize: '16px', lineHeight: '25px' }}
                                />
                                {hasError && (
                                    <div
                                        className="shrink-0 ml-2"
                                        style={{ width: '25px', height: '25px' }}
                                    >
                                        <img src={errorIcon} alt="" className="block" />
                                    </div>
                                )}
                            </div>

                            <ErrorText message={emailForm.formState.errors.email?.message} />
                        </div>

                        <button
                            type="submit"
                            disabled={isRequestingCode}
                            className="cursor-pointer flex items-center justify-center font-bold text-black bg-white transition-opacity hover:opacity-90 disabled:opacity-60"
                            style={{
                                width: '300px',
                                height: '50px',
                                borderRadius: '35px',
                                fontSize: '16px',
                                marginTop: '36px',
                            }}
                        >
                            {isRequestingCode ? 'Надсилання...' : 'Надіслати код'}
                        </button>
                    </form>

                    <Link
                        to="/login"
                        className="font-bold text-white text-center hover:underline"
                        style={{ fontSize: '16px', lineHeight: '25px', marginTop: '70px' }}
                    >
                        Повернутися до входу
                    </Link>
                </div>
            </ResetShell>
        )
    }

    if (step === 'code') {
        const hasError = Boolean(
            codeForm.formState.errors.d0 ||
                codeForm.formState.errors.d1 ||
                codeForm.formState.errors.d2 ||
                codeForm.formState.errors.d3 ||
                codeForm.formState.errors.d4 ||
                codeForm.formState.errors.d5 ||
                codeForm.formState.errors.root
        )

        return (
            <ResetShell>
                <div
                    className="w-full flex flex-col items-start"
                    style={{ maxWidth: '355px', marginTop: '110px' }}
                >
                    <div className="w-full relative flex items-start">
                        <BackButton onClick={goToEmailStep} />
                        <h1
                            className="font-bold text-white"
                            style={{ fontSize: '20px', lineHeight: '30px' }}
                        >
                            Введіть код, надісланий на вашу електронну пошту
                        </h1>
                    </div>

                    <p className="text-white" style={{ fontSize: '14px', lineHeight: '20px', marginTop: '12px' }}>
                        Лист надіслано на <span className="font-bold">{email}</span>
                    </p>

                    <form
                        onSubmit={codeForm.handleSubmit(onCodeSubmit)}
                        noValidate
                        className="w-full flex flex-col items-center"
                        style={{ marginTop: '28px' }}
                    >
                        <div className="w-full flex items-center justify-between">
                            {CODE_KEYS.map((key, index) => (
                                <input
                                    key={key}
                                    ref={codeInputRefs[index]}
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    maxLength={1}
                                    value={codeForm.watch(key)}
                                    onChange={(e) => handleDigitChange(index, e.target.value)}
                                    onKeyDown={(e) => handleDigitKeyDown(index, e)}
                                    onPaste={handleCodePaste}
                                    className="bg-transparent outline-none font-bold text-center"
                                    style={{
                                        width: '48px',
                                        height: '58px',
                                        borderRadius: '5px',
                                        fontSize: '20px',
                                        lineHeight: '24px',
                                        color: hasError ? '#dc2626' : '#ffffff',
                                        border: hasError
                                            ? '2px solid #dc2626'
                                            : '1px solid #ffffff',
                                    }}
                                />
                            ))}
                        </div>

                        <ErrorText message={codeForm.formState.errors.root?.message} />

                        {codeNotice && !hasError && (
                            <p
                                className="font-semibold w-full text-center"
                                style={{
                                    fontSize: '14px',
                                    lineHeight: '18px',
                                    color: '#10b981',
                                    marginTop: '14px',
                                }}
                            >
                                {codeNotice}
                            </p>
                        )}

                        {devCode && (
                            <p
                                className="text-center w-full"
                                style={{
                                    fontSize: '13px',
                                    lineHeight: '18px',
                                    color: '#c4a7d8',
                                    marginTop: '14px',
                                }}
                            >
                                DEV-код: <span className="font-bold">{devCode}</span>
                            </p>
                        )}

                        <button
                            type="button"
                            disabled={isRequestingCode}
                            onClick={handleResend}
                            className="cursor-pointer flex items-center justify-center font-bold text-white border border-white transition-opacity hover:opacity-85 disabled:opacity-60"
                            style={{
                                width: '230px',
                                height: '50px',
                                borderRadius: '35px',
                                fontSize: '16px',
                                marginTop: hasError ? '32px' : '40px',
                            }}
                        >
                            {isRequestingCode ? 'Надсилання...' : 'Надіслати код ще раз'}
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
                                marginTop: '24px',
                            }}
                        >
                            {isVerifyingCode ? 'Перевірка...' : 'Далі'}
                        </button>

                        <Link
                            to="/login"
                            className="font-bold text-white text-center hover:underline"
                            style={{ fontSize: '16px', lineHeight: '25px', marginTop: '56px' }}
                        >
                            Згадали пароль? Увійти
                        </Link>
                    </form>
                </div>
            </ResetShell>
        )
    }

    if (step === 'password') {
        const tokenExpired = passwordForm.formState.errors.root?.type === 'token'
        const hasError = Boolean(
            passwordForm.formState.errors.password ||
                passwordForm.formState.errors.confirmPassword ||
                passwordForm.formState.errors.root
        )

        return (
            <ResetShell>
                <div
                    className="w-full flex flex-col items-start"
                    style={{ maxWidth: '355px', marginTop: '90px' }}
                >
                    <div className="w-full relative flex items-start">
                        <BackButton
                            onClick={() => {
                                passwordForm.reset()
                                setStep('code')
                            }}
                        />
                        <h1
                            className="font-bold text-white"
                            style={{ fontSize: '20px', lineHeight: '30px' }}
                        >
                            Новий пароль
                        </h1>
                    </div>

                    <p
                        className="text-white"
                        style={{ fontSize: '14px', lineHeight: '20px', marginTop: '12px' }}
                    >
                        Для акаунта <span className="font-bold">{email}</span>
                    </p>

                    {tokenExpired ? (
                        <div className="w-full flex flex-col items-center" style={{ marginTop: '32px' }}>
                            <ErrorText message={passwordForm.formState.errors.root?.message} />
                            <button
                                type="button"
                                onClick={goToEmailStep}
                                className="cursor-pointer flex items-center justify-center font-bold text-black bg-white transition-opacity hover:opacity-90"
                                style={{
                                    width: '300px',
                                    height: '50px',
                                    borderRadius: '35px',
                                    fontSize: '16px',
                                    marginTop: '24px',
                                }}
                            >
                                Запросити новий код
                            </button>
                        </div>
                    ) : (
                        <form
                            onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                            noValidate
                            className="w-full flex flex-col items-start"
                            style={{ marginTop: '28px' }}
                        >
                            <div className="w-full flex flex-col items-start" style={{ gap: '12px' }}>
                                <label
                                    htmlFor="reset-password"
                                    className="font-bold text-white"
                                    style={{ fontSize: '16px', lineHeight: '25px' }}
                                >
                                    Новий пароль
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
                                        aria-label={showPassword ? 'Сховати пароль' : 'Показати пароль'}
                                    >
                                        <img
                                            src={showPassword ? eyeOpenIcon : eyeClosedIcon}
                                            alt=""
                                            className="block"
                                        />
                                    </button>
                                </div>

                                <ErrorText message={passwordForm.formState.errors.password?.message} />

                                <div
                                    className="w-full flex flex-col items-start"
                                    style={{ gap: '6px', marginTop: '2px' }}
                                >
                                    <Requirement fulfilled={hasValidLength}>
                                        Щонайменше 10 символів
                                    </Requirement>
                                    <Requirement fulfilled={hasLetter}>
                                        Принаймні 1 літера
                                    </Requirement>
                                    <Requirement fulfilled={hasDigitOrSpecial}>
                                        Принаймні 1 число або спеціальний символ
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
                                    Підтвердіть пароль
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
                                                ? 'Сховати пароль'
                                                : 'Показати пароль'
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
                                    message={passwordForm.formState.errors.confirmPassword?.message}
                                />
                            </div>

                            <ErrorText message={passwordForm.formState.errors.root?.message} />

                            <div className="w-full flex justify-center" style={{ marginTop: '36px' }}>
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
                                    {isResettingPassword ? 'Збереження...' : 'Змінити пароль'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </ResetShell>
        )
    }

    return (
        <ResetShell>
            <div
                className="w-full flex flex-col items-center text-center"
                style={{ maxWidth: '355px', marginTop: '120px' }}
            >
                <div style={{ width: '80px', height: '80px' }}>
                    <img src={checkCircleIcon} alt="" className="w-full h-full block" />
                </div>

                <h1
                    className="font-semibold text-white"
                    style={{ fontSize: '30px', lineHeight: '42px', marginTop: '24px' }}
                >
                    Пароль змінено
                </h1>

                <p
                    className="text-white"
                    style={{ fontSize: '16px', lineHeight: '24px', marginTop: '16px' }}
                >
                    Тепер увійдіть у свій акаунт із новим паролем
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
                    Увійти
                </button>
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
