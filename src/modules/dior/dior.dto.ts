import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
export type AttributeRoutine = 'Makeup' | 'Skincare';

export class AutomaticProductByBatchIdDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    skin_tone: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    batch_id: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    market: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    routine_recommendation: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    answers: string;
}
export class CustomerByConsultantIdDto {
    @ApiProperty()
    @IsNotEmpty()
    consultant_id: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    email?: string;
}

export class SendWebResultDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    email: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    batch_id: string;
}

export class CreateCustomerDto {
    @ApiProperty()
    @IsOptional()
    @IsString()
    email: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    consultant_id: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    external_id: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    name: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    surname: string;
}

export class SearchProductRecommendationDto {
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    request_origin: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    filter_by: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    filter_by_2: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    filter_by_country: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    category: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    routine: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    collection: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    search: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    page: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    limit: string;
}
