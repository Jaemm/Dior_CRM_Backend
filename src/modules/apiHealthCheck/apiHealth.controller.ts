import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('Health')
@Controller()
export class HealthController {
    @Get('/health')
    healthCheck(@Res() res: Response) {
        return res.status(HttpStatus.OK).json({ message: 'Server is up and running' });
    }
}
