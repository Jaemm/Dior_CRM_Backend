import { Module } from '@nestjs/common';
import { DiorCompanyBranchesController } from './companyBranches.controller';
import { DiorCompanyBranchesService } from './companyBranches.service';
import {
    ConsultantBranchesRepository,
    ConsultantsRepository,
    PresignRepository,
    ProductsRepository,
} from '@/src/common/repositories/crm';
import { AwsS3Service } from '@/src/common/awsS3/awsS3.service';

@Module({
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
