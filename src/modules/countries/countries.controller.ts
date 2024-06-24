import { Body, Controller, Get, Param, Post, Query, Res } from '@nestjs/common';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CountriesService } from './countries.service';
import { Response, Request } from 'express';
import { CountriesDto } from './countries.dto';
import { Role } from '@/src/common/enums/role.enum';
import { Roles } from '@/src/common/decorators/roles.decorator';

@ApiTags('Countries')
@Controller('countries')
export class CountriesController {
    constructor(private readonly countriesService: CountriesService) {}

    @ApiTags('Additional')
    @ApiBearerAuth()
    @Roles(Role.Consultant, Role.Customer)
    @Get()
    async countries(@Res() res: Response, @Query() params: CountriesDto): Promise<any> {
        const countriesResult = await this.countriesService.findCountriesByName(params);
        return res.status(200).send({ countries: countriesResult });
    }
}
