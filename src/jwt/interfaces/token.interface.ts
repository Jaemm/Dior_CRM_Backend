/*
  Chowis 2023
  Paul Kapuku
*/

import { ApiProperty } from '@nestjs/swagger';
import { Allow, IsNotEmpty } from 'class-validator';

// All tokens will contain these value
export interface ITokenBase {
    iat: number; // issued at
    exp: number; // expiration
    iss: string; // issuer
    aud: string; //audience
    sub: string; // subject
}

export class Tokens {
    @ApiProperty()
    @IsNotEmpty()
    token1: string;

    @Allow()
    @ApiProperty()
    token2?: string;
}

export interface SocialInterface {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    // app_id?: number;
    // social?: string;
    // appType: string; // b2b or b2c
}
