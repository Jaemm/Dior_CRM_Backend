import { Module } from '@nestjs/common';
import { ProductRecommendationGroupsController } from './productRecommendationGroups.controller';
import { ProductRecommendationGroupsService } from './productRecommendationGroups.service';
import {
    ConsultantsRepository,
    ProductRecommendationGroupsRepository,
    ProductRecommendationRepository,
    ProductRecommendationSelectedRepository,
} from '@/src/common/repositories/crm';
import { CommonService } from '@/src/common/common.service';

@Module({
    controllers: [ProductRecommendationGroupsController],
    providers: [
        CommonService,
        ProductRecommendationGroupsService,

        // Repos
        ProductRecommendationRepository,
        ProductRecommendationSelectedRepository,
        ProductRecommendationGroupsRepository,

        ConsultantsRepository,
    ],
})
export class ProductRecommendationGroupsModule {}
