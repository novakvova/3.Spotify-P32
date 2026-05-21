import { createApi } from '@reduxjs/toolkit/query/react'
import { createBaseQuery } from '../../utils/createBaseQuery'
import type { IAuthResponse } from '../../types/IAuthResponse'

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
    }),
})

export const { useRegisterMutation } = authApi