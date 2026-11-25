export type UserGender =
    | 'MALE'
    | 'FEMALE'
    | 'OTHER'
    | 'NONEBINARY'
    | 'UNDISCLOSED'

export interface IAdminUser {
    id: number
    email: string
    username: string
    fullName: string
    birthDate: string | null
    gender: UserGender | null
    image: string | null
    blocked: boolean
    premiumUntil: string | null
    createdAt: string | null
    roles: string[]
}

export interface ICreateAdminUserPayload {
    email: string
    username: string
    fullName: string
    birthDate: string
    gender: UserGender
    password: string
    roles: string[]
    blocked: boolean
}
