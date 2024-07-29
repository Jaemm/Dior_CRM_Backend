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
    async getConsultants(@Query() query: GetConsultantDto) {
        return await this.consultants.getConsultants(query);
    }

    @Post()
    @ApiOperation({ summary: 'signup consultant' })
    @ApiHeader({ name: 'X-CHOWIS-LOCALE', required: false })
    async createConsultant(@Body() body: ConsultantDto, @Headers('X-CHOWIS-LOCALE') locale?: string) {
        return await this.consultants.signUpRuby(body, locale);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Get('company')
    async getCompanies() {
        return await this.consultants.getCompanies();
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Get('branch')
    @ApiQuery({ name: 'consultant_company_id', required: false })
    async getBranches(@Query('consultant_company_id') companyId?: string) {
        return await this.consultants.getBranches(companyId);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Get('shop')
    @ApiQuery({ name: 'consultant_branch_id', required: false })
    async getShops(@Query('consultant_branch_id') branchId: string) {
        return await this.consultants.getShops(branchId);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Get('position')
    async getPositions() {
        return await this.consultants.getPositions();
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Get('country')
    async getCountries() {
        return await this.consultants.getCountries();
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Get('store')
    async getStores() {
        return await this.consultants.getStores();
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Post('create_sale_connection')
    @ApiHeader({ name: 'X-CHOWIS-LOCALE', required: false })
    async createSalesConnection(@Body() body: CreateSalesConnectionDto, @Headers('X-CHOWIS-LOCALE') locale: string) {
        return await this.consultants.createSalesConnection(body, locale);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Get('fetch_sales_connection')
    async fetchSalesConnection(@Query() query: FetchSalesConnectionDto) {
        return await this.consultants.fetchSalesConnection(query);
    }

    @Get('me')
    @ApiHeader({ name: 'X-CHOWIS-LOCALE', required: false })
    @Roles(Role.Consultant)
    @ApiBearerAuth()
    async getConsultantAboutMe(@Req() req: Request, @Headers('X-CHOWIS-LOCALE') locale: string) {
        return this.consultants.getConsultantAboutMe(req, locale);
    }

    @Post('login/social')
    @ApiHeader({ name: 'X-CHOWIS-LOCALE', required: false })
    async loginSocial(@Req() req: Request, @Body() body: LoginSocialDto, @Headers('X-CHOWIS-LOCALE') locale?: string) {
        return await this.consultants.loginSocial(body, locale);
    }

    @Post('login')
    @ApiHeader({ name: 'X-CHOWIS-LOCALE', required: false })
    async login(
        @Res() res: Response,
        @Body() body: LoginConsultantDto,
        @Headers('X-CHOWIS-LOCALE') locale: string,
    ): Promise<any> {
        const loginResult = await this.consultants.loginRuby(body, locale);
        return res.status(200).send({ ...loginResult });
    }

    @Put('/update')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'update consultant information' })
    @ApiHeader({ name: 'X-CHOWIS-LOCALE', required: false })
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
    @ApiHeader({ name: 'X-CHOWIS-LOCALE', required: false })
    async enterProducts(
        @Req() req: Request,
        @Body() body: EnterProductDto,
        @Headers('X-CHOWIS-LOCALE') locale: string,
    ) {
        return await this.consultants.enterProducts(req, body, locale);
    }

    @Post('password')
    @ApiHeader({ name: 'X-CHOWIS-LOCALE', required: false })
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
    @ApiHeader({ name: 'X-CHOWIS-LOCALE', required: false })
    async passwordChange(
        @Req() req: Request,
        @Body() body: PasswrodChangeDto,
        @Headers('X-CHOWIS-LOCALE') locale: string,
    ): Promise<any> {
        const userId = Number((<{ id: string }>req['user']).id);
        return await this.consultants.passwordChange(userId, body, locale);
    }

    @Delete('delete_account')
    @ApiBearerAuth()
    @ApiHeader({ name: 'X-CHOWIS-LOCALE', required: false })
    @ApiQuery({ name: 'reason', required: false })
    @Roles(Role.Consultant)
    async deleteAccount(
        @Req() req: Request,
        @Query('reason') reason?: string,
        @Headers('X-CHOWIS-LOCALE') locale?: string,
    ): Promise<any> {
        const userId = Number((<{ id: string }>req['user']).id);
        return await this.consultants.deleteAccount(userId, reason, locale);
    }

    @Delete('notifications/:id')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async deleteNotificaion(@Req() req: Request, @Param('id') id: string) {
        return await this.consultants.deleteNotification(Number(id));
    }

    @ApiBearerAuth()
    @Get('notifications')
    async notifications(@Req() req: Request, @Query() query: GetNotificationsDto) {
        const consultantId = Number((<{ id: string }>req['user']).id);
        return await this.consultants.getNotifications(consultantId, query);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Post('request_callback_url')
    async requestCallbackUrl(@Req() req: Request, @Body() body: RequestCallBackUrlDto) {
        return await this.consultants.requestCallbackUrl(body, req);
    }

    @Get('product_recommendations')
    @ApiBearerAuth()
    @ApiHeader({ name: 'X-CHOWIS-LOCALE', required: false })
    @Roles(Role.Consultant)
    async getProductRecommendations(
        @Req() req: Request,
        @Query() query: ProductRecommendationsDto,
        @Headers('X-CHOWIS-LOCALE') locale: string,
    ) {
        return await this.consultants.getProductRecommendations(req, query, locale);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Get('health_tips/by_company')
    async getHelthTipsByCompany(@Req() req: Request, @Query() query: HealthTipsByCompanyDto) {
        return await this.consultants.getHelthTipsByCompany(req, query);
    }

    @Get('health_tips')
    @ApiBearerAuth()
    @ApiHeader({ name: 'X-CHOWIS-LOCALE', required: false })
    @Roles(Role.Consultant)
    async getHelthTips(
        @Req() req: Request,
        @Query() query: HealthTipsDto,
        @Headers('X-CHOWIS-LOCALE') locale?: string,
    ) {
        return await this.consultants.getHelthTips(req, query, locale);
    }

    @Post('login/phone')
    @ApiBearerAuth()
    @ApiHeader({ name: 'X-CHOWIS-LOCALE', required: false })
    @Roles(Role.Consultant)
    async loginPhone(@Req() req: Request, @Body() body: LoginPhoneDto, @Headers('X-CHOWIS-LOCALE') locale: string) {
        const userId = Number((<{ id: string }>req['user']).id);
        return await this.consultants.loginPhone(body, userId, locale);
    }

    @Post('tokens/refresh')
    @ApiHeader({ name: 'X-CHOWIS-LOCALE', required: false })
    async refreshToken(@Body() body: TokenRefreshDto, @Headers('X-CHOWIS-LOCALE') locale: string) {
        return await this.consultants.refreshToken(body, locale);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Get('generate_flat_file_dior')
    async generateFlatFileDior(@Req() req: Request) {
        return await this.consultants.generateFlatFileDior(req);
    }

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
