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
import { AwsS3Service } from '@/src/common/awsS3/awsS3.service';

@Module({
    controllers: [ProductRecommendationController],
    providers: [
        ProductRecommendationService,
        AwsS3Service,

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
