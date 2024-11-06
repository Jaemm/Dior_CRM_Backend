import { Response } from 'express';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Req, Query, Post, Body, Headers, Header, Res } from '@nestjs/common';

import { DiorService } from './dior.service';
import { Roles } from '@/src/common/decorators/roles.decorator';
import { Role } from '@/src/common/enums/role.enum';
import { CustomerByConsultantIdDto, CreateCustomerDto, SendWebResultDto } from './dior.dto';

@ApiTags('Dior')
@Controller('dior')
export class DiorController {
    constructor(private readonly diorService: DiorService) {}

    @Get('customers')
    @ApiBearerAuth()
    @ApiHeader({ name: 'X-CHOWIS-LOCALE', required: false })
    @Roles(Role.Consultant)
    async getCustomers(
        @Headers('X-CHOWIS-LOCALE') locale: string,
        @Res() res: Response,
        @Query() query: CustomerByConsultantIdDto,
    ) {
        const customers = await this.diorService.getCustomers(query, locale);
        return res.status(200).send(customers);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Post('customers')
    async createCustomers(@Res() res: Response, @Body() body: CreateCustomerDto) {
        const result = await this.diorService.createCustomers(body);
        return res.status(200).send(result);
    }
    //

    @Post('send-web-result')
    @ApiBearerAuth()
    @ApiHeader({ name: 'X-CHOWIS-LOCALE', required: false })
    @Roles(Role.Consultant)
    async sendWebResult(
        @Headers('X-CHOWIS-LOCALE') locale: string,
        @Res() res: Response,
        @Body() body: SendWebResultDto,
    ) {
        const result = await this.diorService.sendWebResult(body, locale);
        return res.status(200).send(result);
    }
}
