import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { ChowisServiceService } from './chowis-service.service';
import { Request, Response } from 'express';
import { ExpirationCheckDto } from './chowis-service.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Chowis Service')
@Controller('chowis-service')
export class ChowisServiceController {
    constructor(private readonly chowisServiceService: ChowisServiceService) {}

    @ApiBearerAuth()
    @Post('expirationCheck')
    async checkLicenseExpiration(@Req() req: Request, @Res() res: Response, @Body() data: ExpirationCheckDto) {
        const response = await this.chowisServiceService.checkLicenseExpiration(data);
        return res.status(200).send(response);
    }
}
