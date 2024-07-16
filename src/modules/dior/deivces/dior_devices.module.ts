import { Module } from '@nestjs/common';
import { DiorDeivcesConroller } from './dior_devices.controller';
import { DiorDevicesService } from './dior_devices.service';
import {
    ConsultantCompaniesRepository,
    ConsultantsRepository,
    DevicesRepository,
    ProductsRepository,
} from '@/src/common/repositories/crm';

@Module({
    controllers: [DiorDeivcesConroller],
    providers: [DiorDevicesService, ConsultantsRepository, ProductsRepository, DevicesRepository],
})
export class DiorDevicesModule {}
