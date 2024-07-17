import { Request } from 'express';
import { Controller, Get, Query, Req, Headers, Post, Body } from '@nestjs/common';
import { DiorCompanyBranchesService } from './companyBranches.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '@/src/common/decorators/roles.decorator';
import { Role } from '@/src/common/enums/role.enum';
import { CreateBranchesDto, SearchBranchesDto } from './companyBranches.dto';

@Controller('dior/company_branches')
export class DiorCompanyBranchesController {
    constructor(private diorCompanyBranchesService: DiorCompanyBranchesService) {}

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Post()
    async createBranches(@Req() req: Request, @Body() body: CreateBranchesDto) {
        return await this.diorCompanyBranchesService.createBranches(req, body);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Get()
    async searchBranches(
        @Req() req: Request,
        @Query() query: SearchBranchesDto,
        @Headers('X-CHOWIS-LOCALE') locale: string,
    ) {
        return await this.diorCompanyBranchesService.searchBranches(req, query, locale);
    }
}
