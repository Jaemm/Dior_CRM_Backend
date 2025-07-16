import { Controller, Get, Query, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { UtilsService } from './utils.service';

@ApiTags('Dior-Admins')
@Controller('utils')
export class UtilsController {
    constructor(private readonly utlis: UtilsService) {}

    @ApiBearerAuth()
    @Get('generate_qr_code')
    generateQRCodeUrl(@Query('url') url: string) {
        const qrCodeImageUrl = `https://${process.env.DOMAIN}/api/utils/serve_qr_code?url=${encodeURIComponent(url)}`;
        return { qr_code_url: qrCodeImageUrl };
    }

    @Get('serve_qr_code')
    async generateQrCode(@Query('url') url: string, @Res() res: Response) {
        const qrCode = await this.utlis.generateQrCode(url);

        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', 'inline; filename="qrcode.png"');
        return res.send(qrCode);
    }
}
