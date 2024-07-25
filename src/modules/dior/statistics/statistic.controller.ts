import { Request } from 'express';

import { Roles } from '@/src/common/decorators/roles.decorator';
import { Role } from '@/src/common/enums/role.enum';
import { Controller, Get, Query, Req, Headers } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { GetInfographStatDetails, GetOverAllDetailsDto, GetOverAllDto, GetStatDetailsDto } from './statistics.dto';
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
    async getOverAllByDate() {
        return this.statisticsService.getOverAllByDate();
    }

    @Get('overall_per_country')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async getOverAllPerCountry(@Req() req: Request) {
        return this.statisticsService.getOverAllPerCountry(req);
    }

    @Get('most_popular_products')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async getMostPopularProducts(@Req() req: Request) {
        return this.statisticsService.getMostPopularProducts();
    }

    @Get('stat_details')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async getStatDetails(
        @Req() req: Request,
        @Query() query: GetStatDetailsDto,
        @Headers('X-CHOWIS-LOCALE') locale?: string,
    ) {
        return this.statisticsService.getStatDetails(req, query, locale);
    }

    @Get('infograph_stat_details')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async getInfographStatDetails(
        @Req() req: Request,
        @Query() query: GetInfographStatDetails,
        @Headers('X-CHOWIS-LOCALE') locale?: string,
    ) {
        return this.statisticsService.getInfographStatDetails(req, query, locale);
    }
}
