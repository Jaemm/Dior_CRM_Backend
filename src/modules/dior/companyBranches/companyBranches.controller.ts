import { Request } from 'express';
import { Controller, Get, Query, Req, Headers, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { DiorCompanyBranchesService } from './companyBranches.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '@/src/common/decorators/roles.decorator';
import { Role } from '@/src/common/enums/role.enum';
import { CreateBranchesDto, SearchBranchesDto, UpdateBranchesDto } from './companyBranches.dto';

@Controller('dior/company_branches')
export class DiorCompanyBranchesController {
    constructor(private diorCompanyBranchesService: DiorCompanyBranchesService) {}

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Post()
    async createBranch(@Req() req: Request, @Body() body: CreateBranchesDto) {
        return await this.diorCompanyBranchesService.createBranch(req, body);
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

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Put(':id')
    async updateBranch(@Param('id') branchId: string, @Body() body: UpdateBranchesDto) {
        return await this.diorCompanyBranchesService.updateBranch(branchId, body);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Delete(':id')
    async deleteBranch(@Param('id') branchId: string) {
        return await this.diorCompanyBranchesService.deleteBranch(branchId);
    }
}
