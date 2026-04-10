import { Module } from '@nestjs/common';
import { HealthController } from './apiHealth.controller';
import { HealthService } from './apiHealth.service';

@Module({
    providers: [HealthService],
    controllers: [HealthController],
})
export class HealthModule {}
