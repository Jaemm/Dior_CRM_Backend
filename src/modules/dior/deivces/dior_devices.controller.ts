import { Controller, Get, Headers, Query, Post, Req, Body } from '@nestjs/common';
import { DiorDevicesService } from './dior_devices.service';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { Role } from '@/src/common/enums/role.enum';
import { Roles } from '@/src/common/decorators/roles.decorator';
import { GetDevicesDto, ResetConnectDto } from './dior_devices.dto';
import { Request } from 'express';

@ApiTags('Dior-Devices')
@Controller('dior/devices')
export class DiorDeivcesConroller {
    constructor(private diorDevicesService: DiorDevicesService) {}

    @Get()
    @ApiHeader({ name: 'X-CHOWIS-LOCALE', required: false })
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async getDevices(@Req() req: Request, @Query() query: GetDevicesDto, @Headers('X-CHOWIS-LOCALE') locale?: string) {
        return await this.diorDevicesService.getDevices(req, query, locale);
    }

    @Post('connect-reset')
    @ApiHeader({ name: 'X-CHOWIS-LOCALE', required: false })
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async resetConnect(
        @Req() req: Request,
        @Body() body: ResetConnectDto,
        @Headers('X-CHOWIS-LOCALE') locale?: string,
    ) {
        return await this.diorDevicesService.resetConnect(req, body, locale);
    }
}
