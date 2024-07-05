import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export type AttributeRoutine = 'Makeup' | 'Skincare';

export class CustomerByConsultantIdDto {
    @IsNotEmpty()
    consultant_id: string;

    @IsOptional()
    email?: string;
}
export class SelectProductsDto {
    @IsNotEmpty()
    batch_id: number;

    @IsNotEmpty()
    customer_id: number;

    @IsNotEmpty()
    products_selected: number[];
}
export class GetRecommendationSelectedDto {
    @IsOptional()
    customer_id: string;

    @IsOptional()
    batch_id: string;
}

export class SearchProductRecommendationGroupsDto {
    @IsNotEmpty()
    @IsString()
    search: string;

    @IsOptional()
    page: string;

    @IsOptional()
    per: string;
}

export class SearchProductRecommendationDto {
    @IsOptional()
    request_origin: string;

    @IsOptional()
    filter_by: string;

    @IsOptional()
    filter_by_2: string;

    @IsOptional()
    filter_by_country: string;

    @IsOptional()
    category: string;

    @IsOptional()
    routine: string;

    @IsOptional()
    collection: string;

    @IsOptional()
    search: string;

    @IsOptional()
    page: string;

    @IsOptional()
    limit: string;
}

export class SearchBranchesDto {
    @IsOptional()
    search: string;

    @IsOptional()
    filter_by: string;

    @IsOptional()
    country: string;

    @IsOptional()
    page: string;

    @IsOptional()
    per: string;
}
/** Entity DTO */

/** RESPONSE DTO */
