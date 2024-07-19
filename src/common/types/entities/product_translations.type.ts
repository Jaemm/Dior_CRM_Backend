export type ProductTranslationT = {
    id: number | null;
    field_name: string | null;
    language: string | null;
    value: string | null;
};

export type ProductTranslationForDiorT = ProductTranslationT & {
    attribute_name: string | null;
    collection_name: string | null;
};
