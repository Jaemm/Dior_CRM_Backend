import { IsOptional, IsString } from 'class-validator';

export class GetAdminsDto {
    @IsOptional()
    @IsString()
    search: string;

    @IsOptional()
    @IsString()
    page: string;

    @IsOptional()
    @IsString()
    per: string;

    @IsOptional()
    @IsString()
    filter_by: string;
}
