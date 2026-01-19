import { Body, Controller, Get, Headers, Post, Query, Req, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiExcludeController, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { FetchFwVersionDto, LoginSocialDto, ShopListDto, UpdateFwVersionDto } from './app.dto';
import { AppService } from './app.service';
import { Roles } from './common/decorators/roles.decorator';
import { Role } from './common/enums/role.enum';
import { CountriesListDto, CustomersDto } from './modules/customers/customers.dto';
import { CustomersService } from './modules/customers/customers.service';

@ApiExcludeController()
@ApiTags('App')
@Controller()
export class AppController {
    constructor(private readonly appService: AppService, private readonly customers: CustomersService) {}

    @ApiTags('Customers')
    @Roles(Role.Customer)
    @ApiBearerAuth()
    @Get('shops-list')
    async shopList(@Res() res: Response, @Query() params: ShopListDto): Promise<any> {
        const shops = await this.appService.shopList(params);
        return res.status(200).send({ shops });
    }

    @ApiTags('Additional')
    @ApiBearerAuth()
    @Roles(Role.Consultant, Role.Customer)
    @Get('shops')
    async getShops(@Res() res: Response, @Query() params: ShopListDto): Promise<any> {
        const shopList = await this.appService.shopList(params);
        return res.status(200).send({ shops: shopList });
    }

    @ApiTags('Additional')
    @Get('fetch-fw-version')
    async fetchFwVersion(@Res() res: Response, @Query() params: FetchFwVersionDto) {
        const version = await this.appService.fetchFwVersion(params);
        return res.status(200).send(version);
    }

    @ApiTags('Additional')
    @Post('update-fw-version')
    async updateFwVersion(@Res() res: Response, @Query() params: UpdateFwVersionDto) {
        const response = await this.appService.updateFwVersion(params);
        return res.status(200).send(response);
    }

    @ApiTags('Additional')
    @ApiBearerAuth()
    @Roles(Role.Consultant, Role.Customer)
    @Get('basic-details')
    async basicDetails(@Res() res: Response) {
        const countriesList = await this.appService.basicDetails();
        return res.status(200).send(countriesList);
    }

    @ApiTags('Customers')
    @ApiBearerAuth()
    @Get('countries-list')
    async countriesList(@Res() res: Response, @Query() params: CountriesListDto): Promise<any> {
        const countriesList = await this.appService.countriesList(params);
        return res.status(200).send({ countries: countriesList });
    }

    @ApiTags('Customers')
    @ApiBearerAuth()
    @Get('basic-details-customers')
    async basicDetailsCustomer(@Res() res: Response): Promise<any> {
        const basicDetails = await this.appService.basicDetails();
        return res.status(200).send(basicDetails);
    }

    @ApiTags('Customers')
    @Post('login/social')
    async loginSocial(@Res() res: Response, @Body() body: LoginSocialDto): Promise<any> {
        const loginResult = await this.appService.loginSocial(body);
        return res.status(200).send(loginResult);
    }

    @ApiTags('Customers')
    @Post('login')
    async login(
        @Res() res: Response,
        @Body() body: CustomersDto,
        @Headers('X-LOCALE') locale: string,
    ): Promise<any> {
        const { app_id, password, email } = body;
        const loginResult = await this.customers.login(email, password, Number(app_id), locale);

        return res.status(200).send(loginResult);
    }

    @ApiTags('Customers')
    @ApiBearerAuth()
    @Roles(Role.Customer)
    @Post('logout')
    async logout(@Res() res: Response, @Req() req: Request): Promise<any> {
        const id = (<{ id: string }>req['user']).id;
        const logoutResult = await this.appService.logout(id);
        return res.status(200).send(logoutResult);
    }

    @Get('/callback')
    async handleRedirect(@Req() req: any) {
        return req?.user;
    }
}
