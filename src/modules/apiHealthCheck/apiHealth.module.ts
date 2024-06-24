import { Module } from '@nestjs/common';
import { HealthController } from './apiHealth.controller';

@Module({

    providers: [],
    controllers: [HealthController],

})
export class HealthModule {}
