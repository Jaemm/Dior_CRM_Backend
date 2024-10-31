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
import {
    ApiBearerAuth,
    ApiBody,
    ApiExcludeEndpoint,
    ApiHeader,
    ApiHeaders,
    ApiOperation,
    ApiQuery,
    ApiTags,
} from '@nestjs/swagger';
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
    CreateSalesConnectionDto,
    FetchSalesConnectionDto,
    LoginConsultantDto,
} from '@/src/modules/consultants/consultants.dto';
import { JwtService } from '@/src/jwt/jwt.service';
import { Roles } from '@/src/common/decorators/roles.decorator';
import { Role } from '@/src/common/enums/role.enum';
import { Public } from '@/src/common/decorators/public-route.decorator';
import { CRMService } from '../crm/crm.service';

@ApiTags('Consultants')
@Controller('consultants')
// @ApiHeader({
//     name: 'X-CHOWIS-LOCALE',
//     required: false,
// })
export class ConsultantsController {
    constructor(
        private readonly consultants: ConsultantsService,
        private jwtService: JwtService,
        private readonly crmService: CRMService,
    ) {}

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Get()
    async getConsultants(@Res() res: Response, @Query() query: GetConsultantDto) {
        const consultnat = await this.consultants.getConsultants(query);
        return res.status(200).send(consultnat);
    }

    @Post()
    @ApiOperation({ summary: 'signup consultant' })
    @ApiHeader({ name: 'X-CHOWIS-LOCALE', required: false })
    async createConsultant(
        @Res() res: Response,
        @Body() body: ConsultantDto,
        @Headers('X-CHOWIS-LOCALE') locale?: string,
    ) {
        const consultant = await this.consultants.signUpRuby(body, locale);
        return res.status(200).send(consultant);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Get('company')
    async getCompanies(@Res() res: Response) {
        const companies = await this.consultants.getCompanies();
        return res.status(200).send(companies);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Get('branch')
    @ApiQuery({ name: 'consultant_company_id', required: false })
    async getBranches(@Res() res: Response, @Query('consultant_company_id') companyId?: string) {
        const branches = await this.consultants.getBranches(companyId);

        return res.status(200).send(branches);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Get('shop')
    @ApiQuery({ name: 'consultant_branch_id', required: false })
    async getShops(@Res() res: Response, @Query('consultant_branch_id') branchId: string) {
        const shops = await this.consultants.getShops(branchId);
        return res.status(200).send(shops);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Get('position')
    async getPositions(@Res() res: Response) {
        const positions = await this.consultants.getPositions();
        return res.status(200).send(positions);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Get('country')
    async getCountries(@Res() res: Response) {
        const countries = await this.consultants.getCountries();
        return res.status(200).send(countries);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Get('store')
    async getStores(@Res() res: Response) {
        const stores = await this.consultants.getStores();
        return res.status(200).send(stores);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Post('create-sales-connection')
    @ApiHeader({ name: 'X-CHOWIS-LOCALE', required: false })
    async createSalesConnection(
        @Res() res: Response,
        @Body() body: any,
        @Headers('X-CHOWIS-LOCALE') locale: string,
        @Req() req: Request,
    ) {
        const userId = Number((<{ id: string }>req['user']).id);

        if (!body?.consultant_id) body.consultant_id = userId;
        const result = await this.consultants.createSalesConnection(body, locale);
        return res.status(200).send(result);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Get('fetch_sales_connection')
    async fetchSalesConnection(@Res() res: Response, @Query() query: FetchSalesConnectionDto) {
        const result = await this.consultants.fetchSalesConnection(query);
        return res.status(200).send(result);
    }

    @Get('me')
    @ApiHeader({ name: 'X-CHOWIS-LOCALE', required: false })
    @Roles(Role.Consultant)
    @ApiBearerAuth()
    async getConsultantAboutMe(@Req() req: Request, @Res() res: Response, @Headers('X-CHOWIS-LOCALE') locale: string) {
        const consultant = await this.consultants.getConsultantAboutMe(req, locale);
        return res.status(200).send(consultant);
    }

    @Post('login/social')
    @ApiHeader({ name: 'X-CHOWIS-LOCALE', required: false })
    async loginSocial(@Res() res: Response, @Body() body: LoginSocialDto, @Headers('X-CHOWIS-LOCALE') locale?: string) {
        const result = await this.consultants.loginSocial(body, locale);
        return res.status(200).send(result);
    }

    @Post('login')
    @ApiHeader({ name: 'X-CHOWIS-LOCALE', required: false })
    async login(
        @Res() res: Response,
        @Body() body: LoginConsultantDto,
        @Headers('X-CHOWIS-LOCALE') locale: string,
    ): Promise<any> {
        body.email = body.email.toLowerCase();
        const loginResult = await this.consultants.loginRuby(body, locale);
        return res.status(200).send({ ...loginResult });
    }

    @Put('/update')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'update consultant information' })
    @ApiHeader({ name: 'X-CHOWIS-LOCALE', required: false })
    async updateConsultant(
        @Req() req: Request,
        @Res() res: Response,
        @Body() body: UpdateConsultantRubyDto,
        @Headers('X-CHOWIS-LOCALE') locale: string,
    ) {
        const updateResult = await this.consultants.updateConsultantRuby(req, body, locale);
        res.status(200).send(updateResult);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Post('products/enter')
    @ApiHeader({ name: 'X-CHOWIS-LOCALE', required: false })
    async enterProducts(
        @Req() req: Request,
        @Res() res: Response,
        @Body() body: EnterProductDto,
        @Headers('X-CHOWIS-LOCALE') locale: string,
    ) {
        const result = await this.consultants.enterProducts(req, body, locale);
        return res.status(200).send(result);
    }

    @Post('password')
    @ApiHeader({ name: 'X-CHOWIS-LOCALE', required: false })
    async password(
        @Res() res: Response,
        @Body() body: PasswordDto,
        @Headers('X-CHOWIS-LOCALE') locale: string,
    ): Promise<any> {
        const result = await this.consultants.password(body, locale);
        return res.status(200).send(result);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Post('logout')
    async logout(@Req() req: Request, @Res() res: Response): Promise<any> {
        const userId = Number((<{ id: string }>req['user']).id);
        const result = await this.consultants.logout(userId);
        return res.status(200).send(result);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Post('password_change')
    @ApiHeader({ name: 'X-CHOWIS-LOCALE', required: false })
    async passwordChange(
        @Req() req: Request,
        @Res() res: Response,
        @Body() body: PasswrodChangeDto,
        @Headers('X-CHOWIS-LOCALE') locale: string,
    ): Promise<any> {
        const userId = Number((<{ id: string }>req['user']).id);
        const result = await this.consultants.passwordChange(userId, body, locale);
        return res.status(200).send(result);
    }

    @Delete('delete_account')
    @ApiBearerAuth()
    @ApiHeader({ name: 'X-CHOWIS-LOCALE', required: false })
    @ApiQuery({ name: 'reason', required: false })
    @Roles(Role.Consultant)
    async deleteAccount(
        @Req() req: Request,
        @Res() res: Response,
        @Query('reason') reason?: string,
        @Headers('X-CHOWIS-LOCALE') locale?: string,
    ): Promise<any> {
        const userId = Number((<{ id: string }>req['user']).id);
        const result = await this.consultants.deleteAccount(userId, reason, locale);
        return res.status(200).send(result);
    }

    @Delete('notifications/:id')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async deleteNotificaion(@Res() res: Response, @Param('id') id: string) {
        const result = await this.consultants.deleteNotification(Number(id));
        return res.status(200).send(result);
    }

    @ApiBearerAuth()
    @Get('notifications')
    async notifications(@Req() req: Request, @Res() res: Response, @Query() query: GetNotificationsDto) {
        const consultantId = Number((<{ id: string }>req['user']).id);
        const notifications = await this.consultants.getNotifications(consultantId, query);
        return res.status(200).send(notifications);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Post('request_callback_url')
    async requestCallbackUrl(@Req() req: Request, @Res() res: Response, @Body() body: RequestCallBackUrlDto) {
        const result = await this.consultants.requestCallbackUrl(body, req);
        return res.status(200).send(result);
    }

    @Get('product_recommendations')
    @ApiBearerAuth()
    @ApiHeader({ name: 'X-CHOWIS-LOCALE', required: false })
    @Roles(Role.Consultant)
    async getProductRecommendations(
        @Req() req: Request,
        @Res() res: Response,
        @Query() query: ProductRecommendationsDto,
        @Headers('X-CHOWIS-LOCALE') locale: string,
    ) {
        const recommendations = await this.consultants.getProductRecommendations(req, query, locale);
        return res.status(200).send(recommendations);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Get('health_tips/by_company')
    async getHelthTipsByCompany(@Req() req: Request, @Res() res: Response, @Query() query: HealthTipsByCompanyDto) {
        const healthTips = await this.consultants.getHelthTipsByCompany(req, query);
        return res.status(200).send(healthTips);
    }

    @Get('health_tips')
    @ApiBearerAuth()
    @ApiHeader({ name: 'X-CHOWIS-LOCALE', required: false })
    @Roles(Role.Consultant)
    async getHelthTips(
        @Req() req: Request,
        @Res() res: Response,
        @Query() query: HealthTipsDto,
        @Headers('X-CHOWIS-LOCALE') locale?: string,
    ) {
        const healthTips = await this.consultants.getHelthTips(req, query, locale);
        return res.status(200).send(healthTips);
    }

    @Post('login/phone')
    @ApiBearerAuth()
    @ApiHeader({ name: 'X-CHOWIS-LOCALE', required: false })
    @Roles(Role.Consultant)
    async loginPhone(
        @Req() req: Request,
        @Res() res: Response,
        @Body() body: LoginPhoneDto,
        @Headers('X-CHOWIS-LOCALE') locale: string,
    ) {
        const userId = Number((<{ id: string }>req['user']).id);

        const result = await this.consultants.loginPhone(body, userId, locale);
        return res.status(200).send(result);
    }

    @Post('tokens/refresh')
    @ApiHeader({ name: 'X-CHOWIS-LOCALE', required: false })
    async refreshToken(
        @Res() res: Response,
        @Body() body: TokenRefreshDto,
        @Headers('X-CHOWIS-LOCALE') locale: string,
    ) {
        const token = await this.consultants.refreshToken(body, locale);
        return res.status(200).send(token);
    }

    // @ApiBearerAuth()
    // @Roles(Role.Consultant)
    // @Get('generate_flat_file_dior')
    // async generateFlatFileDior(@Req() req: Request, @Res() res: Response) {
    //     const result = await this.consultants.generateFlatFileDior();
    //     return res.status(200).send(result);
    // }

    @Get('confirm_email/:id')
    async confirmEmailById(@Res() res: Response, @Param('id') id: string) {
        const template = await this.consultants.confirmEmailById(id);
        return res.status(200).send(template);
    }

    /**
     *
     * Existing codes
     *
     * */

    @ApiExcludeEndpoint()
    @Post('register')
    async registerConsultant(
        @Res() res: Response,
        @Body() body: ConsultantDto,
        @Headers('X-CHOWIS-LOCALE') locale: string,
    ): Promise<any> {
        const consultant = await this.consultants.signUp(body, locale);
        return res.status(200).send(consultant);
    }

    @ApiExcludeEndpoint()
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

    @ApiExcludeEndpoint()
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

    @ApiExcludeEndpoint()
    @Public()
    @Get('confirm')
    async confirmEmail(@Res() res: Response, @Query() query: ConfirmHtmlDto): Promise<any> {
        const template = await this.consultants.confirmEmail(query);
        return res.status(200).send(template);
    }

    @ApiExcludeEndpoint()
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

    @ApiExcludeEndpoint()
    @Post('update-password')
    async updatePassword(@Req() req: Request, @Res() res: Response, @Body() data: UpdatePasswordDto): Promise<any> {
        const consultant = await this.consultants.updatePassword(data);
        return res.status(200).send(consultant);
    }

    @ApiExcludeEndpoint()
    @Get('consult-company-details')
    async getCompanyDetails(
        @Req() req: Request,
        @Res() res: Response,
        @Query() query: ConsultantCompanyDetailsDto,
    ): Promise<any> {
        const company = await this.consultants.getCompanyDetails(query);
        return res.status(200).send(company);
    }

    @ApiExcludeEndpoint()
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Get('all-license')
    async getAllLicense(@Req() req: Request, @Res() res: Response, @Query() query: AllLicenseDto): Promise<any> {
        const consultant = await this.consultants.getAllLicense(query);
        return res.status(200).send(consultant);
    }

    @ApiExcludeEndpoint()
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Put('change-license')
    async changeLicense(@Req() req: Request, @Res() res: Response, @Body() body: ChangeLicenseDto): Promise<any> {
        const userId = Number((<{ id: string }>req['user']).id);
        const consultant = await this.consultants.changeLicense(userId, body);
        return res.status(200).send(consultant);
    }

    @ApiExcludeEndpoint()
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

    @ApiExcludeEndpoint()
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Get('calculate-price')
    async calculatePrice(@Req() req: Request, @Res() res: Response, @Query() query: CalculatePriceDto): Promise<any> {
        const userId = Number((<{ id: string }>req['user']).id);
        const response = await this.consultants.calculatePrice(userId, query);
        return res.status(200).send(response);
    }

    @ApiExcludeEndpoint()
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Put('update-license')
    async updateLicense(@Res() res: Response, @Body() body: UpdateLicenseDto): Promise<any> {
        const consultant = await this.consultants.updateLicense(body);
        return res.status(200).send(consultant);
    }

    @ApiExcludeEndpoint()
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Post('renew-devices')
    async renewDevices(@Res() res: Response, @Body() body: RenewDevicesDto): Promise<any> {
        const consultant = await this.consultants.renewDevices(body);
        return res.status(200).send(consultant);
    }
}
