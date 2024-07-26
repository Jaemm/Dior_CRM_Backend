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
    @ApiHeader({ name: 'X-CHOWIS-LOCALE', required: false })
    @Roles(Role.Consultant)
    async getDiorCompanyConsultants(
        @Headers('X-CHOWIS-LOCALE') locale: string,
        @Req() req: Request,
        @Query() query: GetDiorCompanyConsultantsDto,
    ) {
        return await this.diorCompanyConsultantsService.getDiorCompanyConsultants(req, query, locale);
    }

    @Post()
    @ApiBearerAuth()
    @ApiHeader({ name: 'X-CHOWIS-LOCALE', required: false })
    @Roles(Role.Consultant)
    async createDiorCompanyConsultants(
        @Headers('X-CHOWIS-LOCALE') locale: string,
        @Req() req: Request,
        @Body() body: CreateDiorCompanyConsultantsDto,
    ) {
        return await this.diorCompanyConsultantsService.createDiorCompanyConsultants(body, locale);
    }

    @Get('by_consultant')
    @ApiBearerAuth()
    @ApiHeader({ name: 'X-CHOWIS-LOCALE', required: false })
    @Roles(Role.Consultant)
    async getConsultantByBranchesConsultant(@Req() req: Request, @Headers('X-CHOWIS-LOCALE') locale?: string) {
        return await this.diorCompanyConsultantsService.getConsultantByBranchesConsultant(req, locale);
    }

    @Get('export')
    @ApiBearerAuth()
    @ApiHeader({ name: 'X-CHOWIS-LOCALE', required: false })
    @Roles(Role.Consultant)
    async exportDiorCompanyConsultant(
        @Req() req: Request,
        @Res() res: Response,
        @Query() query: ExportDiorCompanyConsultantsDto,
        @Headers('X-CHOWIS-LOCALE') locale?: string,
    ) {
        const resultFile = await this.diorCompanyConsultantsService.exportDiorCompanyConsultant(req, query, locale);

        res.header('Content-Type', 'text/csv');
        res.attachment('bc_list.csv');
        return res.send(resultFile);
    }

    @Post('import')
    @ApiBearerAuth()
    @ApiHeader({ name: 'X-CHOWIS-LOCALE', required: false })
    @Roles(Role.Consultant)
    async importDiorCompanyConsultants(
        @Headers('X-CHOWIS-LOCALE') locale: string,
        @Req() req: Request,
        @Body() body: ImportDiorCompanyConsultantsDto,
    ) {
        return await this.diorCompanyConsultantsService.importDiorCompanyConsultants(body, locale);
    }

    @Delete(':id')
    @ApiBearerAuth()
    @ApiHeader({ name: 'X-CHOWIS-LOCALE', required: false })
    @Roles(Role.Consultant)
    async deleteDiorCompanyConsultant(
        @Headers('X-CHOWIS-LOCALE') locale: string,
        @Req() req: Request,
        @Param('id') consultantId: string,
    ) {
        return await this.diorCompanyConsultantsService.deleteDiorCompanyConsultant(consultantId, locale);
    }

    @Delete('delete_multiple/:ids')
    @ApiBearerAuth()
    @ApiHeader({ name: 'X-CHOWIS-LOCALE', required: false })
    @Roles(Role.Consultant)
    async deleteMultipleCompanyConsultants(
        @Headers('X-CHOWIS-LOCALE') locale: string,
        @Req() req: Request,
        @Param('ids') consultantIds: string,
    ) {
        return await this.diorCompanyConsultantsService.deleteMultipleCompanyConsultants(consultantIds, locale);
    }
}
