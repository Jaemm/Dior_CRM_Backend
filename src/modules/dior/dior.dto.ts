import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export type AttributeRoutine = 'Makeup' | 'Skincare';

export class AutomaticProductByBatchIdDto {
    @IsNotEmpty()
    @IsString()
    skin_tone: string;

    @IsOptional()
    @IsString()
    batch_id: string;

    @IsOptional()
    @IsString()
    market: string;

    @IsOptional()
    @IsString()
    routine_recommendation: string;

    @IsOptional()
    @IsString()
    answers: string;
}
export class CustomerByConsultantIdDto {
    @IsNotEmpty()
    consultant_id: string;

    @IsOptional()
    email?: string;
}

export class createCustomerDto {
    @IsNotEmpty()
    @IsString()
    email: string;

    @IsNotEmpty()
    @IsString()
    external_id: string;

    @IsNotEmpty()
    @IsNumber()
    consultant_id: number;

    @IsOptional()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    surname: string;
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
