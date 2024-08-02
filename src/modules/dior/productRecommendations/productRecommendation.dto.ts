import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateProductRecommendationDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    shades: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    product_type: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    description: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    link: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    image_url: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    code: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    category: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    routine: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    product_recommendation_id: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    collection: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    countries: string[];

    @ApiProperty({
        default: [
            {
                product_recommendation_id: '',
                id: '',
                field_name: '',
                language: '',
                value: '',
            },
        ],
    })
    @IsArray()
    product_translations_attributes: {
        product_recommendation_id: string;
        id: string;
        field_name: string;
        language: string;
        value: string;
    }[];
}

export class UpdateProductRecommendationDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    category: string;

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
    category_translations: {
        field_name: string;
        language: string;
        value: string;
    }[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    code: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    collection: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    shades: string;

    @ApiPropertyOptional()
    @IsOptional()
    collection_shades: string[];

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
    collection_translations: {
        field_name: string;
        language: string;
        value: string;
    }[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    countries: string[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    description: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    image_url: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    link: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    name: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    product_type: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    product_recommendation_id: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    routine: string;

    @ApiPropertyOptional({
        default: [
            {
                // id: 0,
                field_name: '',
                lanugae: '',
                value: '',
            },
        ],
    })
    @IsOptional()
    product_translations: {
        // id: number;
        field_name: string;
        lanugae: string;
        value: string;
    }[];
}

export class ImportProductRecommendtaionDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    file_url: string;
}

export class ImportTranslationsDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    file_url: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    country: string;
}

export class ImportCountriesDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    file_url: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    country: string;
}

export class ImportPicturesDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    file_url: string;
}

export class ExportRecommendtaionsDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    search: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    filter_by: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    filter_by2: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    country: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    typ: string;
}

export class GetPresignUploadDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    filename: string;
}
