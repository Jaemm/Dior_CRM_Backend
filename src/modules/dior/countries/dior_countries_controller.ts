import { Controller, Query, Req, Res, Body, Param, Put, Get, Post, Delete } from '@nestjs/common';
import { Request, Response } from 'express';
import { DiorCountriesService } from './dior_countries.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '@/src/common/decorators/roles.decorator';
import { Role } from '@/src/common/enums/role.enum';
import { CreateCountries, ExportCountriesDto, ImportCountriesDto, UpdateCountriesDto } from './dior_countries.dto';

@Controller('dior/countries')
export class DiorCountriesController {
    constructor(private diorCountriesService: DiorCountriesService) {}

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Get()
    async getCountries(@Req() req: Request, @Query('search') search?: string) {
        return await this.diorCountriesService.getCountries(search);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Post()
    async createCountries(@Body() body: CreateCountries) {
        return await this.diorCountriesService.createCountries(body);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Put(':id')
    async updateCountries(@Param('id') countryId: string, @Body() body: UpdateCountriesDto) {
        return await this.diorCountriesService.updateCountries(countryId, body);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Delete('delete_multiple/:ids')
    async deleteMultipleCountries(@Param('ids') countryIds: string) {
        return await this.diorCountriesService.deleteMultipleCountries(countryIds);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Delete(':id')
    async deleteCountryById(@Param('id') countryId: string) {
        return await this.diorCountriesService.deleteCountryById(countryId);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Get('export')
    async exportCountries(@Req() req: Request, @Res() res: Response, @Query() query: ExportCountriesDto) {
        const resultFile = await this.diorCountriesService.exportCountries(query);

        res.header('Content-Type', 'text/csv');
        res.attachment('countries_list.csv');
        return res.send(resultFile);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Post('import')
    async importCountries(@Req() req: Request, @Body() body: ImportCountriesDto) {
        return await this.diorCountriesService.importCountries(body);
    }
}
