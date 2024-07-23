import { Request } from 'express';

import { Roles } from '@/src/common/decorators/roles.decorator';
import { Role } from '@/src/common/enums/role.enum';
import { Controller, Get, Query, Req } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { GetOverAllDto } from './statistics.dto';
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
}
