import { IsNotEmpty, IsString } from 'class-validator';

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
