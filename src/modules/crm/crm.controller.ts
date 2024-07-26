import {
    Body,
    Controller,
    Delete,
    Get,
    Headers,
    Param,
    Post,
    Put,
    Query,
    Req,
    Res,
    UnauthorizedException,
} from '@nestjs/common';

import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { CRMService } from './crm.service';
import { Response, Request } from 'express';
import {
    CreateCrmCustomerDto,
    CustomerSyncDto,
    GetByEmailDto,
    GetCustomerDto,
    PresignedUploadDto,
    UpdateConsentForm,
    UpdateCrmCustomersDto,
} from './crm.dto';
import { ResponseMessages } from '@/src/common/constants/response-messages';
import { JwtService } from '@/src/jwt/jwt.service';
import { Roles } from '@/src/common/decorators/roles.decorator';
import { Role } from '@/src/common/enums/role.enum';
import { ErrorStatus } from '@/src/common/constants/error-status';

@ApiTags('CRM')
@Controller('crm')
export class CRMController {
    constructor(private readonly crmService: CRMService, private readonly jwtService: JwtService) {}

    /**
     * For Consultant
     */
    @Get('customers')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async getCustomers(@Req() req: Request, @Query() query: GetCustomerDto) {
        const userId = Number((<{ id: string }>req['user']).id);

        return await this.crmService.getCustomer(userId, query);
    }

    @Post('customers')
    @ApiBearerAuth()
    @ApiHeader({ name: 'X-CHOWIS-LOCALE', required: false })
    @Roles(Role.Consultant)
    async createCustomer(
        @Req() req: Request,
        @Body() body: CreateCrmCustomerDto,
        @Headers('X-CHOWIS-LOCALE') locale?: string,
    ) {
        const userId = Number((<{ id: string }>req['user']).id);
        return await this.crmService.createCustomer(userId, body, locale);
    }

    @Get('customers/get_by_email')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @ApiHeader({ name: 'X-CHOWIS-LOCALE', required: false })
    async getCustomerByEmail(
        @Req() req: Request,
        @Query() query: GetByEmailDto,
        @Headers('X-CHOWIS-LOCALE') locale: string,
    ): Promise<any> {
        const userId = Number((<{ id: string }>req['user']).id);
        return await this.crmService.getByEmail(userId, query, locale);
    }

    @Post('customers/presign_upload_consent_form')
    @Roles(Role.Consultant)
    @ApiHeader({ name: 'X-CHOWIS-LOCALE', required: false })
    async presignUploadConsentForm(
        @Body() body: PresignedUploadDto,
        @Headers('X-CHOWIS-LOCALE') locale: string,
    ): Promise<any> {
        return await this.crmService.presignedUpload(body, locale);
    }

    @Roles(Role.Consultant)
    @Put('customers/update_consent_form')
    async updateConsentForm(@Body() body: UpdateConsentForm): Promise<any> {
        return await this.crmService.updateConsentForm(body);
    }

    @ApiBearerAuth()
    @Post('customers/sync')
    @Roles(Role.Consultant)
    async syncCustomers(@Req() req: Request, @Body() body: CustomerSyncDto): Promise<any> {
        const token = this.jwtService.getTokenFromRequest(req);

        if (!token) {
            throw new UnauthorizedException({
                result_code: ErrorStatus.UNAUTHORIZED,
                error: ResponseMessages.Unauthorized,
            });
        }
        const consultantId = Number((<{ id: string }>req['user']).id);
        return await this.crmService.syncCustomer(consultantId, token, body);
    }

    @Get('customers/:id')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @ApiHeader({ name: 'X-CHOWIS-LOCALE', required: false })
    async getCustomerById(
        @Req() req: Request,
        @Param('id') customerId: string,
        @Headers('X-CHOWIS-LOCALE') locale?: string,
    ): Promise<any> {
        const consultantId = Number((<{ id: string }>req['user']).id);
        return await this.crmService.getCustomerById(consultantId, Number(customerId), locale);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Put('customers/:id')
    async updateConsultantCustomer(
        @Req() req: Request,
        @Param('id') customerId: string,
        @Body() body: UpdateCrmCustomersDto,
    ): Promise<any> {
        const consultantId = Number((<{ id: string }>req['user']).id);
        console.log(consultantId);
        return await this.crmService.updateCustomer(consultantId, Number(customerId), body);
    }

    @Delete('customers/:id')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @ApiHeader({ name: 'X-CHOWIS-LOCALE', required: false })
    async deleteCustomer(
        @Req() req: Request,
        @Param('id') customerId: string,
        @Headers('X-CHOWIS-LOCALE') locale: string,
    ): Promise<any> {
        const consultantId = Number((<{ id: string }>req['user']).id);
        return await this.crmService.deleteCustomer(consultantId, Number(customerId), locale);
    }
    /** END */
}
