import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

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
    @IsArray()
    countries: string[];

    @IsOptional()
    @IsString()
    is_admin: string | boolean;
}

export class UpdateAdminDto {
    @IsOptional()
    @IsString()
    email: string;

    @IsOptional()
    @IsString()
    password: string;

    @IsOptional()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    surname: string;

    @IsOptional()
    @IsString()
    consultant_position_id: string;

    @IsOptional()
    @IsArray()
    countries: string[];

    @IsNotEmpty()
    @IsString()
    is_admin: string | boolean;
}

export class ImportAdminsDto {
    @IsNotEmpty()
    @IsString()
    file_url: string;
}

export class ExportAdminsDto {
    @IsOptional()
    @IsString()
    search: string;
}
