import { Module } from '@nestjs/common';
import { ProductRecommendationController } from './productRecommendations.controller';
import { ProductRecommendationService } from './productRecommendations.service';
import {
    ConsultantsRepository,
    ConsultantCountriesRepository,
    ProductAttributesRepository,
    ProductRecommendationRepository,
    ProductTranslationsRepository,
    ProductAttributeTranslationsRepository,
    ProductRecommendationGroupsRepository,
    PresignRepository,
} from '@/src/common/repositories/crm';
import { AwsS3Service } from '@/src/common/awsS3/awsS3.service';
import { CommonService } from '@/src/common/common.service';
import { HttpModule } from '@nestjs/axios';

@Module({
    imports: [HttpModule],
    controllers: [ProductRecommendationController],
    providers: [
        ProductRecommendationService,
        AwsS3Service,
        CommonService,

        // Repos
        ConsultantsRepository,
        ConsultantCountriesRepository,

        ProductAttributesRepository,
        ProductRecommendationRepository,
        ProductTranslationsRepository,
        ProductAttributeTranslationsRepository,
        ProductRecommendationGroupsRepository,
        PresignRepository,
    ],
})
export class ProductRecommendationModule {}

