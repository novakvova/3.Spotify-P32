import { createApi } from '@reduxjs/toolkit/query/react'
import { createBaseQuery } from '../../utils/createBaseQuery'
import type { IAuthResponse } from '../../types/IAuthResponse'
import type {IProfile} from "../../types/IProfile.ts";

export const authApi = createApi({
    reducerPath: 'authApi',
    baseQuery: createBaseQuery,
    endpoints: (builder) => ({

        register: builder.mutation<IAuthResponse, FormData>({
            query: (formData) => ({
                url: '/register',
                method: 'POST',
                body: formData,
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
        }),

    }),
})

export const { useRegisterMutation, useLoginMutation, useGetProfileQuery } = authApi