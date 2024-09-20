import { Controller, Get, Query } from '@nestjs/common';
import { UtilsService } from './utils.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/src/common/decorators/roles.decorator';
import { Role } from '@/src/common/enums/role.enum';

@ApiTags('Dior-Admins')
@Controller('utils')
export class UtilsController {
    constructor(private readonly utlis: UtilsService) {}

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Get('generate_qr_code')
    async generateQrCode(@Query('url') url: string) {
        const qrCodeUrl = await this.utlis.generateQrCode(url);

        console.log(qrCodeUrl);
        return { qr_code_url: qrCodeUrl };
    }
}
