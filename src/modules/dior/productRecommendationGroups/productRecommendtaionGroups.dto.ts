import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

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
