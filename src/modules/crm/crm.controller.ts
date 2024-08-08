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
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';

import { ApiBearerAuth, ApiBody, ApiConsumes, ApiHeader, ApiTags } from '@nestjs/swagger';
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
import { FileInterceptor } from '@nestjs/platform-express';
import { hash } from 'argon2';

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
    async getCustomers(@Req() req: Request, @Res() res: Response, @Query() query: GetCustomerDto) {
        const userId = Number((<{ id: string }>req['user']).id);

        const customer = await this.crmService.getCustomer(userId, query);
        return res.status(200).send(customer);
    }

    @Post('customers')
    @ApiBearerAuth()
    @ApiHeader({ name: 'X-CHOWIS-LOCALE', required: false })
    @Roles(Role.Consultant)
    async createCustomer(
        @Req() req: Request,
        @Res() res: Response,
        @Body() body: CreateCrmCustomerDto,
        @Headers('X-CHOWIS-LOCALE') locale?: string,
    ) {
        const userId = Number((<{ id: string }>req['user']).id);

        const result = await this.crmService.createCustomer(userId, body, locale);
        return res.status(200).send(result);
    }

    @Get('customers/get_by_email')
    @ApiBearerAuth()
    // @Roles(Role.Consultant)
    @ApiHeader({ name: 'X-CHOWIS-LOCALE', required: false })
    async getCustomerByEmail(
        @Req() req: Request,
        @Res() res: Response,
        @Query() query: GetByEmailDto,
        @Headers('X-CHOWIS-LOCALE') locale: string,
    ): Promise<any> {
        const userId = Number((<{ id: string }>req['user']).id);

        const result = await this.crmService.getByEmail(userId, query, locale);
        return res.status(200).send(result);
    }

    @Get('customers/files/:hash')
    @ApiBearerAuth()
    async getFileFromS3(@Res() res: Response, @Param('hash') hash: string) {
        const fileData = await this.crmService.getFileFromS3(hash);

        const { binary, fileName, mimeType } = fileData;

        res.status(200);
        res.set('Content-Type', `${mimeType}`);
        res.attachment(fileName);
        res.write(binary, 'binary');
        return res.end(null, 'binary');
    }

    @Post('customers/presign_upload_consent_form')
    // @Roles(Role.Consultant)
    @ApiHeader({ name: 'X-CHOWIS-LOCALE', required: false })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
                consent_type: {
                    type: 'string',
                },
            },
        },
    })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('file'))
    async presignUploadConsentForm(
        @Headers('X-CHOWIS-LOCALE') locale: string,
        @Req() req: Request,
        @Res() res: Response,
        @UploadedFile() file: Express.Multer.File,
        @Body() body: PresignedUploadDto,
    ): Promise<any> {
        const urls = await this.crmService.presignedUpload(req, body, file, locale);
        return res.status(200).send(urls);
    }

    // @Roles(Role.Consultant)
    @Put('customers/update_consent_form')
    async updateConsentForm(@Res() res: Response, @Body() body: UpdateConsentForm): Promise<any> {
        const result = await this.crmService.updateConsentForm(body);
        return res.status(200).send(result);
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

    @Get('customers/:id')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @ApiHeader({ name: 'X-CHOWIS-LOCALE', required: false })
    async getCustomerById(
        @Req() req: Request,
        @Res() res: Response,
        @Param('id') customerId: string,
        @Headers('X-CHOWIS-LOCALE') locale?: string,
    ): Promise<any> {
        const consultantId = Number((<{ id: string }>req['user']).id);

        const customer = await this.crmService.getCustomerById(consultantId, Number(customerId), locale);
        return res.status(200).send(customer);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Put('customers/:id')
    async updateConsultantCustomer(
        @Req() req: Request,
        @Res() res: Response,
        @Param('id') customerId: string,
        @Body() body: UpdateCrmCustomersDto,
    ): Promise<any> {
        const consultantId = Number((<{ id: string }>req['user']).id);

        const updatedCustomer = await this.crmService.updateCustomer(consultantId, Number(customerId), body);
        return res.status(200).send(updatedCustomer);
    }

    @Delete('customers/:id')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @ApiHeader({ name: 'X-CHOWIS-LOCALE', required: false })
    async deleteCustomer(
        @Req() req: Request,
        @Res() res: Response,
        @Param('id') customerId: string,
        @Headers('X-CHOWIS-LOCALE') locale: string,
    ): Promise<any> {
        const consultantId = Number((<{ id: string }>req['user']).id);

        const result = await this.crmService.deleteCustomer(consultantId, Number(customerId), locale);
        return res.status(200).send(result);
    }
    /** END */
}
