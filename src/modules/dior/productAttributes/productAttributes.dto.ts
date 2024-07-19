import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

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

export class UpdateProductAttributeDto {
    @IsOptional()
    @IsString()
    typ: string;

    @IsOptional()
    @IsString()
    value: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => productTranslationsDto)
    product_translations: productTranslationsDto[];
}

export class ExportProductAttributeDataDto {
    @IsOptional()
    @IsString()
    search: string;
}

export class ImportProductAttributeDataDto {
    @IsNotEmpty()
    @IsString()
    file_url: string;
}

export class ImportProductAttributeTranslationsDataDto {
    @IsNotEmpty()
    @IsString()
    file_url: string;

    @IsNotEmpty()
    @IsString()
    country: string;
}

// protected
class productTranslationsDto {
    @IsOptional()
    @IsString()
    field_name?: string;

    @IsOptional()
    @IsString()
    language?: string;

    @IsOptional()
    @IsString()
    value?: string;
}
