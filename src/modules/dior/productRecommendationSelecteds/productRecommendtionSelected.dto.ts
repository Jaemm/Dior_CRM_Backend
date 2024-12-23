import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class SelectProductsDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    batch_id: number;

    @ApiPropertyOptional()
    @IsOptional()
    customer_id: any;

    @ApiProperty()
    @IsNotEmpty()
    @IsArray()
    products_selected: number[];
}

export class GetRecommendationSelectedDto {
    @ApiPropertyOptional()
    @IsOptional()
    customer_id: any;

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

// For products change as following -> productRecommendationSelecteds.find({where: batch_id}) and then maap with customer by result.customer_id
