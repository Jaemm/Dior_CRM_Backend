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
import { Response, Request, query } from 'express';
import { ConsultantsService } from './consultants.service';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
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
    UpdateConsultantRubyDto,
    HealthTipsDto,
    HealthTipsByCompanyDto,
    NotificationTestDto,
} from '@/src/modules/consultants/consultants.dto';
import { JwtService } from '@/src/jwt/jwt.service';
import { Roles } from '@/src/common/decorators/roles.decorator';
import { Role } from '@/src/common/enums/role.enum';
import { Public } from '@/src/common/decorators/public-route.decorator';
import { CRMService } from '../crm/crm.service';

@ApiTags('Consultants')
@Controller('consultants')
export class ConsultantsController {
    constructor(
        private readonly consultants: ConsultantsService,
        private jwtService: JwtService,
        private readonly crmService: CRMService,
    ) {}

    @Get('me')
    @Roles(Role.Consultant)
    @ApiBearerAuth()
    async getCurConsultantInfo(@Req() req: Request) {
        return this.consultants.getCurConsultantInfo(req);
    }

    @Post('login/social')
    async loginSocial(@Req() req: Request, @Body() body: LoginSocialDto) {
        return await this.consultants.loginSocial(body);
    }

    @Post('login')
    async login(
        @Res() res: Response,
        @Body() body: ConsultantDto,
        @Headers('X-CHOWIS-LOCALE') locale: string,
    ): Promise<any> {
        const loginResult = await this.consultants.loginRuby(body, locale);
        return res.status(200).send({ ...loginResult });
    }

    @Post()
    @ApiOperation({ summary: 'signup consultant' })
    async createConsultant(
        @Res() res: Response,
        @Body() body: ConsultantDto,
        @Headers('X-CHOWIS-LOCALE') locale: string,
    ): Promise<any> {
        const consultant = await this.consultants.signUpRuby(body, locale);
        return res.status(200).send(consultant);
    }

    @Put('/update')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'update consultant information' })
    async updateConsultant(
        @Req() req: Request,
        @Body() body: UpdateConsultantRubyDto,
        @Headers('X-CHOWIS-LOCALE') locale: string,
    ) {
        return this.consultants.updateConsultantRuby(req, body, locale);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Post('products/enter')
    async enterProducts(
        @Req() req: Request,
        @Body() body: EnterProductDto,
        @Headers('X-CHOWIS-LOCALE') locale: string,
    ) {
        return await this.consultants.enterProducts(req, body, locale);
    }

    @Post('password')
    async password(
        @Req() req: Request,
        @Body() body: PasswordDto,
        @Headers('X-CHOWIS-LOCALE') locale: string,
    ): Promise<any> {
        return await this.consultants.password(body, locale);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Post('logout')
    async logout(@Req() req: Request): Promise<any> {
        const userId = Number((<{ id: string }>req['user']).id);
        return await this.consultants.logout(userId);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Post('password_change')
    async passwordChange(
        @Req() req: Request,
        @Body() body: PasswrodChangeDto,
        @Headers('X-CHOWIS-LOCALE') locale: string,
    ): Promise<any> {
        const userId = Number((<{ id: string }>req['user']).id);
        return await this.consultants.passwordChange(userId, body, locale);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Delete('delete_account')
    async deleteAccount(@Req() req: Request, @Query('reason') reason?: string): Promise<any> {
        const userId = Number((<{ id: string }>req['user']).id);
        return await this.consultants.deleteAccount(userId, reason);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Delete('notifications/:id')
    async deleteNotificaion(@Req() req: Request, @Param('id') id: string) {
        return await this.consultants.deleteNotification(Number(id));
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Post('request_callback_url')
    async requestCallbackUrl(@Req() req: Request, @Body() body: RequestCallBackUrlDto) {
        return await this.consultants.requestCallbackUrl(body, req);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Get('product_recommendations')
    async getProductRecommendations(@Req() req: Request, @Query() query: ProductRecommendationsDto) {
        return await this.consultants.getProductRecommendations(req, query);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Get('health_tips/by_company')
    async getHelthTipsByCompany(@Req() req: Request, @Query() query: HealthTipsByCompanyDto) {
        return await this.consultants.getHelthTipsByCompany(req, query);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Get('health_tips')
    async getHelthTips(@Req() req: Request, @Query() query: HealthTipsDto) {
        return await this.consultants.getHelthTips(req, query);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Post('login/phone')
    async loginPhone(@Req() req: Request, @Body() body: LoginPhoneDto) {
        const userId = Number((<{ id: string }>req['user']).id);
        return await this.consultants.loginPhone(body, userId);
    }

    /**
     *
     * Existing codes
     *
     * */

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Get()
    async getConsultants(@Res() res: Response, @Query() query: GetConsultantDto): Promise<any> {
        const consultants = await this.consultants.getConsultants(query);
        return res.status(200).send(consultants);
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

    @Post('tokens/refresh')
    async refreshToken(@Req() req: Request, @Res() res: Response, @Body() body: TokenRefreshDto): Promise<any> {
        const consultant = await this.consultants.refreshToken(body);
        return res.status(200).send(consultant);
    }

    @ApiTags('CRM')
    @ApiBearerAuth()
    @Get('customers/:id')
    async getCustomerById(@Req() req: Request, @Res() res: Response, @Param('id') customerId: string): Promise<any> {
        const consultantId = Number((<{ id: string }>req['user']).id);
        const customer = await this.crmService.getCustomerById(consultantId, Number(customerId));
        return res.status(200).send(customer);
    }

    @ApiBearerAuth()
    @Get('notifications')
    async notifications(@Req() req: Request, @Query() query: GetNotificationsDto): Promise<any> {
        const consultantId = Number((<{ id: string }>req['user']).id);
        return await this.consultants.getNotifications(consultantId, query);
    }
}
