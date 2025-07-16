import { ProductAttributeTranslationsForDiorT } from './product_attribute_translations.type';

export type ProductAttributesForDiorT = {
    id: number | null;
    typ: string | null;
    value: string | null;
    product_attribute_translations: ProductAttributeTranslationsForDiorT[] | null;
};
