export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'NONEBINARY' | 'UNDISCLOSED';

export interface IUser {
    id: number;
    username: string;
    email: string;
    fullName?: string;
    birthDate?: string;
    gender?: Gender;
    image: string | null;
    premiumUntil?: string | null;
    roles: string[];
}
