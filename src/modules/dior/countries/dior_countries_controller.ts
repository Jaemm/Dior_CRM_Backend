import { Controller, Query, Req, Body, Param, Put, Get, Post, Delete } from '@nestjs/common';
import { DiorCountriesService } from './dior_countries.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '@/src/common/decorators/roles.decorator';
import { Role } from '@/src/common/enums/role.enum';
import { CreateCountries, UpdateCountriesDto } from './dior_countries.dto';

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
}
