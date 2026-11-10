import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCheckEmailMutation, useRegisterMutation } from '../services/auth/authApi'
import { setCredentials } from '../store/slices/authSlice'
import { useAppDispatch } from '../store/hooks'
import type { Gender } from '../types/IUser'

import logoSonoraIcon from '../assets/auth/logo-sonora-icon.png'
import googleIcon from '../assets/auth/google.svg'
import appleIcon from '../assets/auth/apple.svg'
import eyeClosedIcon from '../assets/auth/eye-closed.svg'
import eyeOpenIcon from '../assets/auth/eye-open.svg'
import backArrowIcon from '../assets/auth/back-arrow.svg'
import checkCircleIcon from '../assets/auth/check-circle.svg'
import checkboxCheckedIcon from '../assets/auth/checkbox-checked.svg'
import monthArrowIcon from '../assets/auth/month-arrow.svg'
import errorIcon from '../assets/auth/error-icon.svg'

const MONTHS = [
    { value: '01', label: 'Січень' },
    { value: '02', label: 'Лютий' },
    { value: '03', label: 'Березень' },
    { value: '04', label: 'Квітень' },
    { value: '05', label: 'Травень' },
    { value: '06', label: 'Червень' },
    { value: '07', label: 'Липень' },
    { value: '08', label: 'Серпень' },
    { value: '09', label: 'Вересень' },
    { value: '10', label: 'Жовтень' },
    { value: '11', label: 'Листопад' },
    { value: '12', label: 'Грудень' },
]

function formatValidBirthDate(dayStr: string, monthStr: string, yearStr: string): string | null {
    const days = parseInt(dayStr, 10)
    const months = parseInt(monthStr, 10)
    const years = parseInt(yearStr, 10)
    const currentYear = new Date().getFullYear()

    if (!dayStr || !monthStr || !yearStr || isNaN(days) || isNaN(months) || isNaN(years)) {
        return null
    }
    if (years < 1900 || years > currentYear || months < 1 || months > 12 || days < 1 || days > 31) {
        return null
    }

    const dateObj = new Date(years, months - 1, days)
    if (
        dateObj.getFullYear() !== years ||
        dateObj.getMonth() !== months - 1 ||
        dateObj.getDate() !== days
    ) {
        return null
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (dateObj >= today) {
        return null
    }

    const paddedMonth = String(months).padStart(2, '0')
    const paddedDay = String(days).padStart(2, '0')
    return `${years}-${paddedMonth}-${paddedDay}`
}

const registerSchema = z
    .object({
        email: z
            .string()
            .trim()
            .min(1, 'Введіть коректну адресу електронної пошти')
            .email('Введіть коректну адресу електронної пошти')
            .max(100, 'Введіть коректну адресу електронної пошти'),
        password: z
            .string()
            .min(10, 'Пароль має містити щонайменше 10 символів')
            .max(72, 'Пароль занадто довгий')
            .refine((val) => /\p{L}/u.test(val), 'Пароль має містити принаймні 1 літеру')
            .refine(
                (val) => /[\d\p{P}\p{S}]/u.test(val),
                'Пароль має містити принаймні 1 число або 1 спеціальний символ'
            ),
        fullName: z
            .string()
            .trim()
            .min(1, "Введіть своє ім'я")
            .max(120, "Ім'я: до 120 символів"),
        birthDay: z.string().min(1, 'Виберіть дату народження'),
        birthMonth: z.string().min(1, 'Виберіть дату народження'),
        birthYear: z.string().min(1, 'Виберіть дату народження'),
        gender: z
            .enum(['MALE', 'FEMALE', 'OTHER', 'NONEBINARY', 'UNDISCLOSED'])
            .nullable()
            .refine((val): val is Gender => val !== null, 'Оберіть стать'),
        acceptTerms: z.boolean().refine((val) => val === true, {
            message: 'Щоб продовжити, необхідно прийняти Умови використання',
        }),
        acceptNews: z.boolean(),
        acceptData: z.boolean(),
    })
    .superRefine((data, ctx) => {
        if (!formatValidBirthDate(data.birthDay, data.birthMonth, data.birthYear)) {
            ctx.addIssue({
                code: 'custom',
                path: ['birthDay'],
                message: 'Виберіть дату народження',
            })
        }
    })

type RegisterFormValues = z.input<typeof registerSchema>

export default function RegisterPage() {
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const [checkEmail, { isLoading: isCheckingEmail }] = useCheckEmailMutation()
    const [registerUser, { isLoading: isRegistering }] = useRegisterMutation()

    const [step, setStep] = useState<0 | 1 | 2 | 3>(0)
    const [showPassword, setShowPassword] = useState(false)
    const [passwordSubmitted, setPasswordSubmitted] = useState(false)

    const defaultValues: RegisterFormValues = {
        email: '',
        password: '',
        fullName: '',
        birthDay: '',
        birthMonth: '',
        birthYear: '',
        gender: null,
        acceptTerms: false,
        acceptNews: false,
        acceptData: false,
    }

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        setError,
        clearErrors,
        trigger,
        formState: { errors },
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues,
        mode: 'onSubmit',
    })

    const passwordValue = watch('password') || ''
    const genderValue = watch('gender')
    const acceptTermsValue = watch('acceptTerms')
    const acceptNewsValue = watch('acceptNews')
    const acceptDataValue = watch('acceptData')

    const hasLetter = /\p{L}/u.test(passwordValue)
    const hasDigitOrSpecial = /[\d\p{P}\p{S}]/u.test(passwordValue)
    const hasMinLength = passwordValue.length >= 10 && passwordValue.length <= 72
    const isPasswordValid = hasLetter && hasDigitOrSpecial && hasMinLength

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        clearErrors('email')

        const isEmailFormatValid = await trigger('email')
        if (!isEmailFormatValid) {
            return
        }

        const trimmed = watch('email').trim()

        try {
            const res = await checkEmail({ email: trimmed }).unwrap()
            if (res.available) {
                setStep(1)
            } else {
                setError('email', {
                    type: 'taken',
                    message:
                        'Такий користувач уже зареєстрований. Увійдіть або використайте іншу адресу',
                })
            }
        } catch (err: unknown) {
            const errorObj = err as {
                status?: number | string
                data?: { code?: string; message?: string; error?: string }
            }
            if (errorObj?.status === 409 || errorObj?.data?.code === 'EMAIL_TAKEN') {
                setError('email', {
                    type: 'taken',
                    message:
                        'Такий користувач уже зареєстрований. Увійдіть або використайте іншу адресу',
                })
            } else if (errorObj?.status === 400) {
                setError('email', {
                    type: 'invalid',
                    message:
                        errorObj?.data?.message || 'Введіть коректну адресу електронної пошти',
                })
            } else {
                setStep(1)
            }
        }
    }

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setPasswordSubmitted(true)
        const valid = await trigger('password')
        if (valid && isPasswordValid) {
            setStep(2)
        }
    }

    const handlePersonalDataSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const valid = await trigger([
            'fullName',
            'birthDay',
            'birthMonth',
            'birthYear',
            'gender',
        ])
        const birthDateFormatted = formatValidBirthDate(
            watch('birthDay'),
            watch('birthMonth'),
            watch('birthYear')
        )
        if (!birthDateFormatted) {
            setError('birthDay', {
                type: 'manual',
                message: 'Виберіть дату народження',
            })
            return
        }
        if (valid) {
            setStep(3)
        }
    }

    const onSubmit = async (data: RegisterFormValues) => {
        clearErrors('root')

        const formattedBirthDate = formatValidBirthDate(
            data.birthDay,
            data.birthMonth,
            data.birthYear
        )
        if (!formattedBirthDate || !data.gender) {
            setStep(2)
            return
        }

        try {
            const response = await registerUser({
                email: data.email.trim(),
                password: data.password,
                fullName: data.fullName.trim(),
                birthDate: formattedBirthDate,
                gender: data.gender,
            }).unwrap()

            const fallbackUsername = data.email.trim().split('@')[0] || 'user'
            const registeredUser = response.user ?? {
                id: 0,
                username: fallbackUsername,
                email: data.email.trim(),
                fullName: data.fullName.trim(),
                birthDate: formattedBirthDate,
                gender: data.gender,
                image: null,
                roles: ['USER'],
            }

            dispatch(
                setCredentials({
                    token: response.token,
                    user: {
                        ...registeredUser,
                        roles: Array.isArray(registeredUser.roles)
                            ? registeredUser.roles
                            : ['USER'],
                    },
                })
            )
            navigate('/')
        } catch (err: unknown) {
            const errorObj = err as {
                status?: number
                data?: { code?: string; message?: string; error?: string }
            }
            if (errorObj?.status === 409 || errorObj?.data?.code === 'EMAIL_TAKEN') {
                setError('email', {
                    type: 'taken',
                    message:
                        'Такий користувач уже зареєстрований. Увійдіть або використайте іншу адресу',
                })
                setStep(0)
                return
            }
            setError('root', {
                message:
                    errorObj?.data?.message ||
                    errorObj?.data?.error ||
                    'Помилка реєстрації. Спробуйте ще раз',
            })
        }
    }

    if (step === 0) {
        const isTaken = errors.email?.type === 'taken'
        const hasError = Boolean(errors.email)

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
                            marginTop: '25px',
                        }}
                    >
                        Зареєструйтеся, щоб почати слухати
                    </h1>

                    <form
                        onSubmit={handleEmailSubmit}
                        noValidate
                        className="w-full flex flex-col items-center"
                        style={{ marginTop: '54px' }}
                    >
                        <div className="w-full flex flex-col items-start" style={{ gap: '12px' }}>
                            <label
                                htmlFor="register-email"
                                className="font-bold text-white"
                                style={{ fontSize: '16px', lineHeight: '25px' }}
                            >
                                Адреса електронної пошти
                            </label>

                            <div
                                className="w-full flex items-center justify-between"
                                style={{
                                    height: '50px',
                                    borderRadius: '5px',
                                    paddingLeft: '20px',
                                    paddingRight: '16px',
                                    border: isTaken
                                        ? '2px solid #dc2626'
                                        : hasError
                                          ? '2px solid #ffffff'
                                          : '1px solid #ffffff',
                                }}
                            >
                                <input
                                    id="register-email"
                                    type="email"
                                    placeholder="name@domain.com"
                                    {...register('email', {
                                        onChange: () => {
                                            if (errors.email) clearErrors('email')
                                        },
                                    })}
                                    className="w-full bg-transparent outline-none font-bold"
                                    style={{
                                        fontSize: '16px',
                                        lineHeight: '25px',
                                        color: isTaken ? '#dc2626' : '#ffffff',
                                    }}
                                />
                                {hasError && (
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
                            style={{ marginTop: hasError ? '28px' : '40px', gap: '40px' }}
                        >
                            <button
                                type="submit"
                                disabled={isCheckingEmail}
                                className="cursor-pointer flex items-center justify-center font-bold text-black bg-white transition-opacity hover:opacity-90 disabled:opacity-60"
                                style={{
                                    width: '300px',
                                    height: '50px',
                                    borderRadius: '35px',
                                    fontSize: '16px',
                                }}
                            >
                                {isCheckingEmail ? 'Перевірка...' : 'Далі'}
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
                            Уже маєте акаунт?
                        </p>
                        <Link
                            to="/login"
                            className="font-bold text-white hover:underline"
                            style={{ fontSize: '16px', lineHeight: '25px' }}
                        >
                            Увійти
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    if (step === 1) {
        const showPasswordError = passwordSubmitted && !isPasswordValid

        return (
            <div
                className="min-h-screen w-full flex flex-col items-center px-4 py-12 text-white"
                style={{ backgroundColor: '#280a3a', fontFamily: "'Inter', sans-serif" }}
            >
                <div className="w-full flex flex-col items-center" style={{ maxWidth: '355px', marginTop: '45px' }}>
                    <Link to="/" className="shrink-0" style={{ width: '55px', height: '55px' }}>
                        <img
                            src={logoSonoraIcon}
                            alt="Sonora"
                            className="w-full h-full object-cover block"
                        />
                    </Link>

                    <div
                        className="w-full relative border border-white"
                        style={{
                            height: '10px',
                            borderRadius: '5px',
                            marginTop: '30px',
                        }}
                    >
                        <div
                            style={{
                                width: '120px',
                                height: '100%',
                                borderRadius: '5px',
                                backgroundColor: '#10b981',
                            }}
                        />
                    </div>

                    <div className="w-full relative flex flex-col items-start" style={{ marginTop: '24px' }}>
                        <button
                            type="button"
                            onClick={() => setStep(0)}
                            aria-label="Назад"
                            className="cursor-pointer flex items-center justify-center mb-3 sm:mb-0"
                            style={{
                                position: 'absolute',
                                left: '-42px',
                                top: '6px',
                                width: '24px',
                                height: '24px',
                            }}
                        >
                            <img src={backArrowIcon} alt="" className="block" />
                        </button>

                        <p className="font-normal text-white" style={{ fontSize: '14px', lineHeight: '20px' }}>
                            Крок 1 з 3
                        </p>
                        <h1
                            className="font-bold text-white"
                            style={{ fontSize: '16px', lineHeight: '25px', marginTop: '4px' }}
                        >
                            Створіть пароль
                        </h1>
                    </div>

                    <form
                        onSubmit={handlePasswordSubmit}
                        noValidate
                        className="w-full flex flex-col items-start"
                        style={{ marginTop: '22px' }}
                    >
                        <label
                            htmlFor="register-password"
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
                                marginTop: '12px',
                                paddingLeft: '20px',
                                paddingRight: '15px',
                                border: showPasswordError ? '2px solid #dc2626' : '1px solid #ffffff',
                            }}
                        >
                            <input
                                id="register-password"
                                type={showPassword ? 'text' : 'password'}
                                {...register('password')}
                                className="w-full bg-transparent outline-none font-bold"
                                style={{
                                    fontSize: '16px',
                                    lineHeight: '25px',
                                    color: showPasswordError ? '#dc2626' : '#ffffff',
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

                        <div className="w-full flex flex-col items-start" style={{ marginTop: '28px' }}>
                            <p className="font-bold text-white" style={{ fontSize: '16px', lineHeight: '25px' }}>
                                Пароль має містити принаймні:
                            </p>

                            <div className="w-full flex flex-col" style={{ marginTop: '16px', gap: '16px' }}>
                                <div className="flex items-center" style={{ gap: '10px' }}>
                                    {hasLetter ? (
                                        <span className="shrink-0" style={{ width: '20px', height: '20px' }}>
                                            <img src={checkCircleIcon} alt="" className="block" />
                                        </span>
                                    ) : (
                                        <span
                                            className="shrink-0 rounded-full border-2 border-white"
                                            style={{ width: '20px', height: '20px' }}
                                        />
                                    )}
                                    <span
                                        className="font-normal"
                                        style={{
                                            fontSize: '14px',
                                            lineHeight: '20px',
                                            color: passwordSubmitted && !hasLetter ? '#dc2626' : '#ffffff',
                                        }}
                                    >
                                        1 літеру
                                    </span>
                                </div>

                                <div className="flex items-start" style={{ gap: '10px' }}>
                                    {hasDigitOrSpecial ? (
                                        <span
                                            className="shrink-0"
                                            style={{ width: '20px', height: '20px', marginTop: '2px' }}
                                        >
                                            <img src={checkCircleIcon} alt="" className="block" />
                                        </span>
                                    ) : (
                                        <span
                                            className="shrink-0 rounded-full border-2 border-white"
                                            style={{ width: '20px', height: '20px', marginTop: '2px' }}
                                        />
                                    )}
                                    <span
                                        className="font-normal"
                                        style={{
                                            fontSize: '14px',
                                            lineHeight: '20px',
                                            color:
                                                passwordSubmitted && !hasDigitOrSpecial
                                                    ? '#dc2626'
                                                    : '#ffffff',
                                        }}
                                    >
                                        1 число або 1 спеціальний символ (наприклад: #?!&)
                                    </span>
                                </div>

                                <div className="flex items-center" style={{ gap: '10px' }}>
                                    {hasMinLength ? (
                                        <span className="shrink-0" style={{ width: '20px', height: '20px' }}>
                                            <img src={checkCircleIcon} alt="" className="block" />
                                        </span>
                                    ) : (
                                        <span
                                            className="shrink-0 rounded-full border-2 border-white"
                                            style={{ width: '20px', height: '20px' }}
                                        />
                                    )}
                                    <span
                                        className="font-normal"
                                        style={{
                                            fontSize: '14px',
                                            lineHeight: '20px',
                                            color: passwordSubmitted && !hasMinLength ? '#dc2626' : '#ffffff',
                                        }}
                                    >
                                        10 символів
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="w-full flex justify-center" style={{ marginTop: '48px' }}>
                            <button
                                type="submit"
                                className="cursor-pointer flex items-center justify-center font-bold text-black bg-white transition-opacity hover:opacity-90"
                                style={{
                                    width: '300px',
                                    height: '50px',
                                    borderRadius: '35px',
                                    fontSize: '16px',
                                }}
                            >
                                Далі
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )
    }

    if (step === 2) {
        const showNameError = Boolean(errors.fullName)
        const showBirthDateError = Boolean(
            errors.birthDay || errors.birthMonth || errors.birthYear
        )
        const showGenderError = Boolean(errors.gender)

        return (
            <div
                className="min-h-screen w-full flex flex-col items-center px-4 py-12 text-white"
                style={{ backgroundColor: '#280a3a', fontFamily: "'Inter', sans-serif" }}
            >
                <div className="w-full flex flex-col items-center" style={{ maxWidth: '355px', marginTop: '45px' }}>
                    <Link to="/" className="shrink-0" style={{ width: '55px', height: '55px' }}>
                        <img
                            src={logoSonoraIcon}
                            alt="Sonora"
                            className="w-full h-full object-cover block"
                        />
                    </Link>

                    <div
                        className="w-full relative border border-white"
                        style={{
                            height: '10px',
                            borderRadius: '5px',
                            marginTop: '30px',
                        }}
                    >
                        <div
                            style={{
                                width: '240px',
                                height: '100%',
                                borderRadius: '5px',
                                backgroundColor: '#10b981',
                            }}
                        />
                    </div>

                    <div className="w-full relative flex flex-col items-start" style={{ marginTop: '24px' }}>
                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            aria-label="Назад"
                            className="cursor-pointer flex items-center justify-center"
                            style={{
                                position: 'absolute',
                                left: '-42px',
                                top: '6px',
                                width: '24px',
                                height: '24px',
                            }}
                        >
                            <img src={backArrowIcon} alt="" className="block" />
                        </button>

                        <p className="font-normal text-white" style={{ fontSize: '14px', lineHeight: '20px' }}>
                            Крок 2 з 3
                        </p>
                        <h1
                            className="font-bold text-white"
                            style={{ fontSize: '16px', lineHeight: '25px', marginTop: '4px' }}
                        >
                            Розкажіть про себе
                        </h1>
                    </div>

                    <form
                        onSubmit={handlePersonalDataSubmit}
                        noValidate
                        className="w-full flex flex-col items-start"
                        style={{ marginTop: '20px' }}
                    >
                        <div className="w-full flex flex-col items-start">
                            <label
                                htmlFor="register-fullname"
                                className="font-bold text-white"
                                style={{ fontSize: '16px', lineHeight: '25px' }}
                            >
                                Ім&apos;я
                            </label>
                            <p
                                className="font-normal text-white"
                                style={{ fontSize: '14px', lineHeight: '20px', marginTop: '2px' }}
                            >
                                Це ім&apos;я відображатиметься в профілі
                            </p>

                            <input
                                id="register-fullname"
                                type="text"
                                {...register('fullName', {
                                    onChange: () => {
                                        if (errors.fullName) clearErrors('fullName')
                                    },
                                })}
                                className="w-full bg-transparent outline-none font-bold text-white"
                                style={{
                                    height: '50px',
                                    borderRadius: '5px',
                                    marginTop: '10px',
                                    paddingLeft: '20px',
                                    paddingRight: '20px',
                                    fontSize: '16px',
                                    lineHeight: '25px',
                                    border: showNameError ? '1px solid #dc2626' : '1px solid #ffffff',
                                }}
                            />

                            {showNameError && (
                                <p
                                    className="font-semibold"
                                    style={{
                                        fontSize: '14px',
                                        lineHeight: '18px',
                                        color: '#dc2626',
                                        marginTop: '10px',
                                    }}
                                >
                                    {errors.fullName?.message || "Введіть своє ім'я"}
                                </p>
                            )}
                        </div>

                        <div className="w-full flex flex-col items-start" style={{ marginTop: '28px' }}>
                            <label
                                className="font-bold text-white"
                                style={{ fontSize: '16px', lineHeight: '25px' }}
                            >
                                Дата народження
                            </label>

                            {showBirthDateError && (
                                <p
                                    className="font-semibold"
                                    style={{
                                        fontSize: '14px',
                                        lineHeight: '18px',
                                        color: '#dc2626',
                                        marginTop: '6px',
                                    }}
                                >
                                    Виберіть дату народження
                                </p>
                            )}

                            <div
                                className="w-full flex items-center justify-between"
                                style={{ marginTop: '12px', gap: '16px' }}
                            >
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={2}
                                    placeholder="дд"
                                    {...register('birthDay', {
                                        onChange: (e) => {
                                            e.target.value = e.target.value.replace(/\D/g, '')
                                            clearErrors(['birthDay', 'birthMonth', 'birthYear'])
                                        },
                                    })}
                                    className="bg-transparent outline-none font-normal text-white"
                                    style={{
                                        width: '74px',
                                        height: '50px',
                                        borderRadius: '5px',
                                        paddingLeft: '20px',
                                        paddingRight: '15px',
                                        fontSize: '16px',
                                        lineHeight: '30px',
                                        border: showBirthDateError ? '1px solid #dc2626' : '1px solid #ffffff',
                                    }}
                                />

                                <div
                                    className="relative flex items-center"
                                    style={{
                                        width: '140px',
                                        height: '51px',
                                        borderRadius: '5px',
                                        border: showBirthDateError ? '1px solid #dc2626' : '1px solid #ffffff',
                                    }}
                                >
                                    <select
                                        {...register('birthMonth', {
                                            onChange: () => {
                                                clearErrors(['birthDay', 'birthMonth', 'birthYear'])
                                            },
                                        })}
                                        className="w-full h-full bg-transparent outline-none appearance-none font-normal text-white cursor-pointer"
                                        style={{
                                            paddingLeft: '14px',
                                            paddingRight: '36px',
                                            fontSize: '16px',
                                            lineHeight: '30px',
                                        }}
                                    >
                                        <option value="" disabled style={{ backgroundColor: '#280a3a', color: '#ffffff' }}>
                                            Місяць
                                        </option>
                                        {MONTHS.map((month) => (
                                            <option
                                                key={month.value}
                                                value={month.value}
                                                style={{ backgroundColor: '#280a3a', color: '#ffffff' }}
                                            >
                                                {month.label}
                                            </option>
                                        ))}
                                    </select>
                                    <span
                                        className="pointer-events-none absolute flex items-center justify-center"
                                        style={{ right: '14px', width: '20px', height: '12px' }}
                                    >
                                        <img src={monthArrowIcon} alt="" className="block w-full h-auto" />
                                    </span>
                                </div>

                                <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={4}
                                    placeholder="рррр"
                                    {...register('birthYear', {
                                        onChange: (e) => {
                                            e.target.value = e.target.value.replace(/\D/g, '')
                                            clearErrors(['birthDay', 'birthMonth', 'birthYear'])
                                        },
                                    })}
                                    className="bg-transparent outline-none font-normal text-white"
                                    style={{
                                        width: '100px',
                                        height: '50px',
                                        borderRadius: '5px',
                                        paddingLeft: '20px',
                                        paddingRight: '15px',
                                        fontSize: '16px',
                                        lineHeight: '30px',
                                        border: showBirthDateError ? '1px solid #dc2626' : '1px solid #ffffff',
                                    }}
                                />
                            </div>
                        </div>

                        <div className="w-full flex flex-col items-start" style={{ marginTop: '28px' }}>
                            <p className="font-bold text-white" style={{ fontSize: '16px', lineHeight: '25px' }}>
                                Стать
                            </p>

                            <div
                                className="w-full flex flex-wrap items-center"
                                style={{ marginTop: '14px', columnGap: '24px', rowGap: '18px' }}
                            >
                                {(
                                    [
                                        { value: 'MALE' as Gender, label: 'Чоловік' },
                                        { value: 'FEMALE' as Gender, label: 'Жінка' },
                                        { value: 'NONEBINARY' as Gender, label: 'Небінарна' },
                                        { value: 'OTHER' as Gender, label: 'Інше' },
                                        { value: 'UNDISCLOSED' as Gender, label: 'Не хочу вказувати' },
                                    ]
                                ).map((option) => {
                                    const isSelected = genderValue === option.value
                                    return (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => {
                                                setValue('gender', option.value)
                                                clearErrors('gender')
                                            }}
                                            className="cursor-pointer flex items-center text-left"
                                            style={{ gap: '10px' }}
                                        >
                                            <span
                                                className="shrink-0 rounded-full"
                                                style={{
                                                    width: '20px',
                                                    height: '20px',
                                                    border: isSelected
                                                        ? '4px solid #10b981'
                                                        : showGenderError
                                                          ? '2px solid #dc2626'
                                                          : '2px solid #ffffff',
                                                }}
                                            />
                                            <span
                                                className="font-normal text-white"
                                                style={{ fontSize: '14px', lineHeight: '20px' }}
                                            >
                                                {option.label}
                                            </span>
                                        </button>
                                    )
                                })}
                            </div>

                            {showGenderError && (
                                <p
                                    className="font-semibold"
                                    style={{
                                        fontSize: '14px',
                                        lineHeight: '18px',
                                        color: '#dc2626',
                                        marginTop: '10px',
                                    }}
                                >
                                    {errors.gender?.message || 'Оберіть стать'}
                                </p>
                            )}
                        </div>

                        <div className="w-full flex justify-center" style={{ marginTop: '45px' }}>
                            <button
                                type="submit"
                                className="cursor-pointer flex items-center justify-center font-bold text-black bg-white transition-opacity hover:opacity-90"
                                style={{
                                    width: '300px',
                                    height: '50px',
                                    borderRadius: '35px',
                                    fontSize: '16px',
                                }}
                            >
                                Далі
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )
    }

    const termsError = Boolean(errors.acceptTerms)

    return (
        <div
            className="min-h-screen w-full flex flex-col items-center px-4 py-12 text-white"
            style={{ backgroundColor: '#280a3a', fontFamily: "'Inter', sans-serif" }}
        >
            <div className="w-full flex flex-col items-center" style={{ maxWidth: '355px', marginTop: '45px' }}>
                <Link to="/" className="shrink-0" style={{ width: '55px', height: '55px' }}>
                    <img
                        src={logoSonoraIcon}
                        alt="Sonora"
                        className="w-full h-full object-cover block"
                    />
                </Link>

                <div
                    className="w-full relative border border-white"
                    style={{
                        height: '10px',
                        borderRadius: '5px',
                        marginTop: '30px',
                    }}
                >
                    <div
                        style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: '5px',
                            backgroundColor: '#10b981',
                        }}
                    />
                </div>

                <div className="w-full relative flex flex-col items-start" style={{ marginTop: '24px' }}>
                    <button
                        type="button"
                        onClick={() => setStep(2)}
                        aria-label="Назад"
                        className="cursor-pointer flex items-center justify-center"
                        style={{
                            position: 'absolute',
                            left: '-42px',
                            top: '6px',
                            width: '24px',
                            height: '24px',
                        }}
                    >
                        <img src={backArrowIcon} alt="" className="block" />
                    </button>

                    <p className="font-normal text-white" style={{ fontSize: '14px', lineHeight: '20px' }}>
                        Крок 3 з 3
                    </p>
                    <h1
                        className="font-bold text-white"
                        style={{ fontSize: '16px', lineHeight: '25px', marginTop: '4px' }}
                    >
                        Умови використання
                    </h1>
                </div>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    noValidate
                    className="w-full flex flex-col items-start"
                    style={{ marginTop: '28px' }}
                >
                    <div className="w-full flex flex-col" style={{ gap: '20px' }}>
                        <div className="w-full flex flex-col">
                            <button
                                type="button"
                                onClick={() => {
                                    setValue('acceptTerms', !acceptTermsValue)
                                    if (errors.acceptTerms) clearErrors('acceptTerms')
                                }}
                                className="cursor-pointer flex items-start text-left w-full"
                                style={{ gap: '10px' }}
                            >
                                {acceptTermsValue ? (
                                    <span
                                        className="shrink-0"
                                        style={{ width: '20px', height: '20px', marginTop: '2px' }}
                                    >
                                        <img src={checkboxCheckedIcon} alt="" className="block" />
                                    </span>
                                ) : (
                                    <span
                                        className="shrink-0"
                                        style={{
                                            width: '20px',
                                            height: '20px',
                                            marginTop: '2px',
                                            borderRadius: '5px',
                                            border: termsError ? '2px solid #dc2626' : '2px solid #ffffff',
                                        }}
                                    />
                                )}
                                <span
                                    className="font-normal text-white"
                                    style={{ fontSize: '14px', lineHeight: '20px' }}
                                >
                                    Я погоджуюся з Умовами використання та Політикою конфідеційності
                                </span>
                            </button>

                            {termsError && (
                                <p
                                    className="font-semibold"
                                    style={{
                                        fontSize: '14px',
                                        lineHeight: '18px',
                                        color: '#dc2626',
                                        marginTop: '10px',
                                    }}
                                >
                                    {errors.acceptTerms?.message ||
                                        'Щоб продовжити, необхідно прийняти Умови використання'}
                                </p>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() => setValue('acceptNews', !acceptNewsValue)}
                            className="cursor-pointer flex items-start text-left w-full"
                            style={{ gap: '10px' }}
                        >
                            {acceptNewsValue ? (
                                <span
                                    className="shrink-0"
                                    style={{ width: '20px', height: '20px', marginTop: '2px' }}
                                >
                                    <img src={checkboxCheckedIcon} alt="" className="block" />
                                </span>
                            ) : (
                                <span
                                    className="shrink-0 border-2 border-white"
                                    style={{
                                        width: '20px',
                                        height: '20px',
                                        marginTop: '2px',
                                        borderRadius: '5px',
                                    }}
                                />
                            )}
                            <span
                                className="font-normal text-white"
                                style={{ fontSize: '14px', lineHeight: '20px' }}
                            >
                                Я погоджуюся отримувати новини та персональні пропозиції
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setValue('acceptData', !acceptDataValue)}
                            className="cursor-pointer flex items-start text-left w-full"
                            style={{ gap: '10px' }}
                        >
                            {acceptDataValue ? (
                                <span
                                    className="shrink-0"
                                    style={{ width: '20px', height: '20px', marginTop: '2px' }}
                                >
                                    <img src={checkboxCheckedIcon} alt="" className="block" />
                                </span>
                            ) : (
                                <span
                                    className="shrink-0 border-2 border-white"
                                    style={{
                                        width: '20px',
                                        height: '20px',
                                        marginTop: '2px',
                                        borderRadius: '5px',
                                    }}
                                />
                            )}
                            <span
                                className="font-normal text-white"
                                style={{ fontSize: '14px', lineHeight: '20px' }}
                            >
                                Я погоджуюся на обробку моїх даних для покращення сервісу (необов&apos;язково)
                            </span>
                        </button>
                    </div>

                    {errors.root?.message && (
                        <p
                            className="font-semibold w-full"
                            style={{
                                fontSize: '14px',
                                lineHeight: '18px',
                                color: '#dc2626',
                                marginTop: '16px',
                            }}
                        >
                            {errors.root.message}
                        </p>
                    )}

                    <div className="w-full flex justify-center" style={{ marginTop: '48px' }}>
                        <button
                            type="submit"
                            disabled={isRegistering}
                            className="cursor-pointer flex items-center justify-center font-bold text-black bg-white transition-opacity hover:opacity-90 disabled:opacity-60"
                            style={{
                                width: '300px',
                                height: '50px',
                                borderRadius: '35px',
                                fontSize: '16px',
                            }}
                        >
                            {isRegistering ? 'Зачекайте...' : 'Зареєструватися'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
