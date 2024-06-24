import {
    BadRequestException,
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
import { Response, Request } from 'express';
import { ConsultantsService } from './consultants.service';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import {
    LoginSocialDto,
    ResendConfirmationDto,
    AllLicenseDto,
    CalculatePriceDto,
    ChangeEmailDto,
    ChangeLicenseDto,
    ConfirmHtmlDto,
    ConsultantCompanyDetailsDto,
    ConsultantDto,
    GetConsultantDto,
    NotifySalesChangeLicenseDto,
    PasswordDto,
    RenewDevicesDto,
    RequestCallBackUrlDto,
    UpdateConsultantDto,
    UpdateLicenseDto,
    LoginPhoneDto,
    ProductRecommendationsDto,
    TokenRefreshDto,
    PasswrodChangeDto,
    EnterProductDto,
    GetNotificationsDto,
    UpdatePasswordDto,
} from '@/src/modules/consultants/consultants.dto';
import { JwtService } from '@/src/jwt/jwt.service';
import { Roles } from '@/src/common/decorators/roles.decorator';
import { Role } from '@/src/common/enums/role.enum';
import { Public } from '@/src/common/decorators/public-route.decorator';
import { CRMService } from '../crm/crm.service';
import { ErrorStatus } from '@/src/common/constants/error-status';
import { ResponseMessages } from '@/src/common/constants/response-messages';
// import { AuthService } from 'src/modules/signUpAuth/auth/auth.service';

@ApiTags('Consultants')
// @ApiHeader({
//     name: 'X-CHOWIS-CONSULTANT-TOKEN',
//     description: 'Custom header x-chowis',
//     required: true,
// })
@Controller('consultants')
export class ConsultantsController {
    constructor(
        private readonly consultants: ConsultantsService,
        private jwtService: JwtService,
        private readonly crmService: CRMService,
    ) {}

    @Post('login')
    async login(
        @Res() res: Response,
        @Body() body: ConsultantDto,
        @Headers('X-CHOWIS-LOCALE') locale: string,
    ): Promise<any> {
        const loginResult = await this.consultants.login(body, locale);
        return res.status(200).send({ ...loginResult });
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Get()
    async getConsultants(@Res() res: Response, @Query() query: GetConsultantDto): Promise<any> {
        const consultants = await this.consultants.getConsultants(query);
        return res.status(200).send(consultants);
    }

    @Post()
    async createConsultant(
        @Res() res: Response,
        @Body() body: ConsultantDto,
        @Headers('X-CHOWIS-LOCALE') locale: string,
    ): Promise<any> {
        const consultant = await this.consultants.signUp(body, locale);
        return res.status(200).send(consultant);
    }

    @Post('register')
    async registerConsultant(
        @Res() res: Response,
        @Body() body: ConsultantDto,
        @Headers('X-CHOWIS-LOCALE') locale: string,
    ): Promise<any> {
        const consultant = await this.consultants.signUp(body, locale);
        return res.status(200).send(consultant);
    }

    // @Get('confirmation')
    // async confirmation(@Res() res: Response, @Query() param: { token: string }): Promise<any> {
    //     try {
    //         console.log('token    -----> ')
    //         const { token } = param;
    //         const confirmationResult = await this.consultants.confirmation(token);

    //         return res.status(200).send(confirmationResult);
    //     } catch (error) {
    //         console.log(error);
    //         return res.status(error['status'] || 500).send(error['response']);
    //     }
    // }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Put('update')
    async updateConsultant(
        @Req() req: Request,
        @Res() res: Response,
        @Body() body: UpdateConsultantDto,
        @Headers('X-CHOWIS-LOCALE') locale: string,
    ): Promise<any> {
        const userId = Number((<{ id: string }>req['user']).id);

        const consultant = await this.consultants.modifyConsultant(userId, body, locale);
        return res.status(200).send(consultant);
    }

    @Post('resend-confirmation')
    async resendConfirmation(
        @Req() req: Request,
        @Res() res: Response,
        @Body() body: ResendConfirmationDto,
        @Headers('X-CHOWIS-LOCALE') locale: string,
    ): Promise<any> {
        const consultant = await this.consultants.resendConfirmation(body, locale);
        return res.status(200).send(consultant);
    }

    @ApiBearerAuth()
    @Get('change_email')
    async changeEmail(
        @Req() req: Request,
        @Res() res: Response,
        @Query() query: ChangeEmailDto,
        @Headers('X-CHOWIS-LOCALE') locale: string,
    ): Promise<any> {
        const userId = Number((<{ id: string }>req['user']).id);
        const consultant = await this.consultants.changeEmail(userId, query, locale);
        return res.status(200).send(consultant);
    }

    @Public()
    @Get('confirm')
    async confirmEmail(@Res() res: Response, @Query() query: ConfirmHtmlDto): Promise<any> {
        const template = await this.consultants.confirmEmail(query);
        return res.status(200).send(template);
    }

    @Get(':id/confirm_email.html')
    async confirmEmailById(@Res() res: Response, @Param('id') id: string): Promise<any> {
        const template = await this.consultants.confirmEmailById(id);
        return res.status(200).send(template);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Get('me')
    async getMe(@Req() req: Request, @Res() res: Response): Promise<any> {
        const userId = Number((<{ id: string }>req['user']).id);
        const consultant = await this.consultants.getMe(userId);
        return res.status(200).send(consultant);
    }

    @Post('password')
    async password(
        @Req() req: Request,
        @Res() res: Response,
        @Body() body: PasswordDto,
        @Headers('X-CHOWIS-LOCALE') locale: string,
    ): Promise<any> {
        const consultant = await this.consultants.password(body, locale);
        return res.status(200).send(consultant);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Post('password_change')
    async passwordChange(
        @Req() req: Request,
        @Res() res: Response,
        @Body() body: PasswrodChangeDto,
        @Headers('X-CHOWIS-LOCALE') locale: string,
    ): Promise<any> {
        const userId = Number((<{ id: string }>req['user']).id);
        const consultant = await this.consultants.passwordChange(userId, body, locale);
        return res.status(200).send(consultant);
    }

    @Get('password-change')
    async passwordChangeNew(@Req() req: Request, @Res() res: Response, @Query('token') token: string): Promise<any> {
        const consultant = await this.consultants.passwordChangeNew(token);
        return res.status(200).send(consultant);
    }

    @Post('password-recovery')
    async passwordRecovery(
        @Req() req: Request,
        @Res() res: Response,
        @Body() body: PasswordDto,
        @Headers('X-CHOWIS-LOCALE') locale: string,
    ): Promise<any> {
        const consultant = await this.consultants.passwordRecovery(body, locale);
        return res.status(200).send(consultant);
    }

    @Post('update-password')
    async updatePassword(@Req() req: Request, @Res() res: Response, @Body() data: UpdatePasswordDto): Promise<any> {
        const consultant = await this.consultants.updatePassword(data);
        return res.status(200).send(consultant);
    }

    // @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Post('logout')
    async logout(@Req() req: Request, @Res() res: Response): Promise<any> {
        const userId = Number((<{ id: string }>req['user']).id);

        console.log('loggingngngngn');
        const consultant = await this.consultants.logout(userId);
        return res.status(200).send(consultant);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Post('request_callback_url')
    async requestCallbackUrl(
        @Req() req: Request,
        @Res() res: Response,
        @Body() body: RequestCallBackUrlDto,
    ): Promise<any> {
        const token = this.jwtService.getTokenFromRequest(req);

        if (!token) {
            // Token not provided, handle accordingly (e.g., return unauthorized response)
            throw new UnauthorizedException({
                result_code: ErrorStatus.UNAUTHORIZED,
                error: ResponseMessages.Unauthorized,
            });
        }
        const consultant = await this.consultants.requestCallbackUrl(body, token);
        return res.status(200).send(consultant);
    }

    @Get('company')
    async getCompany(@Req() req: Request, @Res() res: Response): Promise<any> {
        const company = await this.consultants.getCompany();
        return res.status(200).send(company);
    }

    @Get('consult-company-details')
    async getCompanyDetails(
        @Req() req: Request,
        @Res() res: Response,
        @Query() query: ConsultantCompanyDetailsDto,
    ): Promise<any> {
        const company = await this.consultants.getCompanyDetails(query);
        return res.status(200).send(company);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Delete('delete_account')
    async deleteAccount(@Req() req: Request, @Res() res: Response): Promise<any> {
        const userId = Number((<{ id: string }>req['user']).id);
        const consultant = await this.consultants.deleteAccount(userId);
        return res.status(200).send(consultant);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Get('all-license')
    async getAllLicense(@Req() req: Request, @Res() res: Response, @Query() query: AllLicenseDto): Promise<any> {
        const consultant = await this.consultants.getAllLicense(query);
        return res.status(200).send(consultant);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Put('change-license')
    async changeLicense(@Req() req: Request, @Res() res: Response, @Body() body: ChangeLicenseDto): Promise<any> {
        const userId = Number((<{ id: string }>req['user']).id);
        const consultant = await this.consultants.changeLicense(userId, body);
        return res.status(200).send(consultant);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Put('notify_sales_change_license')
    async notifySalesChangeLicense(
        @Req() req: Request,
        @Res() res: Response,
        @Body() body: NotifySalesChangeLicenseDto,
    ): Promise<any> {
        const consultant = await this.consultants.notifySalesChangeLicense(body);
        return res.status(200).send(consultant);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Get('calculate-price')
    async calculatePrice(@Req() req: Request, @Res() res: Response, @Query() query: CalculatePriceDto): Promise<any> {
        const userId = Number((<{ id: string }>req['user']).id);
        const response = await this.consultants.calculatePrice(userId, query);
        return res.status(200).send(response);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Put('update-license')
    async updateLicense(@Res() res: Response, @Body() body: UpdateLicenseDto): Promise<any> {
        const consultant = await this.consultants.updateLicense(body);
        return res.status(200).send(consultant);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Post('renew-devices')
    async renewDevices(@Res() res: Response, @Body() body: RenewDevicesDto): Promise<any> {
        const consultant = await this.consultants.renewDevices(body);
        return res.status(200).send(consultant);
    }

    @Post('login/social')
    async loginSocial(@Req() req: Request, @Res() res: Response, @Body() body: LoginSocialDto): Promise<any> {
        const consultant = await this.consultants.loginSocial(body);
        return res.status(200).send(consultant);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Post('login/phone')
    async loginPhone(@Req() req: Request, @Res() res: Response, @Body() body: LoginPhoneDto): Promise<any> {
        const userId = Number((<{ id: string }>req['user']).id);
        const consultant = await this.consultants.loginPhone(body, userId);
        return res.status(200).send(consultant);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Get('product_recommendations')
    async getProductRecommendations(
        @Req() req: Request,
        @Res() res: Response,
        @Query() query: ProductRecommendationsDto,
    ): Promise<any> {
        const consultant = await this.consultants.getProductRecommendations(query);
        return res.status(200).send(consultant);
    }

    @Post('tokens/refresh')
    async refreshToken(@Req() req: Request, @Res() res: Response, @Body() body: TokenRefreshDto): Promise<any> {
        const consultant = await this.consultants.refreshToken(body);
        return res.status(200).send(consultant);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Post('products/enter')
    async enterProducts(
        @Req() req: Request,
        @Res() res: Response,
        @Body() body: EnterProductDto,
        @Headers('X-CHOWIS-LOCALE') locale: string,
    ): Promise<any> {
        const userId = Number((<{ id: string }>req['user']).id);
        console.log('userId', userId);
        if (!body.optic_number || !body.password || !body.application_id) {
            throw new BadRequestException({
                result_code: ErrorStatus.PRODUCT_CREDS_REQUIRED,
                error: ResponseMessages.ProductCredsRequired,
            });
        }
        const consultant = await this.consultants.enterProducts(userId, body, locale);
        return res.status(200).send(consultant);
    }

    @ApiBearerAuth()
    @Get('notifications')
    async notifications(@Req() req: Request, @Res() res: Response, @Query() query: GetNotificationsDto): Promise<any> {
        const consultantId = Number((<{ id: string }>req['user']).id);
        const notifications = await this.consultants.getNotifications(consultantId, query);
        return res.status(200).send({ notifications });
    }

    @ApiBearerAuth()
    @Delete('notifications/:id')
    async deleteNotificaion(@Req() req: Request, @Res() res: Response, @Param('id') id: string): Promise<any> {
        const response = await this.consultants.deleteNotification(Number(id));
        return res.status(200).send(response);
    }

    @ApiTags('CRM')
    @ApiBearerAuth()
    @Get('customers/:id')
    async getCustomerById(@Req() req: Request, @Res() res: Response, @Param('id') customerId: string): Promise<any> {
        const consultantId = Number((<{ id: string }>req['user']).id);
        const customer = await this.crmService.getCustomerById(consultantId, Number(customerId));
        return res.status(200).send(customer);
    }
}
