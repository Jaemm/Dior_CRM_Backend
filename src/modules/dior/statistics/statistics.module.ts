import { Module } from '@nestjs/common';
import { StatisticsController } from './statistic.controller';
import { StatisticsService } from './statistics.service';
import {
    ConsultantBranchesRepository,
    ConsultantCountriesRepository,
    ConsultantsRepository,
    CustomersRepository,
    DevicesRepository,
    ProductsRepository,
    SalesConnectionRepository,
} from '@/src/common/repositories/crm';
import { AnalysisDataReplicationModule } from '../../dataReplication/analysisDataReplication/analysisDataReplication.module';

@Module({
    imports: [AnalysisDataReplicationModule],
    controllers: [StatisticsController],
    providers: [
        StatisticsService,

        // Repos
        ConsultantsRepository,
        ConsultantBranchesRepository,
        ConsultantCountriesRepository,
        CustomersRepository,

        SalesConnectionRepository,
        DevicesRepository,
        ProductsRepository,
    ],
})
export class StatisticsModule {}
