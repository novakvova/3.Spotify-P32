import { createApi } from '@reduxjs/toolkit/query/react'
import { createBaseQuery } from '../../utils/createBaseQuery'
import type {
    IAuthResponse,
    IEmailCheckResponse,
    IForgotPasswordResponse,
    ILoginStartResponse,
    IRegisterRequest,
    IResetPasswordResponse,
    IResetTokenResponse,
} from '../../types/IAuthResponse'
import type { IProfile } from '../../types/IProfile.ts'

export const authApi = createApi({
    reducerPath: 'authApi',
    baseQuery: createBaseQuery,
    tagTypes: ['Profile'],
    endpoints: (builder) => ({
        checkEmail: builder.mutation<IEmailCheckResponse, { email: string }>({
            query: (body) => ({
                url: '/api/auth/email-check',
                method: 'POST',
                body,
            }),
        }),

        register: builder.mutation<IAuthResponse, IRegisterRequest>({
            query: (body) => ({
                url: '/api/auth/register',
                method: 'POST',
                body,
            }),
        }),

        loginEmail: builder.mutation<ILoginStartResponse, { email: string }>({
            query: (body) => ({
                url: '/api/auth/login/email',
                method: 'POST',
                body,
            }),
        }),

        loginWithCode: builder.mutation<IAuthResponse, { email: string; code: string }>({
            query: (body) => ({
                url: '/api/auth/login/code',
                method: 'POST',
                body,
            }),
        }),

        loginWithPassword: builder.mutation<IAuthResponse, { email: string; password: string }>({
            query: (body) => ({
                url: '/api/auth/login/password',
                method: 'POST',
                body,
            }),
        }),

        forgotPassword: builder.mutation<IForgotPasswordResponse, { email: string }>({
            query: (body) => ({
                url: '/api/auth/password/forgot',
                method: 'POST',
                body,
            }),
        }),

        verifyResetCode: builder.mutation<IResetTokenResponse, { email: string; code: string }>({
            query: (body) => ({
                url: '/api/auth/password/verify',
                method: 'POST',
                body,
            }),
        }),

        resetPassword: builder.mutation<
            IResetPasswordResponse,
            { resetToken: string; newPassword: string }
        >({
            query: (body) => ({
                url: '/api/auth/password/reset',
                method: 'POST',
                body,
            }),
        }),

        login: builder.mutation<IAuthResponse, { username: string; password: string }>({
            query: (body) => ({
                url: '/login',
                method: 'POST',
                body,
            }),
        }),

        getProfile: builder.query<IProfile, void>({
            query: () => '/profile',
            providesTags: ['Profile'],
        }),

        updateProfile: builder.mutation<IProfile, FormData>({
            query: (formData) => ({
                url: '/profile/update',
                method: 'PUT',
                body: formData,
            }),
            invalidatesTags: ['Profile'],
        }),
    }),
})

export const {
    useCheckEmailMutation,
    useRegisterMutation,
    useLoginEmailMutation,
    useLoginWithCodeMutation,
    useLoginWithPasswordMutation,
    useForgotPasswordMutation,
    useVerifyResetCodeMutation,
    useResetPasswordMutation,
    useLoginMutation,
    useGetProfileQuery,
    useUpdateProfileMutation,
} = authApi
