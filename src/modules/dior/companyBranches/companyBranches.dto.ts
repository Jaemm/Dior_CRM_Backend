import { IsOptional, IsString } from 'class-validator';

export class CreateBranchesDto {
    @IsString()
    email: string;

    @IsString()
    name: string;

    @IsString()
    code: string;

    @IsString()
    password: string;

    @IsString()
    country: string;
}

export class SearchBranchesDto {
    @IsOptional()
    @IsString()
    search: string;

    @IsOptional()
    @IsString()
    filter_by: string;

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

export class UpdateBranchesDto {
    @IsOptional()
    @IsString()
    email: string;

    @IsOptional()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    code: string;

    @IsOptional()
    @IsString()
    password: string;

    @IsOptional()
    @IsString()
    country: string;
}

export class ExportBranchesDto {
    @IsOptional()
    @IsString()
    search: string;

    @IsOptional()
    @IsString()
    filter_by: string;
}
