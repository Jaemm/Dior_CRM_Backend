import { Request } from 'express';
import { Controller, Get, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/src/common/decorators/roles.decorator';
import { Role } from '@/src/common/enums/role.enum';
import { PartnerDbService } from './partnerdb.service';

@ApiTags('PartnerDB')
@Controller('partnerdb')
export class PartnerDbController {
    constructor(private partnerdbService: PartnerDbService) {}
}
