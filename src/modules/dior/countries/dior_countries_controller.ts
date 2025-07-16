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
    async getCountries(@Res() res: Response, @Query('search') search?: string) {
        const countries = await this.diorCountriesService.getCountries(search);
        return res.status(200).send(countries);
    }

    @Post()
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async createCountries(@Res() res: Response, @Body() body: CreateCountries) {
        const result = await this.diorCountriesService.createCountries(body);
        return res.status(200).send(result);
    }

    @Put(':id')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async updateCountries(@Res() res: Response, @Param('id') countryId: string, @Body() body: UpdateCountriesDto) {
        const countries = await this.diorCountriesService.updateCountries(countryId, body);
        return res.status(200).send(countries);
    }

    @Delete('delete_multiple/:ids')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async deleteMultipleCountries(@Res() res: Response, @Param('ids') countryIds: string) {
        const result = await this.diorCountriesService.deleteMultipleCountries(countryIds);
        return res.status(200).send(result);
    }

    @Delete(':id')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async deleteCountryById(@Res() res: Response, @Param('id') countryId: string) {
        const result = await this.diorCountriesService.deleteCountryById(countryId);
        return res.status(200).send(result);
    }

    @Get('export')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async exportCountries(@Res() res: Response, @Query() query: ExportCountriesDto) {
        const resultFile = await this.diorCountriesService.exportCountries(query);

        res.header('Content-Type', 'text/csv');
        res.attachment('countries_list.csv');
        return res.send(resultFile);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Post('import')
    async importCountries(@Req() req: Request, @Res() res: Response, @Body() body: ImportCountriesDto) {
        const result = await this.diorCountriesService.importCountries(req, body);
        return res.status(200).send(result);
    }
}
