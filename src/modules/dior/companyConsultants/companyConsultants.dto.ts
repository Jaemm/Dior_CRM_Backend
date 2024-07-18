import { IsOptional, IsString } from 'class-validator';

export class GetDiorCompanyConsultantsDto {
    @IsOptional()
    @IsString()
    filter_by: string;

    @IsOptional()
    @IsString()
    filter_by2: string;

    @IsOptional()
    @IsString()
    search: string;

    @IsOptional()
    @IsString()
    country: string;

    @IsOptional()
    @IsString()
    page: string;

    @IsOptional()
    @IsString()
    per: string;
}
