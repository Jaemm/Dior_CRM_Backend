import { Module } from '@nestjs/common';
import { DiorCompanyBranchesController } from './companyBranches.controller';
import { DiorCompanyBranchesService } from './companyBranches.service';
import { ConsultantBranchesRepository, ConsultantsRepository, ProductsRepository } from '@/src/common/repositories/crm';

@Module({
    controllers: [DiorCompanyBranchesController],
    providers: [DiorCompanyBranchesService, ConsultantsRepository, ConsultantBranchesRepository, ProductsRepository],
})
export class DiorCompanyBranchesModule {}
