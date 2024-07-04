import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CustomerByConsultantIdDto {
    @IsNotEmpty()
    consultant_id: string;

    @IsOptional()
    email?: string;
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
