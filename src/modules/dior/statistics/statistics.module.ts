import { Module } from '@nestjs/common';
import { StatisticsController } from './statistic.controller';
import { StatisticsService } from './statistics.service';
import {
    ConsultantBranchesRepository,
    ConsultantCountriesRepository,
    ConsultantsRepository,
    CustomersRepository,
    DevicesRepository,
    ProductAttributeTranslationsRepository,
    ProductAttributesRepository,
    ProductRecommendationRepository,
    ProductRecommendationSelectedRepository,
    ProductTranslationsRepository,
    ProductsRepository,
    SalesConnectionRepository,
} from '@/src/common/repositories/crm';
import { AnalysisDataReplicationModule } from '../../dataReplication/analysisDataReplication/analysisDataReplication.module';

@Module({
    imports: [AnalysisDataReplicationModule],
    controllers: [StatisticsController],
    providers: [
        StatisticsService,
        ConsultantsRepository,
        ConsultantBranchesRepository,
        ConsultantCountriesRepository,
        CustomersRepository,

        SalesConnectionRepository,
        DevicesRepository,
        ProductsRepository,

        ProductAttributesRepository,
        ProductAttributeTranslationsRepository,
        ProductTranslationsRepository,
        ProductRecommendationRepository,
        ProductRecommendationSelectedRepository,
    ],
})
export class StatisticsModule {}
