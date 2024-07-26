import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

export class GetProductAttributesDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    search: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    page: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    per: string;
}

export class CreateProductAttributeDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    typ: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    value: string;

    @ApiPropertyOptional({
        default: [
            {
                field_name: '',
                language: '',
                value: '',
            },
        ],
    })
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
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    search: string;
}

export class ImportProductAttributeDataDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    file_url: string;
}

export class ImportProductAttributeTranslationsDataDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    file_url: string;

    @ApiProperty()
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
