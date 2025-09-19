import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class GetDiorCompanyConsultantsDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    filter_by: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    filter_by_2: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    search: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    country: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    page: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    per: string;
}

export class CreateDiorCompanyConsultantsDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    name: string;
    
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    code: string;

    @ApiPropertyOptional()
    @IsNotEmpty()
    @IsNumber()
    consultant_branch_id: number;

    @ApiPropertyOptional()
    @IsNotEmpty()
    @IsString()
    country: string;
}

export class ExportDiorCompanyConsultantsDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    search: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    ids: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    filter_by: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    filter_by2: string;
}

export class ImportDiorCompanyConsultantsDto {
    @IsNotEmpty()
    @IsString()
    file_url: string;
}
