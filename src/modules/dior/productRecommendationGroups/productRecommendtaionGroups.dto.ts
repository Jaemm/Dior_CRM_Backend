import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsArray } from 'class-validator';

export class SearchProductRecommendationGroupsDto {
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
}

export class GetListProductRecommendationGroupsDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    list_type: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    search: string;
}

export class CreateProductRecommendationGroupsDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsOptional()
    @IsArray()
    locations: (string | null)[];

    @ApiProperty()
    @IsOptional()
    @IsArray()
    products_selected: (number | null)[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsArray()
    principal_product: number;
}

export class UpdateProductRecommendationGroupDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    name: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsArray()
    locations: (string | null)[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsArray()
    products_selected: (number | null)[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsArray()
    principal_product: number;
}
function IsNumberArray(): (target: CreateProductRecommendationGroupsDto, propertyKey: 'products_selected') => void {
    throw new Error('Function not implemented.');
}
