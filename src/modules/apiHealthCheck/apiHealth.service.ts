import { Injectable } from '@nestjs/common';
import { createHealthCheckResponse, HealthCheckResponse } from './apiHealth.response';

@Injectable()
export class HealthService {
    getHealth(): HealthCheckResponse {
        return createHealthCheckResponse();
    }
}
