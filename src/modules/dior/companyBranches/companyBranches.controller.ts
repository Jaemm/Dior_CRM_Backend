import { Request, Response } from 'express';
import { Controller, Get, Query, Req, Res, Headers, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { DiorCompanyBranchesService } from './companyBranches.service';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/src/common/decorators/roles.decorator';
import { Role } from '@/src/common/enums/role.enum';
import {
    CreateBranchesDto,
    ExportBranchesDto,
    ImportBranchesDto,
    PresignedUploadForBranchDto,
    SearchBranchesDto,
    UpdateBranchesDto,
} from './companyBranches.dto';

@ApiTags('Dior-Company Branches')
@Controller('dior/company_branches')
export class DiorCompanyBranchesController {
    constructor(private diorCompanyBranchesService: DiorCompanyBranchesService) {}

    @Post()
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async createBranch(@Req() req: Request, @Body() body: CreateBranchesDto) {
        return await this.diorCompanyBranchesService.createBranch(req, body);
    }

    @Get()
    @ApiBearerAuth()
    @ApiHeader({ name: 'X-CHOWIS-LOCALE', required: false })
    @Roles(Role.Consultant)
    async searchBranches(
        @Req() req: Request,
        @Query() query: SearchBranchesDto,
        @Headers('X-CHOWIS-LOCALE') locale: string,
    ) {
        return await this.diorCompanyBranchesService.searchBranches(req, query, locale);
    }

    @Post('import')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async importBranches(@Req() req: Request, @Body() body: ImportBranchesDto) {
        return await this.diorCompanyBranchesService.importBranches(body);
    }

    @Get('export')
    @ApiBearerAuth()
    @ApiHeader({ name: 'X-CHOWIS-LOCALE', required: false })
    @Roles(Role.Consultant)
    async exportBranches(
        @Headers('X-CHOWIS-LOCALE') locale: string,
        @Req() req: Request,
        @Res() res: Response,
        @Query() query: ExportBranchesDto,
    ) {
        const resultFile = await this.diorCompanyBranchesService.exportBranches(req, query, locale);

        res.header('Content-Type', 'text/csv');
        res.attachment('pos_list.csv');
        return res.send(resultFile);
    }

    @Get('presign_upload_import_file')
    @ApiBearerAuth()
    @ApiHeader({ name: 'X-CHOWIS-LOCALE', required: false })
    @Roles(Role.Consultant)
    async presignUploadImportFileForBranch(
        @Req() req: Request,
        @Query() query: PresignedUploadForBranchDto,
        @Headers('X-CHOWIS-LOCALE') locale?: string,
    ) {
        return await this.diorCompanyBranchesService.presignUploadImportFileForBranch(query);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Delete('delete_multiple/:ids')
    async deleteMultipleBranches(@Param('ids') branchIds: string) {
        return await this.diorCompanyBranchesService.deleteMultipleBranches(branchIds);
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
