export interface IUser {
    id: number;
    username: string;
    email: string;
    image: string | null;
    roles: string[];
}