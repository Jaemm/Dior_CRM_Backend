import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GetCustomerByConsultantDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    search: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    filter_by: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    page: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    limit: string;
}

export class LoginDiorConsultantDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    app_id: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    email: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    password: string;
}

export class ResetPasswordDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    app_id: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    email: string;
}

export class GetAnalysisHistoriesDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    filter_by: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    page: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    limit: string;
}

export class GetAnalysisHistoryByBatchIdDto {
    @IsNotEmpty()
    @IsString()
    analysis_type: 'cndpskin' | 'cndphair' | 'ffa' | 'hh' | 'cmaskin' | 'cmahair';
}

export class GetHydrationSebumByBatchIdDto {
    @IsNotEmpty()
    @IsString()
    analysis_type: 'cndpskin' | 'cndphair' | 'ffa' | 'hh' | 'cmaskin' | 'cmahair';
}
