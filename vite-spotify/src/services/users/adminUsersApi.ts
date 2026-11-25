import { createApi } from '@reduxjs/toolkit/query/react'
import { createBaseQuery } from '../../utils/createBaseQuery'
import type { IAdminUser, ICreateAdminUserPayload } from '../../types/IAdminUser'

export const adminUsersApi = createApi({
    reducerPath: 'adminUsersApi',
    baseQuery: createBaseQuery,
    tagTypes: ['AdminUser'],
    endpoints: (builder) => ({
        getAdminUsers: builder.query<IAdminUser[], void>({
            query: () => '/api/admin/users',
            providesTags: ['AdminUser'],
        }),
        createAdminUser: builder.mutation<IAdminUser, ICreateAdminUserPayload>({
            query: (body) => ({
                url: '/api/admin/users',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['AdminUser'],
        }),
        updateAdminUserRoles: builder.mutation<
            IAdminUser,
            { id: number; roles: string[] }
        >({
            query: ({ id, roles }) => ({
                url: `/api/admin/users/${id}/roles`,
                method: 'PUT',
                body: { roles },
            }),
            invalidatesTags: ['AdminUser'],
        }),
        setAdminUserBlocked: builder.mutation<
            IAdminUser,
            { id: number; blocked: boolean }
        >({
            query: ({ id, blocked }) => ({
                url: `/api/admin/users/${id}/block`,
                method: 'PATCH',
                body: { blocked },
            }),
            invalidatesTags: ['AdminUser'],
        }),
        deleteAdminUser: builder.mutation<void, number>({
            query: (id) => ({
                url: `/api/admin/users/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['AdminUser'],
        }),
    }),
})

export const {
    useGetAdminUsersQuery,
    useCreateAdminUserMutation,
    useUpdateAdminUserRolesMutation,
    useSetAdminUserBlockedMutation,
    useDeleteAdminUserMutation,
} = adminUsersApi
