import { Module } from '@nestjs/common';
import { DiorCompanyConsultantsController } from './companyConsultants.controller';
import { DiorCompanyConsultantsService } from './companyConsultants.service';
import { ConsultantsRepository } from '@/src/common/repositories/crm';
import { CommonService } from '@/src/common/common.service';

@Module({
    controllers: [DiorCompanyConsultantsController],
    providers: [DiorCompanyConsultantsService, CommonService, ConsultantsRepository],
})
export class DiorCompanyConsultantsModule {}
