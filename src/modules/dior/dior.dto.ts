import { IsOptional } from 'class-validator';

export class SearchDto {
    @IsOptional()
    search: string;
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
