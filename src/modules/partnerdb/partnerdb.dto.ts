import { IsOptional, IsString } from 'class-validator';

export class GetCustomerByConsultantDto {
    @IsOptional()
    @IsString()
    search: string;

    @IsOptional()
    @IsString()
    filter_by: string;

    @IsOptional()
    @IsString()
    page: string;

    @IsOptional()
    @IsString()
    limit: string;
}
