import { Module } from '@nestjs/common';
import { DiorCompanyConsultantsController } from './companyConsultants.controller';
import { DiorCompanyConsultantsService } from './companyConsultants.service';
import {
    ConsultantBranchesRepository,
    ConsultantsRepository,
    CustomersRepository,
} from '@/src/common/repositories/crm';
import { CommonService } from '@/src/common/common.service';
import { AnalysisDataReplicationModule } from '../../dataReplication/analysisDataReplication/analysisDataReplication.module';

@Module({
    imports: [AnalysisDataReplicationModule],
    controllers: [DiorCompanyConsultantsController],
    providers: [
        DiorCompanyConsultantsService,
        CommonService,

        // Repos
        ConsultantsRepository,
        CustomersRepository,
        ConsultantBranchesRepository,
    ],
})
export class DiorCompanyConsultantsModule {}
