import { Body, Controller, HttpStatus, Post, Put, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CustomerConsentsService } from './customerConsents.service';
import { CustomerConsentsDto } from './customerConsents.dto';
import { Roles } from '@/src/common/decorators/roles.decorator';
import { Role } from '@/src/common/enums/role.enum';

@ApiTags('GDPR')
@Controller('customer_consents')
export class CustomerConsentsController {
    constructor(private readonly customerConsentsService: CustomerConsentsService) {}

    @ApiBearerAuth()
    @Roles(Role.Customer)
    @Post('create')
    async createCustomerConsents(@Res() res: Response, @Body() customerConsents: CustomerConsentsDto) {
        const response = await this.customerConsentsService.createCustomerConsents(customerConsents);
        return res.status(HttpStatus.OK).send(response);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Post('for_consultant_create')
    async createCustomerConsentsForConsultant(@Res() res: Response, @Body() customerConsents: CustomerConsentsDto) {
        const response = await this.customerConsentsService.createCustomerConsentsForConsultant(customerConsents);
        return res.status(HttpStatus.OK).send(response);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @ApiQuery({ name: 'id' })
    @Put('for_consultant_update')
    async updateCustomerConsentsForConsultant(
        @Res() res: Response,
        @Query('id') id: string,
        @Body() customerConsents: CustomerConsentsDto,
    ) {
        const response = await this.customerConsentsService.updateCustomerConsentsForConsultant(id, customerConsents);
        return res.status(HttpStatus.OK).send(response);
    }

    @ApiBearerAuth()
    @Roles(Role.Customer)
    @ApiQuery({ name: 'id' })
    @Put('update')
    async updateCustomerConsents(
        @Res() res: Response,
        @Query('id') id: string,
        @Body() customerConsents: CustomerConsentsDto,
    ) {
        const response = await this.customerConsentsService.updateCustomerConsents(id, customerConsents);
        return res.status(HttpStatus.OK).send(response);
    }
}
