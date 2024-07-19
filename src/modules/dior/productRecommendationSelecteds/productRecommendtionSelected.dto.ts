import { IsNotEmpty, IsOptional } from 'class-validator';

export class SelectProductsDto {
    @IsNotEmpty()
    batch_id: number;

    @IsNotEmpty()
    customer_id: number;

    @IsNotEmpty()
    products_selected: number[];
}

export class GetRecommendationSelectedDto {
    @IsOptional()
    customer_id: string;

    @IsOptional()
    batch_id: string;
}
