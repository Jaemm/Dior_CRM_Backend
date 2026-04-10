export interface HealthCheckResponse {
    status: 'ok';
    timestamp: string;
    uptime: number;
}

export function createHealthCheckResponse(): HealthCheckResponse {
    return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: Math.round(process.uptime()),
    };
}
