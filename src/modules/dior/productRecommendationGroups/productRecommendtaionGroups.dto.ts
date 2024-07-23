import { IsNotEmpty, IsString, IsOptional, IsArray } from 'class-validator';

export class SearchProductRecommendationGroupsDto {
    @IsNotEmpty()
    @IsString()
    search: string;

    @IsOptional()
    @IsString()
    page: string;

    @IsOptional()
    @IsString()
    per: string;
}

export class GetListProductRecommendationGroupsDto {
    @IsOptional()
    @IsString()
    list_type: string | null;

    @IsOptional()
    @IsString()
    search: string | null;
}

export class CreateProductRecommendationGroupsDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsArray()
    locations: string[];

    @IsNotEmpty()
    @IsArray()
    products_selected: {
        product_recommendation_id: string;
    }[];

    @IsOptional()
    @IsArray()
    principal_product: string;
}

export class UpdateProductRecommendationGroupDto {
    @IsOptional()
    @IsString()
    name: string;

    @IsOptional()
    @IsArray()
    locations: string[];

    @IsOptional()
    @IsArray()
    products_selected: {
        product_recommendation_id: string;
    }[];

    @IsOptional()
    @IsArray()
    principal_product: string;
}
