import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GetOverAllDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    start_date: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    end_date: string;
}

export class GetOverAllDetailsDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    type: string;
}

export class GetStatDetailsDto {
    @IsOptional()
    @IsString()
    start_date: string;

    @IsOptional()
    @IsString()
    end_date: string;

    @IsOptional()
    @IsString()
    stat_type: string;
}

export class GetInfographStatDetails {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    start_date: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    end_date: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    stat_type: string;
}

export class GetStatDetailsCountryWiseDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    stat_type: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    country_name: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    start_date: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    end_date: string;
}
