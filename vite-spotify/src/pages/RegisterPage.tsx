import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
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

const MONTH_VALUES = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'] as const
const GENDER_KEYS: Gender[] = ['MALE', 'FEMALE', 'NONEBINARY', 'OTHER', 'UNDISCLOSED']

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

function buildRegisterSchema(t: TFunction) {
    const birthRequired = t('register.errors.birthRequired')
    return z
        .object({
            email: z
                .string()
                .trim()
                .min(1, t('register.errors.emailInvalid'))
                .email(t('register.errors.emailInvalid'))
                .max(100, t('register.errors.emailInvalid')),
            password: z
                .string()
                .min(10, t('register.errors.passwordMin'))
                .max(72, t('register.errors.passwordMax'))
                .refine((val) => /\p{L}/u.test(val), t('register.errors.passwordLetter'))
                .refine(
                    (val) => /[\d\p{P}\p{S}]/u.test(val),
                    t('register.errors.passwordDigitOrSpecial')
                ),
            fullName: z
                .string()
                .trim()
                .min(1, t('register.errors.nameRequired'))
                .max(120, t('register.errors.nameMax')),
            birthDay: z.string().min(1, birthRequired),
            birthMonth: z.string().min(1, birthRequired),
            birthYear: z.string().min(1, birthRequired),
            gender: z
                .enum(['MALE', 'FEMALE', 'OTHER', 'NONEBINARY', 'UNDISCLOSED'])
                .nullable()
                .refine((val): val is Gender => val !== null, t('register.errors.genderRequired')),
            acceptTerms: z.boolean().refine((val) => val === true, {
                message: t('register.errors.termsRequired'),
            }),
            acceptNews: z.boolean(),
            acceptData: z.boolean(),
        })
        .superRefine((data, ctx) => {
            if (!formatValidBirthDate(data.birthDay, data.birthMonth, data.birthYear)) {
                ctx.addIssue({
                    code: 'custom',
                    path: ['birthDay'],
                    message: birthRequired,
                })
            }
        })
}

type RegisterFormValues = z.input<ReturnType<typeof buildRegisterSchema>>

export default function RegisterPage() {
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const { t } = useTranslation()
    const [checkEmail, { isLoading: isCheckingEmail }] = useCheckEmailMutation()
    const [registerUser, { isLoading: isRegistering }] = useRegisterMutation()

    const registerSchema = useMemo(() => buildRegisterSchema(t), [t])

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
                    message: t('register.errors.emailTaken'),
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
                    message: t('register.errors.emailTaken'),
                })
            } else if (errorObj?.status === 400) {
                setError('email', {
                    type: 'invalid',
                    message: errorObj?.data?.message || t('register.errors.emailInvalid'),
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
                message: t('register.errors.birthRequired'),
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
                    message: t('register.errors.emailTaken'),
                })
                setStep(0)
                return
            }
            setError('root', {
                message:
                    errorObj?.data?.message ||
                    errorObj?.data?.error ||
                    t('register.errors.generic'),
            })
        }
    }

    if (step === 0) {
        const isTaken = errors.email?.type === 'taken'
        const hasError = Boolean(errors.email)

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

                    <h1 className="font-semibold text-center text-white w-full text-3xl leading-12 mt-6">
                        {t('register.emailTitle')}
                    </h1>

                    <form
                        onSubmit={handleEmailSubmit}
                        noValidate
                        className="w-full flex flex-col items-center mt-14"
                    >
                        <div className="w-full flex flex-col items-start gap-3">
                            <label
                                htmlFor="register-email"
                                className="font-bold text-white text-base leading-6"
                            >
                                {t('register.emailLabel')}
                            </label>

                            <div
                                className={`w-full flex items-center justify-between h-12.5 rounded pl-5 pr-4 ${
                                    isTaken
                                        ? 'border-2 border-red-600'
                                        : hasError
                                          ? 'border-2 border-white'
                                          : 'border border-white'
                                }`}
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
                                    className={`w-full bg-transparent outline-none font-bold text-base leading-6 ${
                                        isTaken ? 'text-red-600' : 'text-white'
                                    }`}
                                />
                                {hasError && (
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

                        <div
                            className={`w-full flex flex-col items-center gap-10 ${
                                hasError ? 'mt-7' : 'mt-10'
                            }`}
                        >
                            <button
                                type="submit"
                                disabled={isCheckingEmail}
                                className="cursor-pointer flex items-center justify-center font-bold text-black bg-white transition-opacity hover:opacity-90 disabled:opacity-60 w-75 h-12.5 rounded-full text-base"
                            >
                                {isCheckingEmail ? t('register.checking') : t('register.next')}
                            </button>

                            <p className="font-bold text-center text-white text-base leading-6">
                                {t('register.or')}
                            </p>
                        </div>
                    </form>

                    <div className="w-full flex flex-col mt-10 gap-3.5">
                        <button
                            type="button"
                            className="cursor-pointer w-full flex items-center justify-between border border-white text-white font-semibold transition-opacity hover:opacity-85 h-14 rounded-full px-5 text-base leading-6"
                        >
                            <span className="shrink-0 w-5 h-5">
                                <img src={googleIcon} alt={t('register.google')} className="block" />
                            </span>
                            <span className="flex-1 text-center">
                                {t('register.signUpWithGoogle1')} {t('register.google')}
                            </span>
                        </button>

                        <button
                            type="button"
                            className="cursor-pointer w-full flex items-center justify-between border border-white text-white font-semibold transition-opacity hover:opacity-85 h-14 rounded-full px-5 text-base leading-6"
                        >
                            <span className="shrink-0 w-5 h-5.5">
                                <img src={appleIcon} alt="Apple" className="block" />
                            </span>
                            <span className="flex-1 text-center">{t('register.loginWithApple')}</span>
                        </button>
                    </div>

                    <div className="w-full flex flex-col items-center text-center mt-18 gap-4">
                        <p className="font-normal text-white text-base leading-7">
                            {t('register.haveAccount')}
                        </p>
                        <Link
                            to="/login"
                            className="font-bold text-white hover:underline text-base leading-6"
                        >
                            {t('register.logIn')}
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    if (step === 1) {
        const showPasswordError = passwordSubmitted && !isPasswordValid

        return (
            <div className="min-h-screen w-full flex flex-col items-center px-4 py-12 text-white bg-sonora-dark font-inter">
                <div className="w-full flex flex-col items-center max-w-sm mt-11">
                    <Link to="/player" className="shrink-0 w-14 h-14">
                        <img
                            src={logoSonoraIcon}
                            alt="Sonora"
                            className="w-full h-full object-cover block"
                        />
                    </Link>

                    <div className="w-full relative border border-white h-2.5 rounded mt-7.5">
                        <div className="w-1/3 h-full rounded bg-emerald-500" />
                    </div>

                    <div className="w-full relative flex flex-col items-start mt-6">
                        <button
                            type="button"
                            onClick={() => setStep(0)}
                            aria-label={t('register.back')}
                            className="cursor-pointer flex items-center justify-center mb-3 sm:mb-0 absolute -left-10.5 top-1.5 w-6 h-6"
                        >
                            <img src={backArrowIcon} alt="" className="block" />
                        </button>

                        <p className="font-normal text-white text-sm leading-5">
                            {t('register.stepOf1')}
                        </p>
                        <h1 className="font-bold text-white text-base leading-6 mt-1">
                            {t('register.passwordTitle')}
                        </h1>
                    </div>

                    <form
                        onSubmit={handlePasswordSubmit}
                        noValidate
                        className="w-full flex flex-col items-start mt-5.5"
                    >
                        <label
                            htmlFor="register-password"
                            className="font-bold text-white text-base leading-6"
                        >
                            {t('register.passwordLabel')}
                        </label>

                        <div
                            className={`w-full flex items-center justify-between h-12.5 rounded mt-3 pl-5 pr-4 ${
                                showPasswordError ? 'border-2 border-red-600' : 'border border-white'
                            }`}
                        >
                            <input
                                id="register-password"
                                type={showPassword ? 'text' : 'password'}
                                {...register('password')}
                                className={`w-full bg-transparent outline-none font-bold text-base leading-6 ${
                                    showPasswordError ? 'text-red-600' : 'text-white'
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

                        <div className="w-full flex flex-col items-start mt-7">
                            <p className="font-bold text-white text-base leading-6">
                                {t('register.passwordRequirements')}
                            </p>

                            <div className="w-full flex flex-col mt-4 gap-4">
                                <div className="flex items-center gap-2.5">
                                    {hasLetter ? (
                                        <span className="shrink-0 w-5 h-5">
                                            <img src={checkCircleIcon} alt="" className="block" />
                                        </span>
                                    ) : (
                                        <span className="shrink-0 rounded-full border-2 border-white w-5 h-5" />
                                    )}
                                    <span
                                        className={`font-normal text-sm leading-5 ${
                                            passwordSubmitted && !hasLetter ? 'text-red-600' : 'text-white'
                                        }`}
                                    >
                                        {t('register.reqLetter')}
                                    </span>
                                </div>

                                <div className="flex items-start gap-2.5">
                                    {hasDigitOrSpecial ? (
                                        <span className="shrink-0 w-5 h-5 mt-0.5">
                                            <img src={checkCircleIcon} alt="" className="block" />
                                        </span>
                                    ) : (
                                        <span className="shrink-0 rounded-full border-2 border-white w-5 h-5 mt-0.5" />
                                    )}
                                    <span
                                        className={`font-normal text-sm leading-5 ${
                                            passwordSubmitted && !hasDigitOrSpecial ? 'text-red-600' : 'text-white'
                                        }`}
                                    >
                                        {t('register.reqDigitOrSpecial')}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2.5">
                                    {hasMinLength ? (
                                        <span className="shrink-0 w-5 h-5">
                                            <img src={checkCircleIcon} alt="" className="block" />
                                        </span>
                                    ) : (
                                        <span className="shrink-0 rounded-full border-2 border-white w-5 h-5" />
                                    )}
                                    <span
                                        className={`font-normal text-sm leading-5 ${
                                            passwordSubmitted && !hasMinLength ? 'text-red-600' : 'text-white'
                                        }`}
                                    >
                                        {t('register.reqLength')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="w-full flex justify-center mt-12">
                            <button
                                type="submit"
                                className="cursor-pointer flex items-center justify-center font-bold text-black bg-white transition-opacity hover:opacity-90 w-75 h-12.5 rounded-full text-base"
                            >
                                {t('register.next')}
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
            <div className="min-h-screen w-full flex flex-col items-center px-4 py-12 text-white bg-sonora-dark font-inter">
                <div className="w-full flex flex-col items-center max-w-sm mt-11">
                    <Link to="/player" className="shrink-0 w-14 h-14">
                        <img
                            src={logoSonoraIcon}
                            alt="Sonora"
                            className="w-full h-full object-cover block"
                        />
                    </Link>

                    <div className="w-full relative border border-white h-2.5 rounded mt-7.5">
                        <div className="w-2/3 h-full rounded bg-emerald-500" />
                    </div>

                    <div className="w-full relative flex flex-col items-start mt-6">
                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            aria-label={t('register.back')}
                            className="cursor-pointer flex items-center justify-center absolute -left-10.5 top-1.5 w-6 h-6"
                        >
                            <img src={backArrowIcon} alt="" className="block" />
                        </button>

                        <p className="font-normal text-white text-sm leading-5">
                            {t('register.stepOf2')}
                        </p>
                        <h1 className="font-bold text-white text-base leading-6 mt-1">
                            {t('register.personalTitle')}
                        </h1>
                    </div>

                    <form
                        onSubmit={handlePersonalDataSubmit}
                        noValidate
                        className="w-full flex flex-col items-start mt-5"
                    >
                        <div className="w-full flex flex-col items-start">
                            <label
                                htmlFor="register-fullname"
                                className="font-bold text-white text-base leading-6"
                            >
                                {t('register.nameLabel')}
                            </label>
                            <p className="font-normal text-white text-sm leading-5 mt-0.5">
                                {t('register.nameHint')}
                            </p>

                            <input
                                id="register-fullname"
                                type="text"
                                {...register('fullName', {
                                    onChange: () => {
                                        if (errors.fullName) clearErrors('fullName')
                                    },
                                })}
                                className={`w-full bg-transparent outline-none font-bold text-white h-12.5 rounded mt-2.5 px-5 text-base leading-6 ${
                                    showNameError ? 'border border-red-600' : 'border border-white'
                                }`}
                            />

                            {showNameError && (
                                <p className="font-semibold text-sm leading-snug text-red-600 mt-2.5">
                                    {errors.fullName?.message || t('register.errors.nameRequired')}
                                </p>
                            )}
                        </div>

                        <div className="w-full flex flex-col items-start mt-7">
                            <label className="font-bold text-white text-base leading-6">
                                {t('register.birthLabel')}
                            </label>

                            {showBirthDateError && (
                                <p className="font-semibold text-sm leading-snug text-red-600 mt-1.5">
                                    {t('register.errors.birthRequired')}
                                </p>
                            )}

                            <div className="w-full flex items-center justify-between mt-3 gap-4">
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={2}
                                    placeholder={t('register.dayPlaceholder')}
                                    {...register('birthDay', {
                                        onChange: (e) => {
                                            e.target.value = e.target.value.replace(/\D/g, '')
                                            clearErrors(['birthDay', 'birthMonth', 'birthYear'])
                                        },
                                    })}
                                    className={`bg-transparent outline-none font-normal text-white w-18.5 h-12.5 rounded pl-5 pr-4 text-base leading-7.5 ${
                                        showBirthDateError ? 'border border-red-600' : 'border border-white'
                                    }`}
                                />

                                <div
                                    className={`relative flex items-center w-35 h-12.5 rounded ${
                                        showBirthDateError ? 'border border-red-600' : 'border border-white'
                                    }`}
                                >
                                    <select
                                        {...register('birthMonth', {
                                            onChange: () => {
                                                clearErrors(['birthDay', 'birthMonth', 'birthYear'])
                                            },
                                        })}
                                        className="w-full h-full bg-transparent outline-none appearance-none font-normal text-white cursor-pointer pl-3.5 pr-9 text-base leading-7.5"
                                    >
                                        <option value="" disabled className="bg-sonora-dark text-white">
                                            {t('register.monthPlaceholder')}
                                        </option>
                                        {MONTH_VALUES.map((value, index) => (
                                            <option
                                                key={value}
                                                value={value}
                                                className="bg-sonora-dark text-white"
                                            >
                                                {t(`register.months.${index}`)}
                                            </option>
                                        ))}
                                    </select>
                                    <span className="pointer-events-none absolute right-3.5 w-5 h-3 flex items-center justify-center">
                                        <img src={monthArrowIcon} alt="" className="block w-full h-auto" />
                                    </span>
                                </div>

                                <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={4}
                                    placeholder={t('register.yearPlaceholder')}
                                    {...register('birthYear', {
                                        onChange: (e) => {
                                            e.target.value = e.target.value.replace(/\D/g, '')
                                            clearErrors(['birthDay', 'birthMonth', 'birthYear'])
                                        },
                                    })}
                                    className={`bg-transparent outline-none font-normal text-white w-25 h-12.5 rounded pl-5 pr-4 text-base leading-7.5 ${
                                        showBirthDateError ? 'border border-red-600' : 'border border-white'
                                    }`}
                                />
                            </div>
                        </div>

                        <div className="w-full flex flex-col items-start mt-7">
                            <p className="font-bold text-white text-base leading-6">
                                {t('register.genderLabel')}
                            </p>

                            <div className="w-full flex flex-wrap items-center mt-3.5 gap-x-6 gap-y-4.5">
                                {GENDER_KEYS.map((genderKey) => {
                                    const isSelected = genderValue === genderKey
                                    return (
                                        <button
                                            key={genderKey}
                                            type="button"
                                            onClick={() => {
                                                setValue('gender', genderKey)
                                                clearErrors('gender')
                                            }}
                                            className="cursor-pointer flex items-center text-left gap-2.5"
                                        >
                                            <span
                                                className={`shrink-0 rounded-full w-5 h-5 ${
                                                    isSelected
                                                        ? 'border-4 border-emerald-500'
                                                        : showGenderError
                                                          ? 'border-2 border-red-600'
                                                          : 'border-2 border-white'
                                                }`}
                                            />
                                            <span className="font-normal text-white text-sm leading-5">
                                                {t(`register.genders.${genderKey}`)}
                                            </span>
                                        </button>
                                    )
                                })}
                            </div>

                            {showGenderError && (
                                <p className="font-semibold text-sm leading-snug text-red-600 mt-2.5">
                                    {errors.gender?.message || t('register.errors.genderRequired')}
                                </p>
                            )}
                        </div>

                        <div className="w-full flex justify-center mt-11">
                            <button
                                type="submit"
                                className="cursor-pointer flex items-center justify-center font-bold text-black bg-white transition-opacity hover:opacity-90 w-75 h-12.5 rounded-full text-base"
                            >
                                {t('register.next')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )
    }

    const termsError = Boolean(errors.acceptTerms)

    return (
        <div className="min-h-screen w-full flex flex-col items-center px-4 py-12 text-white bg-sonora-dark font-inter">
            <div className="w-full flex flex-col items-center max-w-sm mt-11">
                <Link to="/player" className="shrink-0 w-14 h-14">
                    <img
                        src={logoSonoraIcon}
                        alt="Sonora"
                        className="w-full h-full object-cover block"
                    />
                </Link>

                <div className="w-full relative border border-white h-2.5 rounded mt-7.5">
                    <div className="w-full h-full rounded bg-emerald-500" />
                </div>

                <div className="w-full relative flex flex-col items-start mt-6">
                    <button
                        type="button"
                        onClick={() => setStep(2)}
                        aria-label={t('register.back')}
                        className="cursor-pointer flex items-center justify-center absolute -left-10.5 top-1.5 w-6 h-6"
                    >
                        <img src={backArrowIcon} alt="" className="block" />
                    </button>

                    <p className="font-normal text-white text-sm leading-5">
                        {t('register.stepOf3')}
                    </p>
                    <h1 className="font-bold text-white text-base leading-6 mt-1">
                        {t('register.termsTitle')}
                    </h1>
                </div>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    noValidate
                    className="w-full flex flex-col items-start mt-7"
                >
                    <div className="w-full flex flex-col gap-5">
                        <div className="w-full flex flex-col">
                            <button
                                type="button"
                                onClick={() => {
                                    setValue('acceptTerms', !acceptTermsValue)
                                    if (errors.acceptTerms) clearErrors('acceptTerms')
                                }}
                                className="cursor-pointer flex items-start text-left w-full gap-2.5"
                            >
                                {acceptTermsValue ? (
                                    <span className="shrink-0 w-5 h-5 mt-0.5">
                                        <img src={checkboxCheckedIcon} alt="" className="block" />
                                    </span>
                                ) : (
                                    <span
                                        className={`shrink-0 w-5 h-5 mt-0.5 rounded ${
                                            termsError ? 'border-2 border-red-600' : 'border-2 border-white'
                                        }`}
                                    />
                                )}
                                <span className="font-normal text-white text-sm leading-5">
                                    {t('register.acceptTerms')}
                                </span>
                            </button>

                            {termsError && (
                                <p className="font-semibold text-sm leading-snug text-red-600 mt-2.5">
                                    {errors.acceptTerms?.message || t('register.errors.termsRequired')}
                                </p>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() => setValue('acceptNews', !acceptNewsValue)}
                            className="cursor-pointer flex items-start text-left w-full gap-2.5"
                        >
                            {acceptNewsValue ? (
                                <span className="shrink-0 w-5 h-5 mt-0.5">
                                    <img src={checkboxCheckedIcon} alt="" className="block" />
                                </span>
                            ) : (
                                <span className="shrink-0 border-2 border-white w-5 h-5 mt-0.5 rounded" />
                            )}
                            <span className="font-normal text-white text-sm leading-5">
                                {t('register.acceptNews')}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setValue('acceptData', !acceptDataValue)}
                            className="cursor-pointer flex items-start text-left w-full gap-2.5"
                        >
                            {acceptDataValue ? (
                                <span className="shrink-0 w-5 h-5 mt-0.5">
                                    <img src={checkboxCheckedIcon} alt="" className="block" />
                                </span>
                            ) : (
                                <span className="shrink-0 border-2 border-white w-5 h-5 mt-0.5 rounded" />
                            )}
                            <span className="font-normal text-white text-sm leading-5">
                                {t('register.acceptData')}
                            </span>
                        </button>
                    </div>

                    {errors.root?.message && (
                        <p className="font-semibold w-full text-sm leading-snug text-red-600 mt-4">
                            {errors.root.message}
                        </p>
                    )}

                    <div className="w-full flex justify-center mt-12">
                        <button
                            type="submit"
                            disabled={isRegistering}
                            className="cursor-pointer flex items-center justify-center font-bold text-black bg-white transition-opacity hover:opacity-90 disabled:opacity-60 w-75 h-12.5 rounded-full text-base"
                        >
                            {isRegistering ? t('register.submitting') : t('register.signUp')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
