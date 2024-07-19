import { Module } from '@nestjs/common';
import { ProductRecommendationGroupsController } from './productRecommendationGroups.controller';
import { ProductRecommendationGroupsService } from './productRecommendationGroups.service';
import { ConsultantsRepository, ProductRecommendationGroupsRepository } from '@/src/common/repositories/crm';

@Module({
    controllers: [ProductRecommendationGroupsController],
    providers: [ProductRecommendationGroupsService, ProductRecommendationGroupsRepository, ConsultantsRepository],
})
export class ProductRecommendationGroupsModule {}
