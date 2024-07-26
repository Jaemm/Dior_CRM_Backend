import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsArray } from 'class-validator';

export class SearchProductRecommendationGroupsDto {
    @ApiPropertyOptional()
    @IsNotEmpty()
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
    @IsNotEmpty()
    @IsArray()
    locations: string[];

    @ApiProperty({
        default: [
            {
                product_recommendation_id: '1',
            },
        ],
    })
    @IsNotEmpty()
    @IsArray()
    products_selected: {
        product_recommendation_id: string;
    }[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsArray()
    principal_product: string;
}

export class UpdateProductRecommendationGroupDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    name: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsArray()
    locations: string[];

    @ApiPropertyOptional({
        default: [
            {
                product_recommendation_id: '1',
            },
        ],
    })
    @IsOptional()
    @IsArray()
    products_selected: {
        product_recommendation_id: string;
    }[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsArray()
    principal_product: string;
}
