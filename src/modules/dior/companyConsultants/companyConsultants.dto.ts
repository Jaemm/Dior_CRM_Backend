import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

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

export class CreateDiorCompanyConsultantsDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    code: string;

    @IsNotEmpty()
    @IsString()
    password: string;

    @IsNotEmpty()
    @IsString()
    consultant_branch_id: string;

    @IsNotEmpty()
    @IsString()
    country: string;
}

export class ExportDiorCompanyConsultantsDto {
    @IsOptional()
    @IsString()
    search: string;

    @IsOptional()
    @IsString()
    ids: string;

    @IsOptional()
    @IsString()
    filter_by: string;

    @IsOptional()
    @IsString()
    filter_by2: string;
}
