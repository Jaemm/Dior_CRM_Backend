import { Request } from 'express';
import { Controller, Get, Param, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/src/common/decorators/roles.decorator';
import { Role } from '@/src/common/enums/role.enum';
import { PartnerDbService } from './partnerdb.service';

@ApiTags('PartnerDB')
@Controller('partnerdb')
export class PartnerDbController {
    constructor(private partnerdbService: PartnerDbService) {}

    @Get('consultants/:id')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async getConsultantById(@Param('id') consultantId: string) {
        return await this.partnerdbService.getConsultantById(consultantId);
    }
}
