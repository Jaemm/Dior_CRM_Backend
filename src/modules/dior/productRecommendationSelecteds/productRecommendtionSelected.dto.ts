import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class SelectProductsDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    batch_id: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    customer_id: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsArray()
    products_selected: number[];
}

export class GetRecommendationSelectedDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    customer_id: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    batch_id: string;
}

export class GetListOfRecommendationListDto {
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
    page: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    per: string;
}
