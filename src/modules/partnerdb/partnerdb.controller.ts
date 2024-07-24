import { Request } from 'express';
import { Body, Controller, Get, Param, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/src/common/decorators/roles.decorator';
import { Role } from '@/src/common/enums/role.enum';
import { PartnerDbService } from './partnerdb.service';
import { GetCustomerByConsultantDto } from './partnerdb.dto';

@ApiTags('PartnerDB')
@Controller('partnerdb')
export class PartnerDbController {
    constructor(private partnerdbService: PartnerDbService) {}

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
