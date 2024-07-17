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
