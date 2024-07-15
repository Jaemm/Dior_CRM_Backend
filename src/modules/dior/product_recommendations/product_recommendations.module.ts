import { Module } from '@nestjs/common';
import { ProductRecommendationController } from './product_recommendations.controller';
import { ProductRecommendationService } from './product_recommendations.service';
import {
    ConsultantsRepository,
    ConsultantCountriesRepository,
    ProductAttributesRepository,
    ProductRecommendationRepository,
    ProductTranslationsRepository,
    ProductAttributeTranslationsRepository,
    ProductRecommendationGroupsRepository,
} from '@/src/common/repositories/crm';

@Module({
    controllers: [ProductRecommendationController],
    providers: [
        ProductRecommendationService,

        // Repos
        ConsultantsRepository,
        ConsultantCountriesRepository,

        ProductAttributesRepository,
        ProductRecommendationRepository,
        ProductTranslationsRepository,
        ProductAttributeTranslationsRepository,
        ProductRecommendationGroupsRepository,
    ],
})
export class ProductRecommendationModule {}
