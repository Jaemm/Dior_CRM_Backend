import { Body, Controller, Delete, Get, Headers, Inject, Post, Put, Query, Req, Res, forwardRef } from '@nestjs/common';
import { Response, Request } from 'express';
import { CustomersService } from './customers.service';

import { ApiBearerAuth, ApiExcludeController, ApiExcludeEndpoint, ApiHeader, ApiQuery, ApiTags } from '@nestjs/swagger';
import {
    ChangePasswordCustomerDto,
    CustomersDto,
    UpdateCustomersDto,
    PresignedUploadDto,
    ResendConfirmationDto,
    CustomerSignUpDto,
    DeleteCustomerDto,
    AllLicenseDto,
    CustomerChangeLicenseDto,
    PasswordDto,
    NotifySalesChangeLicenseDto,
    CalculatePriceDto,
    UpdateLicenseDto,
    RenewDevicesDto,
} from '@/src/modules/customers/customers.dto';
import { Roles } from '@/src/common/decorators/roles.decorator';
import { Role } from '@/src/common/enums/role.enum';
import { ConfirmHtmlDto } from '../consultants/consultants.dto';

@ApiExcludeController()
@ApiTags('Customers')
@ApiHeader({
    name: 'X-CHOWIS-TOKEN',
    description: 'Custom header x-chowis',
    required: true,
})
@Controller('customers')
export class CustomersController {
    constructor(@Inject(forwardRef(() => CustomersService)) private readonly customers: CustomersService) {}

    @Post('generate_token')
    async generateToken(@Req() req: Request): Promise<any> {
        return await this.customers.generateToken();
    }

    @Post('login')
    async login(
        @Res() res: Response,
        @Body() body: CustomersDto,
        @Headers('X-CHOWIS-LOCALE') locale: string,
    ): Promise<any> {
        const { app_id, password, email } = body;
        const loginResult = await this.customers.login(email, password, Number(app_id), locale);
        return res.status(200).send(loginResult);
    }

    @Post()
    async signUp(
        @Res() res: Response,
        @Body() body: CustomerSignUpDto,
        @Headers('X-CHOWIS-LOCALE') locale: string,
    ): Promise<any> {
        const registedUser = await this.customers.customreSignUp(body, locale);
        return res.status(200).send(registedUser);
    }

    @Post('register')
    async register(
        @Res() res: Response,
        @Body() body: CustomersDto,
        @Headers('X-CHOWIS-LOCALE') locale: string,
    ): Promise<any> {
        const registedUser = await this.customers.signUp(body, locale);
        return res.status(200).send(registedUser);
    }

    @ApiBearerAuth()
    @Roles(Role.Customer)
    @Put('update')
    async update(@Req() req: Request, @Res() res: Response, @Body() body: UpdateCustomersDto): Promise<any> {
        const userId = Number((<{ id: string }>req['user']).id);
        const updatedCustomer = await this.customers.update(userId, body);
        return res.status(200).send(updatedCustomer);
    }

    @ApiBearerAuth()
    @Roles(Role.Customer)
    @Get('me')
    async me(@Req() req: Request, @Res() res: Response): Promise<any> {
        const id = (<{ id: string }>req['user']).id;
        console.log('---------------------->', req['user']);
        const customerDetails = await this.customers.customerDetails(id);
        return res.status(200).send(customerDetails);
    }

    @ApiBearerAuth()
    @Roles(Role.Customer)
    @Post('password_change')
    async passwordChange(
        @Req() req: Request,
        @Res() res: Response,
        @Body() body: ChangePasswordCustomerDto,
        @Headers('X-CHOWIS-LOCALE') locale: string,
    ): Promise<any> {
        const id = (<{ id: string }>req['user']).id;
        const changedPasswordResult = await this.customers.passwordChange(id, body, locale);
        return res.status(200).send(changedPasswordResult);
    }

    @Get('presign_upload')
    async presignUpload(@Res() res: Response, @Body() body: PresignedUploadDto): Promise<any> {
        const presign = await this.customers.presignUpload(body);
        return res.status(200).send(presign);
    }

    @ApiBearerAuth()
    @Post('logout')
    @Roles(Role.Customer)
    async logout(@Req() req: Request, @Res() res: Response): Promise<any> {
        const id = (<{ id: string }>req['user']).id;
        const logoutResult = await this.customers.logout(id);
        return res.status(200).send(logoutResult);
    }

    @Post('resend-confirmation-customer')
    async resendConfirmation(
        @Res() res: Response,
        @Body() body: ResendConfirmationDto,
        @Headers('X-CHOWIS-LOCALE') locale: string,
    ): Promise<any> {
        const resendResult = await this.customers.resendConfirmation(body, locale);
        return res.status(200).send(resendResult);
    }

    @ApiQuery({ name: 'token' })
    @Get('confirmation')
    async confirmation(@Res() res: Response, @Query() token: ConfirmHtmlDto): Promise<any> {
        // confirmEmail
        const confirmationResult = await this.customers.confirmEmail(token);
        return res.status(200).send(confirmationResult);
    }

    @ApiBearerAuth()
    @Roles(Role.Customer)
    @ApiQuery({ name: 'id' })
    @Get(':id')
    async getCustomer(@Res() res: Response, @Query('id') id: string): Promise<any> {
        const customer = await this.customers.getCustomerById(id);
        return res.status(200).send(customer);
    }

    @Post('password')
    async password(
        @Res() res: Response,
        @Body() body: PasswordDto,
        @Headers('X-CHOWIS-LOCALE') locale: string,
    ): Promise<any> {
        const passwordResult = await this.customers.password(body, locale);
        return res.status(200).send(passwordResult);
    }

    @ApiBearerAuth()
    @Roles(Role.Customer)
    @Delete('delete_account')
    async deleteAccount(@Req() req: Request, @Res() res: Response, @Body() body: DeleteCustomerDto): Promise<any> {
        const id = (<{ id: string }>req['user']).id;
        const response = await this.customers.deleteAccount(id, body);
        return res.status(200).send(response);
    }

    @ApiBearerAuth()
    @Roles(Role.Customer)
    @Get('all-licenses')
    async allLicenses(@Req() req: Request, @Res() res: Response, @Body() body: AllLicenseDto): Promise<any> {
        // const id = (<{ id: string }>req['user']).id;
        // const licenses = await this.customers.allLicenses(body);
        // return res.status(200).send(licenses);
    }

    @ApiBearerAuth()
    @Roles(Role.Customer)
    @Put('change-license')
    async changeLicense(
        @Req() req: Request,
        @Res() res: Response,
        @Body() body: CustomerChangeLicenseDto,
    ): Promise<any> {
        // const id = (<{ id: string }>req['user']).id;
        // const licenses = await this.customers.changeLicense(body);
        // return res.status(200).send(licenses);
    }

    @ApiBearerAuth()
    @Roles(Role.Customer)
    @Put('notify_sales_change_license')
    async notifySalesChangeLicense(
        @Req() req: Request,
        @Res() res: Response,
        @Body() body: NotifySalesChangeLicenseDto,
    ): Promise<any> {
        // const id = (<{ id: string }>req['user']).id;
        // const licenses = await this.customers.notifySalesChangeLicense();
        // return res.status(200).send(licenses);
    }

    @ApiBearerAuth()
    @Roles(Role.Customer)
    @Get('calculate-price')
    async calculatePrice(@Req() req: Request, @Res() res: Response, @Body() body: CalculatePriceDto): Promise<any> {
        // const id = (<{ id: string }>req['user']).id;
        // const price = await this.customers.calculatePrice();
        // return res.status(200).send(price);
    }

    @ApiBearerAuth()
    @Roles(Role.Customer)
    @Put('update-license')
    async updateLicense(@Req() req: Request, @Res() res: Response, @Body() body: UpdateLicenseDto): Promise<any> {
        // const id = (<{ id: string }>req['user']).id;
        // const licenses = await this.customers.updateLicense();
        // return res.status(200).send(licenses);
    }

    @ApiBearerAuth()
    @Roles(Role.Customer)
    @Post('renew-devices')
    async renewLicense(@Req() req: Request, @Res() res: Response, @Body() body: RenewDevicesDto): Promise<any> {
        // const id = (<{ id: string }>req['user']).id;
        // const licenses = await this.customers.renewLicense();
        // return res.status(200).send(licenses);
    }
}
