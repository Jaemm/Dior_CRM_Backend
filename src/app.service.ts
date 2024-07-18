import { HttpStatus, Inject, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { ILike } from 'typeorm';
import { FetchFwVersionDto, LoginSocialDto, ShopListDto, UpdateFwVersionDto } from './app.dto';
import { CountriesListDto } from './modules/customers/customers.dto';
import { CountriesService } from './modules/countries/countries.service';
import { SkinColorGroupsService } from './modules/skinColorGroups/skinColorGroups.service';

import { CustomersService } from './modules/customers/customers.service';
import { CommonService } from './common/common.service';
import { ResponseMessages } from './common/constants/response-messages';
import { ProductsService } from './modules/products/products.service';
import { ErrorStatus } from './common/constants/error-status';
import { SocialInterface } from './jwt/interfaces/token.interface';
import {
    ConsultantShopsRepository,
    DevicesRepository,
    EthnicitiesRepository,
    GendersRepository,
} from './common/repositories/crm';

@Injectable()
export class AppService {
    constructor(
        @Inject(SkinColorGroupsService)
        private readonly skinColorGroups: SkinColorGroupsService,

        @Inject(CountriesService)
        private readonly countries: CountriesService,

        private readonly customersService: CustomersService,
        private readonly commonService: CommonService,
        private readonly productsService: ProductsService,

        //repos
        private readonly ethnicitiesRepository: EthnicitiesRepository,
        private readonly deviceRepository: DevicesRepository,
        private readonly gendersRepository: GendersRepository,
        private readonly consultantShopsRepository: ConsultantShopsRepository,
    ) {}

    async shopList(params: ShopListDto) {
        const select = ['id', 'name', 'country_id', 'consultant_company_id', 'shop_code', 'postal_code'];
        const { consultant_company_id } = params;
        const shopList = await this.consultantShopsRepository.findConsultantShops(
            {
                consultant_company_id,
            },
            select,
        );
        return shopList;
    }

    async fetchFwVersion(params: FetchFwVersionDto) {
        const { optic_number } = params;

        const devices = await this.deviceRepository.findDevices(
            {
                optic_number,
            },
            [
                'id',
                'optic_number',
                'serial_number',
                'docking_number',
                'wb',
                'cal',
                'refresh_date',
                'app_version',
                'app_update_date',
                'division',
                'use_yn',
                'lat',
                'lng',
                'fw_version',
            ],
            ['consultant_company', 'consultant_company.applications'],
        );
        const device = devices[0];

        if (!device) {
            this.commonService.throwNotFoundError();
        }

        return device;
    }

    async updateFwVersion(params: UpdateFwVersionDto) {
        const { optic_number, fw_version } = params;

        const device = await this.deviceRepository.findOneDevices({
            optic_number,
        });

        if (!device) {
            this.commonService.throwNotFoundError();
        }

        await this.deviceRepository.updateDevice(device.id, { fw_version: fw_version });

        return this.commonService.generateMessage('Success!');
    }

    async countriesList(filters: CountriesListDto) {
        const search = filters?.search ?? '';
        const countries = await this.countries.findCountry({
            name: ILike(`${search}%`),
        });
        return countries;
    }

    async basicDetails() {
        const [ethnicities, genders, skinColorGroups] = await Promise.all([
            this.ethnicitiesRepository.findEthinicities(),
            this.gendersRepository.findGender(),
            this.skinColorGroups.findSkinColorGroups(),
        ]);

        return {
            ethnicities,
            genders,
            skin_color_groups: skinColorGroups,
        };
    }

    async loginSocial(loginDetails: LoginSocialDto) {
        // TODO
    }

    async logout(id: string) {
        const customer = await this.customersService.getCustomerById(id);

        if (!customer) {
            throw new NotFoundException({
                result_code: ErrorStatus.NOT_FOUND,
                error: ResponseMessages.CustomerNotFound,
            });
        }

        await this.customersService.updateCustomer(id, { token: null });

        const products = await this.productsService.findProduct({ customer_id: customer.id });

        if (products) {
            for (const product of products) {
                if (customer.email.includes('chowistest')) {
                    await new Promise<void>(async (resolve) => {
                        await this.productsService.updateProduct(product.id, {
                            consultant_id: null,
                            customer_id: null,
                            use_date: null,
                            use_time: null,
                            mac_address: null,
                            app_use_yn: 'N',
                            first_use_date: null,
                            days_remaining: Number(product.license_period),
                            days_remaining_updated_at: new Date(),
                        });
                        resolve();
                    });
                }

                if (customer.email.includes('@chowisas.com')) {
                    await new Promise<void>(async (resolve, _) => {
                        await this.productsService.updateProduct(product.id, {
                            use_date: null,
                            use_time: null,
                            mac_address: null,
                            app_use_yn: 'N',
                        });
                        resolve();
                    });
                }
            }
        }

        return this.commonService.generateMessage('Success!');
    }
    async validateSocialLogin(authProvider: string, socialData: SocialInterface): Promise<any> {
        let user: any = null;
        const socialEmail = socialData.email?.toLowerCase();
        let userByEmail: any = null;

        if (socialEmail) {
            // userByEmail = await this.usersService.findByEmail(socialEmail);
        }

        if (socialData.id) {
            // user = await this.usersService.findBySocialIdAndProvider({
            //     socialId: socialData.id,
            //     social: authProvider,
            // });
        }

        if (user) {
            if (socialEmail && !userByEmail) {
                user.email = socialEmail;
            }
            // await this.usersService.update(user.id, user);
        } else if (userByEmail) {
            user = userByEmail;
        } else if (socialData.id) {
            // const role = {
            //     id: RoleEnum.user,
            // };
            // const status = {
            //     id: StatusEnum.active,
            // };
            // user = await this.usersService.create({
            //     email: socialEmail ?? null,
            //     firstName: socialData.firstName ?? null,
            //     lastName: socialData.lastName ?? null,
            //     socialId: socialData.id,
            //     provider: authProvider,
            //     role,
            //     status,
            // });
            // user = await this.usersService.findById(user.id);
        }

        if (!user) {
            throw new UnprocessableEntityException({
                status: HttpStatus.UNPROCESSABLE_ENTITY,
                errors: {
                    user: 'userNotFound',
                },
            });
        }

        // const hash = crypto.createHash('sha256').update(randomStringGenerator()).digest('hex');

        // const session = await this.sessionService.create({
        //     user,
        //     hash,
        // });

        // const {
        //     token: jwtToken,
        //     refreshToken,
        //     tokenExpires,
        // } = await this.getTokensData({
        //     id: user.id,
        //     role: user.role,
        //     sessionId: session.id,
        //     hash,
        // });

        return {
            // refreshToken,
            // token: jwtToken,
            // tokenExpires,
            // user,
        };
    }
}
