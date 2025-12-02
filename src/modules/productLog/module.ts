import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductLogEntity } from 'src/common/entities/crmEntities';

import { ProductLogController } from './controller';
import { ProductLogService } from './service';

@Global()
@Module({
    imports: [TypeOrmModule.forFeature([ProductLogEntity])],
    controllers: [ProductLogController],
    providers: [ProductLogService],
    exports: [ProductLogService],
})
export class ProductLogModule {}
