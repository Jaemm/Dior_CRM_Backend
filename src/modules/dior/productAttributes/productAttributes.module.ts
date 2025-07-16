import { Module } from '@nestjs/common';
import { DiorProductAttributesController } from './productAttributes.controller';
import { DiorProductAttributesService } from './productAttributes.service';
import {
    ConsultantsRepository,
    ProductAttributeTranslationsRepository,
    ProductAttributesRepository,
} from '@/src/common/repositories/crm';

@Module({
    controllers: [DiorProductAttributesController],
    providers: [
        DiorProductAttributesService,

        // Repos
        ConsultantsRepository,
        ProductAttributesRepository,
        ProductAttributeTranslationsRepository,
    ],
})
export class DiorProductAttributesModule {}
