import { Controller, Get, Query, Res } from '@nestjs/common';
import { UtilsService } from './utils.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/src/common/decorators/roles.decorator';
import { Role } from '@/src/common/enums/role.enum';
import { Response } from 'express';

@ApiTags('Dior-Admins')
@Controller('utils')
export class UtilsController {
    constructor(private readonly utlis: UtilsService) {}

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Get('generate_qr_code')
    async generateQrCode(@Query('url') url: string, @Res() res: Response) {
        const qrCode = await this.utlis.generateQrCode(url);

        // Set the response headers to serve the image
        // res.setHeader('Content-Type', 'image/png');
        // res.setHeader('Content-Disposition', 'inline; filename="qrcode.png"');

        return { qr_code_url: qrCode };
        // Send the image buffer as the response
        return res.send(qrCode);
    }
}
