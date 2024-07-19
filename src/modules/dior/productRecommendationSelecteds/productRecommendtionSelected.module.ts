import { Module } from '@nestjs/common';
import { ProductRecommendationSelectedsController } from './productRecommendtionSelected.controller';
import { ProductRecommendationSelectedsService } from './productRecommendtionSelected.service';
import {
    ProductAttributeTranslationsRepository,
    ProductAttributesRepository,
    ProductRecommendationRepository,
    ProductRecommendationSelectedRepository,
    ProductTranslationsRepository,
} from '@/src/common/repositories/crm';

@Module({
    controllers: [ProductRecommendationSelectedsController],
    providers: [
        ProductRecommendationSelectedsService,

        // Repos
        ProductAttributesRepository,
        ProductAttributeTranslationsRepository,
        ProductRecommendationRepository,
        ProductRecommendationSelectedRepository,
        ProductTranslationsRepository,
    ],
})
export class ProductRecommendationSelectedsModule {}
