import { Request, Response } from 'express';
import { Controller, Get, Query, Req, Headers, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';

import { Roles } from '@/src/common/decorators/roles.decorator';
import { Role } from '@/src/common/enums/role.enum';

import {
    GetInfographStatDetails,
    GetOverAllDetailsDto,
    GetOverAllDto,
    GetStatDetailsCountryWiseDto,
    GetStatDetailsDto,
} from './statistics.dto';
import { StatisticsService } from './statistics.service';

@ApiTags('Dior-Statistics')
@Controller('dior/statistics')
export class StatisticsController {
    constructor(private statisticsService: StatisticsService) {}

    @Get('overall')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async getOverAll(@Req() req: Request, @Res() res: Response, @Query() query: GetOverAllDto) {
        const result = await this.statisticsService.getOverAll(req, query);
        return res.status(200).send(result);
    }

    @Get('overall_details')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async getOverAllDetails(@Req() req: Request, @Res() res: Response, @Query() query: GetOverAllDetailsDto) {
        const result = await this.statisticsService.getOverAllDetails(req, query);
        return res.status(200).send(result);
    }

    @Get('overall_by_date')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async getOverAllByDate(@Res() res: Response) {
        const result = await this.statisticsService.getOverAllByDate();
        return res.status(200).send(result);
    }

    @Get('overall_per_country')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async getOverAllPerCountry(@Req() req: Request, @Res() res: Response) {
        const result = await this.statisticsService.getOverAllPerCountry(req);
        return res.status(200).send(result);
    }

    @Get('most_popular_products')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async getMostPopularProducts(@Res() res: Response) {
        const result = await this.statisticsService.getMostPopularProducts();
        return res.status(200).send(result);
    }

    @Get('stat_details')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async getStatDetails(@Req() req: Request, @Res() res: Response, @Query() query: GetStatDetailsDto) {
        const result = await this.statisticsService.getStatDetails(req, query);
        return res.status(200).send(result);
    }

    @Get('infograph_stat_details')
    @ApiBearerAuth()
    @ApiHeader({ name: 'X-LOCALE', required: false })
    @Roles(Role.Consultant)
    async getInfographStatDetails(
        @Req() req: Request,
        @Res() res: Response,
        @Query() query: GetInfographStatDetails,
        @Headers('X-LOCALE') locale?: string,
    ) {
        const result = await this.statisticsService.getInfographStatDetails(req, query, locale);
        return res.status(200).send(result);
    }

    @Get('get_stat_details_country_wise')
    @ApiBearerAuth()
    @ApiHeader({ name: 'X-LOCALE', required: false })
    @Roles(Role.Consultant)
    async getStatDetailsCountryWise(
        @Req() req: Request,
        @Res() res: Response,
        @Query() query: GetStatDetailsCountryWiseDto,
        @Headers('X-LOCALE') locale?: string,
    ) {
        const result = await this.statisticsService.getStatDetailsCountryWise(req, query, locale);
        return res.status(200).send(result);
    }
}
