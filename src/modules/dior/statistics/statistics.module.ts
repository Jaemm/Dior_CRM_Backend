import { Module } from '@nestjs/common';
import { StatisticsController } from './statistic.controller';
import { StatisticsService } from './statistics.service';
import {
    ConsultantBranchesRepository,
    ConsultantsRepository,
    CustomersRepository,
    DevicesRepository,
    ProductsRepository,
    SalesConnectionRepository,
} from '@/src/common/repositories/crm';
import { AnalysisDataReplicationService } from '../../dataReplication/analysisDataReplication/analysisDataReplication.service';
import { AnalysisDataReplicationModule } from '../../dataReplication/analysisDataReplication/analysisDataReplication.module';

@Module({
    imports: [AnalysisDataReplicationModule],
    controllers: [StatisticsController],
    providers: [
        StatisticsService,

        // Repos
        ConsultantsRepository,
        CustomersRepository,
        SalesConnectionRepository,
        ConsultantBranchesRepository,
        DevicesRepository,
        ProductsRepository,
    ],
})
export class StatisticsModule {}
