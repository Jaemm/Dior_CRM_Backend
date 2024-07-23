import { ProductTranslationForDiorT, ProductTranslationT } from './product_translations.type';

export type ProductRecommendationT = {
    id: number | null;
    name: string | null;
    product_type: string | null;
    description: string | null;
    link: string | null;
    image_url: string | null;
    category: string | null;
    routine: string | null;
    code: string | null;
    collection: string | null;
    is_principal?: boolean | null;
    shades?: string | null;
    product_translations?: ProductTranslationT[] | null;
    product_variants?: Omit<ProductRecommendationT, 'countries'>[];
};

export type ProductRecommendationVariantForDiorT = {
    id: number | null;
    name: string | null;
    product_type: string | null;
    description: string | null;
    link: string | null;
    image_url: string | null;
    code: string | null;
    routine: string | null;
    collection: string | null;
    category: string | null;
    countries: string[] | null;
    product_recommendation_id: number | null;
    shades: string | null;
};

export type ProductRecommendationForDiorT = {
    id: number | null;
    product_type: string | null;
    description: string | null;
    link: string | null;
    image_url: string | null;
    code: string | null;
    routine: string | null;
    collection: string | null;
    category: string | null;
    countries: string[] | null;
    product_recommendation_id: number | null;
    shades: string | null;
    collection_shades: string[] | null;
    product_translations: ProductTranslationForDiorT[];
    category_translations: {
        id: number | null;
        field_name: string | null;
        language: string | null;
        value: string | null;
    }[];
    collection_translations: {
        id: number | null;
        field_name: string | null;
        language: string | null;
        value: string | null;
    }[];
    product_variants: ProductRecommendationVariantForDiorT[];
};
