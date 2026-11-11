import type { Gender, IUser } from './IUser';

export interface IAuthResponse {
    token: string;
    tokenType?: string;
    user?: IUser;
    message?: string;
}

export interface IEmailCheckResponse {
    available: boolean;
}

export interface ILoginStartResponse {
    sent: boolean;
    devCode?: string | null;
}

export interface IForgotPasswordResponse {
    sent: boolean;
    devCode?: string | null;
}

export interface IResetTokenResponse {
    resetToken: string;
}

export interface IResetPasswordResponse {
    message: string;
}

export interface IRegisterRequest {
    email: string;
    password: string;
    fullName: string;
    birthDate: string;
    gender: Gender;
}
