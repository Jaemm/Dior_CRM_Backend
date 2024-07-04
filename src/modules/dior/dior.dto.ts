import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CustomerByConsultantIdDto {
    @IsNotEmpty()
    consultant_id: string;

    @IsOptional()
    email?: string;
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
