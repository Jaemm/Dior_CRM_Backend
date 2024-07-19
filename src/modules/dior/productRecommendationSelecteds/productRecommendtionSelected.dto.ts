import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class SelectProductsDto {
    @IsNotEmpty()
    @IsNumber()
    batch_id: number;

    @IsNotEmpty()
    @IsNumber()
    customer_id: number;
    @IsNotEmpty()
    products_selected: number[];
}

export class GetRecommendationSelectedDto {
    @IsOptional()
    @IsString()
    customer_id: string;

    @IsOptional()
    @IsString()
    batch_id: string;
}

export class GetListOfRecommendationListDto {
    @IsOptional()
    @IsString()
    start_date: string;

    @IsOptional()
    @IsString()
    end_date: string;

    @IsOptional()
    @IsString()
    page: string;

    @IsOptional()
    @IsString()
    per: string;
}
