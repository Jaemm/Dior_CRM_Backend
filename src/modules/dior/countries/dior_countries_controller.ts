import { Controller, Query, Req, Res, Body, Param, Put, Get, Post, Delete } from '@nestjs/common';
import { Request, Response } from 'express';
import { DiorCountriesService } from './dior_countries.service';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/src/common/decorators/roles.decorator';
import { Role } from '@/src/common/enums/role.enum';
import { CreateCountries, ExportCountriesDto, ImportCountriesDto, UpdateCountriesDto } from './dior_countries.dto';

@ApiTags('Dior-Countries')
@Controller('dior/countries')
export class DiorCountriesController {
    constructor(private diorCountriesService: DiorCountriesService) {}

    @Get()
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @ApiQuery({ name: 'search', required: false })
    async getCountries(@Req() req: Request, @Query('search') search?: string) {
        return await this.diorCountriesService.getCountries(search);
    }

    @Post()
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async createCountries(@Body() body: CreateCountries) {
        return await this.diorCountriesService.createCountries(body);
    }

    @Put(':id')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async updateCountries(@Param('id') countryId: string, @Body() body: UpdateCountriesDto) {
        return await this.diorCountriesService.updateCountries(countryId, body);
    }

    @Delete('delete_multiple/:ids')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async deleteMultipleCountries(@Param('ids') countryIds: string) {
        return await this.diorCountriesService.deleteMultipleCountries(countryIds);
    }

    @Delete(':id')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async deleteCountryById(@Param('id') countryId: string) {
        return await this.diorCountriesService.deleteCountryById(countryId);
    }

    @Get('export')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
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
