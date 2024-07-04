/*
  Chowis 2023
  Paul Kapuku
*/

import { ITokenBase } from './token.interface';

// Access Token will only contain the user id
export interface IAccessPayload {
    id: number;
    role: string;
}

export interface IAccessToken extends IAccessPayload, ITokenBase {}
