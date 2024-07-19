import { Module } from '@nestjs/common';
import { DiorProductAttributesController } from './productAttributes.controller';
import { DiorProductAttributesService } from './productAttributes.service';
import { ConsultantsRepository, ProductAttributesRepository } from '@/src/common/repositories/crm';

@Module({
    controllers: [DiorProductAttributesController],
    providers: [DiorProductAttributesService, ConsultantsRepository, ProductAttributesRepository],
})
export class DiorProductAttributesModule {}
