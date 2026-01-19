import { Request, Response } from 'express';

import { Controller, Get, Req, Headers, Query, Param, Post, Body, Delete, Res } from '@nestjs/common';
import { DiorCompanyConsultantsService } from './companyConsultants.service';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/src/common/decorators/roles.decorator';
import { Role } from '@/src/common/enums/role.enum';
import {
    CreateDiorCompanyConsultantsDto,
    ExportDiorCompanyConsultantsDto,
    GetDiorCompanyConsultantsDto,
    ImportDiorCompanyConsultantsDto,
} from './companyConsultants.dto';

@ApiTags('Dior-Company Consultants')
@Controller('dior/company_consultants')
export class DiorCompanyConsultantsController {
    constructor(private diorCompanyConsultantsService: DiorCompanyConsultantsService) {}

    @Get()
    @ApiBearerAuth()
    @ApiHeader({ name: 'X-LOCALE', required: false })
    @Roles(Role.Consultant)
    async getDiorCompanyConsultants(
        @Headers('X-LOCALE') locale: string,
        @Req() req: Request,
        @Res() res: Response,
        @Query() query: GetDiorCompanyConsultantsDto,
    ) {
        const consultants = await this.diorCompanyConsultantsService.getDiorCompanyConsultants(req, query, locale);
        return res.status(200).send(consultants);
    }

    @Post()
    @ApiBearerAuth()
    @ApiHeader({ name: 'X-LOCALE', required: false })
    @Roles(Role.Consultant)
    async createDiorCompanyConsultants(
        @Headers('X-LOCALE') locale: string,
        @Res() res: Response,
        @Body() body: CreateDiorCompanyConsultantsDto,
    ) {
        const consultant = await this.diorCompanyConsultantsService.createDiorCompanyConsultants(body, locale);
        return res.status(200).send(consultant);
    }

    @Get('by_consultant')
    @ApiBearerAuth()
    @ApiHeader({ name: 'X-LOCALE', required: false })
    @Roles(Role.Consultant)
    async getConsultantByBranchesConsultant(
        @Req() req: Request,
        @Res() res: Response,
        @Headers('X-LOCALE') locale?: string,
    ) {
        const consultant = await this.diorCompanyConsultantsService.getConsultantByBranchesConsultant(req, locale);
        return res.status(200).send(consultant);
    }

    @Get('export')
    @ApiBearerAuth()
    @ApiHeader({ name: 'X-LOCALE', required: false })
    @Roles(Role.Consultant)
    async exportDiorCompanyConsultant(
        @Req() req: Request,
        @Res() res: Response,
        @Query() query: ExportDiorCompanyConsultantsDto,
        @Headers('X-LOCALE') locale?: string,
    ) {
        const resultFile = await this.diorCompanyConsultantsService.exportDiorCompanyConsultant(req, query, locale);

        res.header('Content-Type', 'text/csv');
        res.attachment('bc_list.csv');
        return res.send(resultFile);
    }

    @Post('import')
    @ApiBearerAuth()
    @ApiHeader({ name: 'X-LOCALE', required: false })
    @Roles(Role.Consultant)
    async importDiorCompanyConsultants(
        @Headers('X-LOCALE') locale: string,
        @Req() req: Request,
        @Res() res: Response,
        @Body() body: ImportDiorCompanyConsultantsDto,
    ) {
        const result = await this.diorCompanyConsultantsService.importDiorCompanyConsultants(req, body, locale);
        return res.status(200).send(result);
    }

    @Delete(':id')
    @ApiBearerAuth()
    @ApiHeader({ name: 'X-LOCALE', required: false })
    @Roles(Role.Consultant)
    async deleteDiorCompanyConsultant(
        @Headers('X-LOCALE') locale: string,
        @Res() res: Response,
        @Param('id') consultantId: string,
    ) {
        const result = await this.diorCompanyConsultantsService.deleteDiorCompanyConsultant(consultantId, locale);

        return res.status(200).send(result);
    }

    @Delete('delete_multiple/:ids')
    @ApiBearerAuth()
    @ApiHeader({ name: 'X-LOCALE', required: false })
    @Roles(Role.Consultant)
    async deleteMultipleCompanyConsultants(
        @Headers('X-LOCALE') locale: string,
        @Res() res: Response,
        @Param('ids') consultantIds: string,
    ) {
        const result = await this.diorCompanyConsultantsService.deleteMultipleCompanyConsultants(consultantIds, locale);
        return res.status(200).send(result);
    }
}
