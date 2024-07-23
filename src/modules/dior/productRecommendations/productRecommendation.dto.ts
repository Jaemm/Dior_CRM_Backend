import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateProductRecommendationDto {
    @IsString()
    shades: string;

    @IsString()
    product_type: string;

    @IsString()
    name: string;

    @IsString()
    description: string;

    @IsString()
    link: string;
    @IsString()
    image_url: string;
    @IsString()
    code: string;

    @IsString()
    category: string;
    @IsString()
    routine: string;

    @IsString()
    product_recommendation_id: string;
    @IsString()
    collection: string;

    @IsString()
    countries: string[];

    @IsObject()
    product_translations_attributes: {
        product_recommendation_id: string;
        id: string;
        field_name: string;
        language: string;
        value: string;
    }[];
}

export class ImportProductRecommendtaionDto {
    @IsString()
    @IsNotEmpty()
    file_url: string;
}

export class ImportTranslationsDto {
    @IsString()
    @IsNotEmpty()
    file_url: string;

    @IsString()
    @IsNotEmpty()
    country: string;
}

export class ImportCountriesDto {
    @IsString()
    @IsNotEmpty()
    file_url: string;

    @IsString()
    @IsNotEmpty()
    country: string;
}

export class ImportPicturesDto {
    @IsString()
    @IsNotEmpty()
    file_url: string;
}

export class ExportRecommendtaionsDto {
    @IsOptional()
    @IsString()
    search: string;

    @IsOptional()
    @IsString()
    filter_by: string;

    @IsOptional()
    @IsString()
    filter_by2: string;

    @IsOptional()
    @IsString()
    country: string;

    @IsOptional()
    @IsString()
    typ: string;
}

export class GetPresignUploadDto {
    @IsOptional()
    @IsString()
    filename: string;
}
