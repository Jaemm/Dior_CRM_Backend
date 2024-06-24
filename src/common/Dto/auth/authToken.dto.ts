import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

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

export class AuthGoogleLoginDto {
    @ApiProperty({ example: 'abc' })
    @IsNotEmpty()
    idToken: string;

    @ApiProperty({ example: 44 })
    @IsNotEmpty()
    app_id?: number;

    @ApiProperty({ example: 'google' })
    @IsNotEmpty()
    social?: string;

    @ApiProperty({ example: 'b2b' })
    @IsNotEmpty()
    appType: string;
}
