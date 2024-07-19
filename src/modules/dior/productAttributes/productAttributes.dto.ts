import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

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

export class CreateProductAttributeDto {
    @IsNotEmpty()
    @IsString()
    typ: string;

    @IsNotEmpty()
    @IsString()
    value: string;

    @IsOptional()
    product_translations: {
        field_name: string;
        language: string;
        value: string;
    }[];
}
