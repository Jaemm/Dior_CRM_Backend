import { Request } from 'express';

import { Roles } from '@/src/common/decorators/roles.decorator';
import { Role } from '@/src/common/enums/role.enum';
import { Controller, Get, Query, Req } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { GetOverAllDetailsDto, GetOverAllDto } from './statistics.dto';
import { StatisticsService } from './statistics.service';

@Controller('dior/statistics')
export class StatisticsController {
    constructor(private statisticsService: StatisticsService) {}

    @Get('overall')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async getOverAll(@Req() req: Request, @Query() query: GetOverAllDto) {
        return this.statisticsService.getOverAll(req, query);
    }

    @Get('overall_details')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async getOverAllDetails(@Req() req: Request, @Query() query: GetOverAllDetailsDto) {
        return this.statisticsService.getOverAllDetails(req, query);
    }

    @Get('overall_by_date')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async getOverAllByDate(@Req() req: Request) {
        return this.statisticsService.getOverAllByDate();
    }

    @Get('overall_per_country')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async getOverAllPerCountry(@Req() req: Request) {
        return this.statisticsService.getOverAllPerCountry(req);
    }
}
