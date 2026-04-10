import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public-route.decorator';
import { HealthService } from './apiHealth.service';

@ApiTags('Health')
@Controller()
export class HealthController {
    constructor(private readonly healthService: HealthService) {}

    @Public()
    @Get(['health', 'healthz'])
    healthCheck() {
        return this.healthService.getHealth();
    }
}
