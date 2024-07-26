import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GetAdminsDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    search: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    page: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    per: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    filter_by: string;
}

export class CreateAdminDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    email: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    password: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    name: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    surname: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    consultant_position_id: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsArray()
    countries: string[];

    @ApiPropertyOptional({
        enum: ['true', true, 'yes'],
        default: true,
    })
    @IsOptional()
    @IsString()
    is_admin: string | boolean;
}

export class UpdateAdminDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    email: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    password: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    name: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    surname: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    consultant_position_id: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsArray()
    countries: string[];

    @ApiPropertyOptional({
        enum: ['true', true, 'yes'],
        default: true,
    })
    @IsOptional()
    @IsString()
    is_admin: string | boolean;
}

export class ImportAdminsDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    file_url: string;
}

export class ExportAdminsDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    search: string;
}
