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
    async createBranch(@Req() req: Request, @Res() res: Response, @Body() body: CreateBranchesDto) {
        const result = await this.diorCompanyBranchesService.createBranch(req, body);
        return res.status(200).send(result);
    }

    @Get()
    @ApiBearerAuth()
    @ApiHeader({ name: 'X-CHOWIS-LOCALE', required: false })
    @Roles(Role.Consultant)
    async searchBranches(
        @Req() req: Request,
        @Res() res: Response,
        @Query() query: SearchBranchesDto,
        @Headers('X-CHOWIS-LOCALE') locale: string,
    ) {
        const branches = await this.diorCompanyBranchesService.searchBranches(req, query, locale);
        return res.status(200).send(branches);
    }

    @Post('import')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async importBranches(@Req() req: Request, @Res() res: Response, @Body() body: ImportBranchesDto) {
        const result = await this.diorCompanyBranchesService.importBranches(body);
        return res.status(200).send(result);
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
        @Res() res: Response,
        @Query() query: PresignedUploadForBranchDto,
        @Headers('X-CHOWIS-LOCALE') locale?: string,
    ) {
        const result = await this.diorCompanyBranchesService.presignUploadImportFileForBranch(query);
        return res.status(200).send(result);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Delete('delete_multiple/:ids')
    async deleteMultipleBranches(@Res() res: Response, @Param('ids') branchIds: string) {
        const result = await this.diorCompanyBranchesService.deleteMultipleBranches(branchIds);
        return res.status(200).send(result);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Put(':id')
    async updateBranch(@Res() res: Response, @Param('id') branchId: string, @Body() body: UpdateBranchesDto) {
        const branch = await this.diorCompanyBranchesService.updateBranch(branchId, body);
        return res.status(200).send(branch);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Delete(':id')
    async deleteBranch(@Res() res: Response, @Param('id') branchId: string) {
        const result = await this.diorCompanyBranchesService.deleteBranch(branchId);
        return res.status(200).send(result);
    }
}
