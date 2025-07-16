import { ProductRecommendationT } from './product_recommendatoin.type';

export type ProudctRecommendationGroupsT = {
    id: number | null;
    name: string | null;
    countries: string[] | null;
    products: ProductRecommendationT[] | [];
};

export type ProudctRecommendationGroupsForDiorT = {
    id: number | null;
    name: string | null;
    countries: string[] | null;
    products: object[] | [];
};
