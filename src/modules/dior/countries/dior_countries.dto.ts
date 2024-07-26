import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCountries {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    code: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    url_and_port: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    default_recommendation: string;
}

export class UpdateCountriesDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    name: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    code: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    url_and_port: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    default_recommendation: string;
}

export class ExportCountriesDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    search: string;
}

export class ImportCountriesDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    file_url: string;
}
