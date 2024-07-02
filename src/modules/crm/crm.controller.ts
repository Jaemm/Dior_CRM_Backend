import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Query,
    Req,
    Res,
    UnauthorizedException,
} from '@nestjs/common';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CRMService } from './crm.service';
import { Response, Request } from 'express';
import {
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
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Get('customers')
    async getCustomers(@Req() req: Request, @Query() query: GetCustomerDto) {
        const userId = Number((<{ id: string }>req['user']).id);

        return await this.crmService.getCustomer(userId, query);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Get('customers/get_by_email')
    async getCustomerByEmail(@Req() req: Request, @Query() query: GetByEmailDto): Promise<any> {
        const userId = Number((<{ id: string }>req['user']).id);
        return await this.crmService.getByEmail(userId, query);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Post('customers')
    async createCustomer(@Req() req: Request, @Body() body: UpdateCrmCustomersDto) {
        const userId = Number((<{ id: string }>req['user']).id);
        return await this.crmService.createCustomer(userId, body);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Get('customers/:id')
    async getCustomerById(@Req() req: Request, @Param('id') customerId: string): Promise<any> {
        const consultantId = Number((<{ id: string }>req['user']).id);
        return await this.crmService.getCustomerById(consultantId, Number(customerId));
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Put('customers/:id')
    async updateCustomer(
        @Req() req: Request,
        @Body() body: UpdateCrmCustomersDto,
        @Param('id') customerId: string,
    ): Promise<any> {
        return await this.crmService.updateCustomer(Number(customerId), body);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Delete('customers/:id')
    async deleteCustomer(@Req() req: Request, @Param('id') customerId: string): Promise<any> {
        const consultantId = Number((<{ id: string }>req['user']).id);
        return await this.crmService.deleteCustomer(consultantId, Number(customerId));
    }

    /** END */

    @ApiTags('Consultants')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Post('customers/register')
    async registerConsultantCustomer(
        @Req() req: Request,
        @Res() res: Response,
        @Body() body: UpdateCrmCustomersDto,
    ): Promise<any> {
        try {
            const userId = Number((<{ id: string }>req['user']).id);
            const result = await this.crmService.register(userId, body);
            return res.status(200).send(result);
        } catch (error) {
            return res.status(error['status'] || 500).send(error['response'] || ResponseMessages.InternalServerError);
        }
    }

    @ApiTags('Consultants')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Post('customers/update/:id')
    async updateConsultantCustomer(
        @Req() req: Request,
        @Res() res: Response,
        @Param('id') customerId: string,
        @Body() body: UpdateCrmCustomersDto,
    ): Promise<any> {
        try {
            const consultantId = Number((<{ id: string }>req['user']).id);
            const result = await this.crmService.update(consultantId, Number(customerId), body);
            return res.status(200).send(result);
        } catch (error) {
            return res.status(error['status'] || 500).send(error['response'] || ResponseMessages.InternalServerError);
        }
    }

    @ApiBearerAuth()
    @Post('customers/sync')
    @Roles(Role.Consultant)
    async syncCustomers(@Req() req: Request, @Res() res: Response, @Body() body: CustomerSyncDto): Promise<any> {
        const token = this.jwtService.getTokenFromRequest(req);

        if (!token) {
            throw new UnauthorizedException({
                result_code: ErrorStatus.UNAUTHORIZED,
                error: ResponseMessages.Unauthorized,
            });
        }
        const consultantId = Number((<{ id: string }>req['user']).id);
        const result = await this.crmService.syncCustomer(consultantId, token, body);
        return res.status(200).send(result);
    }

    @Roles(Role.Consultant)
    @Post('customers/presign_upload_consent_form')
    async presignUploadConsentForm(@Res() res: Response, @Body() body: PresignedUploadDto): Promise<any> {
        const result = await this.crmService.presignedUpload(body);
        return res.status(200).send(result);
    }

    @Roles(Role.Consultant)
    @Put('customers/update_consent_form')
    async updateConsentForm(@Res() res: Response, @Body() body: UpdateConsentForm): Promise<any> {
        const result = await this.crmService.updateConsentForm(body);
        return res.status(200).send(result);
    }
}
