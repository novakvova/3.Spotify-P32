import { createApi } from '@reduxjs/toolkit/query/react'
import { createBaseQuery } from '../../utils/createBaseQuery'
import type { IRole } from '../../types/IRole'

export const rolesApi = createApi({
    reducerPath: 'rolesApi',
    baseQuery: createBaseQuery,
    tagTypes: ['Role'],
    endpoints: (builder) => ({
        getRoles: builder.query<IRole[], void>({
            query: () => '/api/roles',
            providesTags: ['Role'],
        }),
        createRole: builder.mutation<IRole, { name: string }>({
            query: (body) => ({
                url: '/api/roles',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Role'],
        }),
        updateRole: builder.mutation<IRole, { id: number; name: string }>({
            query: ({ id, ...body }) => ({
                url: `/api/roles/${id}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: ['Role'],
        }),
        deleteRole: builder.mutation<void, number>({
            query: (id) => ({
                url: `/api/roles/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Role'],
        }),
    }),
})

export const {
    useGetRolesQuery,
    useCreateRoleMutation,
    useUpdateRoleMutation,
    useDeleteRoleMutation,
} = rolesApi
