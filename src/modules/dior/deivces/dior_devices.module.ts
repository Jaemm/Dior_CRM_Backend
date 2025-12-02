import { Module } from '@nestjs/common';
import { DiorDeivcesConroller } from './dior_devices.controller';
import { DiorDevicesService } from './dior_devices.service';
import { ConsultantsRepository, DevicesRepository, ProductsRepository } from '@/src/common/repositories/crm';
import { CommonService } from '@/src/common/common.service';
import { ProductLogModule } from '@/src/modules/productLog/module';

@Module({
    imports: [ProductLogModule],
    controllers: [DiorDeivcesConroller],
    providers: [CommonService, DiorDevicesService, ConsultantsRepository, ProductsRepository, DevicesRepository],
})
export class DiorDevicesModule {}
