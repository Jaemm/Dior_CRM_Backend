import { Request } from 'express';
import { Body, Controller, Get, Param, Post, Query, Req, Headers } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/src/common/decorators/roles.decorator';
import { Role } from '@/src/common/enums/role.enum';
import { PartnerDbService } from './partnerdb.service';
import { GetCustomerByConsultantDto, LoginDiorConsultantDto, ResetPasswordDto } from './partnerdb.dto';

@ApiTags('PartnerDB')
@Controller('partnerdb')
export class PartnerDbController {
    constructor(private partnerdbService: PartnerDbService) {}

    @Post('consultants/dior_login')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async loginDiorConsultant(@Body() body: LoginDiorConsultantDto, @Headers('X-CHOWIS-LOCALE') locale?: string) {
        return await this.partnerdbService.loginDiorConsultant(body, locale);
    }

    @Post('consultants/password')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async resetPassword(@Body() body: ResetPasswordDto, @Headers('X-CHOWIS-LOCALE') locale?: string) {
        return await this.partnerdbService.resetPassword(body, locale);
    }

    @Get('consultants/:id/customers')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async getCustomersByConsultantId(@Param('id') consultantId: string, @Query() query: GetCustomerByConsultantDto) {
        return await this.partnerdbService.getCustomersByConsultantId(consultantId, query);
    }

    @Get('consultants/:id')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async getConsultantById(@Param('id') consultantId: string) {
        return await this.partnerdbService.getConsultantById(consultantId);
    }
}
