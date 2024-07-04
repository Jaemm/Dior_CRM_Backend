/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Afonso Barracha
*/

import { IAccessPayload } from './access-token.interface';
import { ITokenBase } from './token.interface';

export interface IEmailPayload extends IAccessPayload {
    version: number;
}

export interface IEmailToken extends IEmailPayload, ITokenBase {}
