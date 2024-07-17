import { Module } from '@nestjs/common';
import { DiorDeivcesConroller } from './dior_devices.controller';
import { DiorDevicesService } from './dior_devices.service';
import {
    ConsultantCompaniesRepository,
    ConsultantsRepository,
    DevicesRepository,
    ProductLogsRepository,
    ProductsRepository,
} from '@/src/common/repositories/crm';
import { CommonService } from '@/src/common/common.service';

@Module({
    controllers: [DiorDeivcesConroller],
    providers: [
        CommonService,

        // Repos
        DiorDevicesService,
        ConsultantsRepository,
        ProductsRepository,
        DevicesRepository,
        ProductLogsRepository,
    ],
})
export class DiorDevicesModule {}
