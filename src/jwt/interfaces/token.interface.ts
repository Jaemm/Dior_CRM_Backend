import { ApiProperty } from '@nestjs/swagger';
import { Allow, IsNotEmpty } from 'class-validator';

export interface ITokenBase {
    iat: number;
    exp: number;
    iss: string;
    aud: string;
    sub: string;
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
}
