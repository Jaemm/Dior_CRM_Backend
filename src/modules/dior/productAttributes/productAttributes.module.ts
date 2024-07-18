import { Module } from '@nestjs/common';
import { DiorProductAttributesController } from './productAttributes.controller';
import { DiorProductAttributesService } from './productAttributes.service';

@Module({
    controllers: [DiorProductAttributesController],
    providers: [DiorProductAttributesService],
})
export class DiorProductAttributesModule {}
