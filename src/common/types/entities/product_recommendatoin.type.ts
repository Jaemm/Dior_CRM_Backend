import { ProductTranslationT } from './product_translations.type';

export type ProductRecommendationT = {
    id: string | null;
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
