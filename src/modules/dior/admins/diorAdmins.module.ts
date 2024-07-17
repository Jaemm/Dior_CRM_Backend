import { Module } from '@nestjs/common';
import { DiorAdminsController } from './diorAdmins.controller';
import { DiorAdminsService } from './diorAdmins.service';
import { ConsultantsRepository } from '@/src/common/repositories/crm';

@Module({
    controllers: [DiorAdminsController],
    providers: [DiorAdminsService, ConsultantsRepository],
})
export class DiorAdminsModule {}
