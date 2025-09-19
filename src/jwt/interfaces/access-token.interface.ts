import { ITokenBase } from './token.interface';

export interface IAccessPayload {
    id: number;
    role: string;
}

export interface IAccessToken extends IAccessPayload, ITokenBase {}
