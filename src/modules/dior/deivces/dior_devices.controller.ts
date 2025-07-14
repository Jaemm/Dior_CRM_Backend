import { Controller, Get, Headers, Query, Post, Req, Body, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';

import { DiorDevicesService } from './dior_devices.service';
import { Role } from '@/src/common/enums/role.enum';
import { Roles } from '@/src/common/decorators/roles.decorator';
import { GetDevicesDto, ResetConnectDto } from './dior_devices.dto';

@ApiTags('Dior-Devices')
@Controller('dior/devices')
export class DiorDeivcesConroller {
    constructor(private diorDevicesService: DiorDevicesService) {}

    @Get()
    @ApiHeader({ name: 'X-CHOWIS-LOCALE', required: false })
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async getDevices(
        @Req() req: Request,
        @Res() res: Response,
        @Query() query: GetDevicesDto,
        @Headers('X-CHOWIS-LOCALE') locale?: string,
    ) {
        const devices = await this.diorDevicesService.getDevices(req, query, locale);
        return res.status(200).send(devices);
    }

    @Post('connect-reset')
    @ApiHeader({ name: 'X-CHOWIS-LOCALE', required: false })
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async resetConnect(
        @Req() req: Request,
        @Res() res: Response,
        @Body() body: ResetConnectDto,
        @Headers('X-CHOWIS-LOCALE') locale?: string,
    ) {
        console.log('=======>', body);
        const result = await this.diorDevicesService.resetConnect(req, body, locale);
        return res.status(200).send(result);
    }
}
