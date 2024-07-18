import { IsOptional, IsString } from 'class-validator';

export class GetProductAttributesDto {
    @IsOptional()
    @IsString()
    search: string;

    @IsOptional()
    @IsString()
    page: string;

    @IsOptional()
    @IsString()
    per: string;
}
