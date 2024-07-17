import { Controller, Get, Headers, Query, Post, Req, Body } from '@nestjs/common';
import { DiorDevicesService } from './dior_devices.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@/src/common/enums/role.enum';
import { Roles } from '@/src/common/decorators/roles.decorator';
import { GetDevicesDto, ResetConnectDto } from './dior_devices.dto';
import { Request } from 'express';

@Controller('dior/devices')
export class DiorDeivcesConroller {
    constructor(private diorDevicesService: DiorDevicesService) {}

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Get()
    async getDevices(@Req() req: Request, @Headers('X-CHOWIS-LOCALE') locale: string, @Query() query: GetDevicesDto) {
        return await this.diorDevicesService.getDevices(req, query, locale);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Post('connect-reset')
    async resetConnect(@Req() req: Request, @Headers('X-CHOWIS-LOCALE') locale: string, @Body() body: ResetConnectDto) {
        return await this.diorDevicesService.resetConnect(req, body, locale);
    }
}
