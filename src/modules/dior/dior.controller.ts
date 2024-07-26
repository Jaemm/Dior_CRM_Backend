import { ApiBearerAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Req, Query, Post, Body, Headers } from '@nestjs/common';
import { DiorService } from './dior.service';
import { Roles } from '@/src/common/decorators/roles.decorator';
import { Role } from '@/src/common/enums/role.enum';
import { Request, query } from 'express';
import { CustomerByConsultantIdDto, CreateCustomerDto } from './dior.dto';

@ApiTags('Dior')
@Controller('dior')
export class DiorController {
    constructor(private readonly diorService: DiorService) {}

    @Get('customers')
    @ApiBearerAuth()
    @ApiHeader({ name: 'X-CHOWIS-LOCALE', required: false })
    @Roles(Role.Consultant)
    async getCustomers(@Query() query: CustomerByConsultantIdDto, @Headers('X-CHOWIS-LOCALE') locale: string) {
        return await this.diorService.getCustomers(query, locale);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Post('customers')
    async createCustomers(@Body() body: CreateCustomerDto) {
        return await this.diorService.createCustomers(body);
    }
}
