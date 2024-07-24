import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GetCustomerByConsultantDto {
    @IsOptional()
    @IsString()
    search: string;

    @IsOptional()
    @IsString()
    filter_by: string;

    @IsOptional()
    @IsString()
    page: string;

    @IsOptional()
    @IsString()
    limit: string;
}

export class LoginDiorConsultantDto {
    @IsOptional()
    @IsString()
    app_id: string;

    @IsNotEmpty()
    @IsString()
    email: string;

    @IsNotEmpty()
    @IsString()
    password: string;
}

export class ResetPasswordDto {
    @IsOptional()
    @IsString()
    app_id: string;

    @IsNotEmpty()
    @IsString()
    email: string;
}
