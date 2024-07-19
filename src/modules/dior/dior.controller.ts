import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Req, Query, Post, Body, Headers } from '@nestjs/common';
import { DiorService } from './dior.service';
import { Roles } from '@/src/common/decorators/roles.decorator';
import { Role } from '@/src/common/enums/role.enum';
import { Request, query } from 'express';
import { CustomerByConsultantIdDto, createCustomerDto } from './dior.dto';

@ApiTags('Dior')
@Controller('dior')
export class DiorController {
    constructor(private readonly diorService: DiorService) {}

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Get('customers')
    async getCustomers(@Query() query: CustomerByConsultantIdDto, @Headers('X-CHOWIS-LOCALE') locale: string) {
        return await this.diorService.getCustomers(query, locale);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Post('customers')
    async createCustomers(@Body() body: createCustomerDto) {
        return await this.diorService.createCustomers(body);
    }
}
