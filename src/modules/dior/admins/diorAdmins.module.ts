import { Module } from '@nestjs/common';
import { DiorAdminsController } from './diorAdmins.controller';
import { DiorAdminsService } from './diorAdmins.service';
import { ConsultantsRepository } from '@/src/common/repositories/crm';
import { CommonService } from '@/src/common/common.service';

@Module({
    controllers: [DiorAdminsController],
    providers: [DiorAdminsService, CommonService, ConsultantsRepository],
})
export class DiorAdminsModule {}
