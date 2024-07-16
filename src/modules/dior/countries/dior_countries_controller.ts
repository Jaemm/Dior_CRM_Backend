import { Controller, Get, Post, Query, Req, Body } from '@nestjs/common';
import { DiorCountriesService } from './dior_countries.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '@/src/common/decorators/roles.decorator';
import { Role } from '@/src/common/enums/role.enum';
import { CreateCountries } from './dior_countries.dto';

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
}
