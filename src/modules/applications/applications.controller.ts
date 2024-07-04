import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { Response, Request } from 'express';

import { ApiTags } from '@nestjs/swagger';
import { ApplicationsService } from './applications.service';
import { ApplicationsVersionCheckDto } from './applications.dto';

@ApiTags('Applications')
@Controller('applications')
export class ApplicationsController {
    constructor(private readonly applications: ApplicationsService) {}

    @ApiTags('Additional')
    @Get('app_version_check')
    async appVersionCheck(@Res() res: Response, @Query() params: ApplicationsVersionCheckDto) {
        const countriesList = await this.applications.applicationVersionCheck(params);
        return res.status(200).send(countriesList);
    }

    @ApiTags('Additional')
    @Get('app_version_check_customer')
    async appVersionCheckCustomer(@Res() res: Response, @Query() params: ApplicationsVersionCheckDto) {
        const countriesList = await this.applications.applicationVersionCheck(params);
        return res.status(200).send(countriesList);
    }
}
