import { Module } from '@nestjs/common';
import { ProductRecommendationSelectedsController } from './productRecommendtionSelected.controller';
import { ProductRecommendationSelectedsService } from './productRecommendtionSelected.service';
import {
    ProductAttributesRepository,
    ProductRecommendationRepository,
    ProductRecommendationSelectedRepository,
} from '@/src/common/repositories/crm';

@Module({
    controllers: [ProductRecommendationSelectedsController],
    providers: [
        ProductRecommendationSelectedsService,

        // Repos
        ProductAttributesRepository,
        ProductRecommendationRepository,
        ProductRecommendationSelectedRepository,
    ],
})
export class ProductRecommendationSelectedsModule {}
