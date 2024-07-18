import { Request, Response } from 'express';

import { Controller, Get, Req, Headers, Query } from '@nestjs/common';
import { DiorCompanyConsultantsService } from './companyConsultants.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '@/src/common/decorators/roles.decorator';
import { Role } from '@/src/common/enums/role.enum';
import { GetDiorCompanyConsultantsDto } from './companyConsultants.dto';

@Controller('dior/company_consultants')
export class DiorCompanyConsultantsController {
    constructor(private diorCompanyConsultantsService: DiorCompanyConsultantsService) {}

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Get()
    async getDiorCompanyConsultants(
        @Headers('X-CHOWIS-LOCALE') locale: string,
        @Req() req: Request,
        @Query() query: GetDiorCompanyConsultantsDto,
    ) {
        return await this.diorCompanyConsultantsService.getDiorCompanyConsultants(req, query, locale);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Get('by_consultant')
    async getConsultantByBranchesConsultant(@Req() req: Request, @Headers('X-CHOWIS-LOCALE') locale: string) {
        return await this.diorCompanyConsultantsService.getConsultantByBranchesConsultant(req, locale);
    }
}
