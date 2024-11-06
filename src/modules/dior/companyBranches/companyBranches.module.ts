import { Module } from '@nestjs/common';
import { DiorCompanyBranchesController } from './companyBranches.controller';

import {
    ConsultantBranchesRepository,
    ConsultantsRepository,
    PresignRepository,
    ProductsRepository,
} from '@/src/common/repositories/crm';
import { AwsS3Service } from '@/src/common/awsS3/awsS3.service';

import { AnalysisDataReplicationModule } from '../../dataReplication/analysisDataReplication/analysisDataReplication.module';
import { DiorCompanyBranchesService } from './companyBranches.service';

@Module({
    imports: [AnalysisDataReplicationModule],
    controllers: [DiorCompanyBranchesController],
    providers: [
        DiorCompanyBranchesService,
        AwsS3Service,
        // Repos
        ConsultantsRepository,
        ConsultantBranchesRepository,
        ProductsRepository,
        PresignRepository,
    ],
})
export class DiorCompanyBranchesModule {}
