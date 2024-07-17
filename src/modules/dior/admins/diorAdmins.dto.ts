import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GetAdminsDto {
    @IsOptional()
    @IsString()
    search: string;

    @IsOptional()
    @IsString()
    page: string;

    @IsOptional()
    @IsString()
    per: string;

    @IsOptional()
    @IsString()
    filter_by: string;
}

export class CreateAdminDto {
    @IsNotEmpty()
    @IsString()
    email: string;

    @IsNotEmpty()
    @IsString()
    password: string;

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    surname: string;

    @IsNotEmpty()
    @IsString()
    consultant_position_id: string;

    @IsNotEmpty()
    @IsString()
    countries: string[];

    @IsOptional()
    @IsString()
    is_admin: string | boolean;
}
