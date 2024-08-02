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
    email: string;

    @ApiProperty()
    @IsNotEmpty()
    password: string;

    @ApiPropertyOptional()
    @IsOptional()
    name: string;

    @ApiPropertyOptional()
    @IsOptional()
    surname: string;

    @ApiPropertyOptional()
    @IsOptional()
    consultant_position_id: number;

    @ApiPropertyOptional()
    @IsOptional()
    countries: string[];

    @ApiPropertyOptional({
        enum: ['true', true, 'yes'],
        default: true,
    })
    @IsOptional()
    is_admin: string | boolean;
}

export class UpdateAdminDto {
    @ApiPropertyOptional()
    @IsOptional()
    email: string;

    @ApiPropertyOptional()
    @IsOptional()
    password: string;

    @ApiPropertyOptional()
    @IsOptional()
    name: string;

    @ApiPropertyOptional()
    @IsOptional()
    surname: string;

    @ApiPropertyOptional()
    @IsOptional()
    consultant_position_id: number;

    @ApiPropertyOptional()
    @IsOptional()
    countries: string[];

    @ApiPropertyOptional({
        enum: ['true', true, 'yes'],
        default: true,
    })
    @IsOptional()
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
