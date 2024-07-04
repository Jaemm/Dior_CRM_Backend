import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AuthTokenDto {
    accessToken: string;
    refreshToken: string;
}

export class ResetPasswordDto {
    @ApiProperty()
    @IsString()
    password: string;

    @ApiProperty()
    @IsString()
    confirmPassword: string;
}

export class sendTokenDto {
    @ApiProperty()
    @IsString()
    email: string;
}
