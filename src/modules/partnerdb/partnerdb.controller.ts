import { Request, Response } from 'express';
import { Body, Controller, Get, Param, Post, Query, Req, Headers, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiPropertyOptional, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/src/common/decorators/roles.decorator';
import { Role } from '@/src/common/enums/role.enum';
import { PartnerDbService } from './partnerdb.service';
import {
    GetAnalysisHistoriesDto,
    GetAnalysisHistoryByBatchIdDto,
    GetCustomerByConsultantDto,
    GetHydrationSebumByBatchIdDto,
    LoginDiorConsultantDto,
    ResetPasswordDto,
} from './partnerdb.dto';

@ApiTags('PartnerDB')
@Controller('partnerdb')
export class PartnerDbController {
    constructor(private partnerdbService: PartnerDbService) {}

    @Post('consultants/dior_login')
    @ApiHeader({ name: 'X-LOCALE', required: false })
    async loginDiorConsultant(@Body() body: LoginDiorConsultantDto, @Headers('X-LOCALE') locale?: string) {
        return await this.partnerdbService.loginDiorConsultant(body, locale);
    }

    @Post('consultants/password')
    @ApiBearerAuth()
    @ApiHeader({ name: 'X-LOCALE', required: false })
    async resetPassword(@Body() body: ResetPasswordDto, @Headers('X-LOCALE') locale?: string) {
        return await this.partnerdbService.resetPassword(body, locale);
    }

    @Get('consultants/:id/customers')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async getCustomersByConsultantId(@Param('id') consultantId: string, @Query() query: GetCustomerByConsultantDto) {
        return await this.partnerdbService.getCustomersByConsultantId(consultantId, query);
    }

    @Get('consultants/:id')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async getConsultantById(@Param('id') consultantId: string) {
        return await this.partnerdbService.getConsultantById(consultantId);
    }

    /**
     * Customers
     */

    @Get('customers/:id/analysis_histories')
    @ApiBearerAuth()
    @ApiHeader({ name: 'X-LOCALE', required: false })
    @Roles(Role.Consultant)
    async getAnalysisHistories(
        @Req() req: Request,
        @Param('id') customerId: string,
        @Query() query: GetAnalysisHistoriesDto,
        @Headers('X-LOCALE') locale?: string,
    ) {
        return await this.partnerdbService.getAnalysisHistories(req, customerId, query, locale);
    }

    @Get('customers/:id/analysis_histories/:batch_id')
    @ApiBearerAuth()
    @ApiHeader({ name: 'X-LOCALE', required: false })
    async getAnalysisHistoriesByBatchId(
        @Req() req: Request,
        @Param('id') customerId: string,
        @Param('batch_id') batchId: string,
        @Query() query: GetAnalysisHistoryByBatchIdDto,
        @Headers('X-LOCALE') locale?: string,
    ) {
        return await this.partnerdbService.getAnalysisHistoriesByBatchId(req, customerId, batchId, query, locale);
    }

    @Get('customers/:id/analysis_histories/:batch_id/hydration_sebum')
    @ApiBearerAuth()
    @ApiHeader({ name: 'X-LOCALE', required: false })
    async getHydrationSebumByBatchId(
        @Req() req: Request,
        @Param('id') customerId: string,
        @Param('batch_id') batchId: string,
        @Query() query: GetHydrationSebumByBatchIdDto,
        @Headers('X-LOCALE') locale?: string,
    ) {
        return await this.partnerdbService.getHydrationSebumByBatchId(req, customerId, batchId, query, locale);
    }

    @Get('customers/:id')
    @ApiBearerAuth()
    async getCustomerById(@Headers('X-LOCALE') locale: string, @Res() res: Response, @Param('id') customerId: string) {
        const customer = await this.partnerdbService.getCustomerById(customerId, locale);

        return res.status(200).send(customer);
    }
}

