import {
    HttpStatus,
    Inject,
    INestApplication,
    Injectable,
    NotFoundException,
    UnprocessableEntityException,
} from '@nestjs/common';
import { ILike } from 'typeorm';
import { FetchFwVersionDto, LoginSocialDto, ShopListDto, UpdateFwVersionDto } from './app.dto';
import { CountriesListDto } from './modules/customers/customers.dto';

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
    SkinColorGroupsRepository,
} from './common/repositories/crm';
import { CountriesRepository } from './common/repositories/crm/countries.repository';
import * as XLSX from 'xlsx';
import { ExpressAdapter } from '@nestjs/platform-express';

@Injectable()
export class AppService {
    handleApp(app: INestApplication) {
        const httpAdapter = app.getHttpAdapter();

        if (httpAdapter instanceof ExpressAdapter) {
            const expressApp = httpAdapter.getInstance();
            const router = expressApp._router;

            if (router) {
                const availableRoutes = router.stack
                    .filter((layer: any) => layer.route)
                    .map((layer: any) => ({
                        path: layer.route.path,
                        method: layer.route.stack[0].method,
                    }));

                const worksheet = XLSX.utils.json_to_sheet(availableRoutes);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, 'APIRoutes');

                const filePath = './api_routes.xlsx';
                XLSX.writeFile(workbook, filePath);

            } else {
                console.error('Router is undefined');
            }
        } else {
            console.error('This application is not using Express');
        }
    }
    constructor(
        private readonly customersService: CustomersService,
        private readonly commonService: CommonService,
        private readonly productsService: ProductsService,
        private readonly ethnicitiesRepository: EthnicitiesRepository,
        private readonly deviceRepository: DevicesRepository,
        private readonly gendersRepository: GendersRepository,
        private readonly consultantShopsRepository: ConsultantShopsRepository,
        private readonly skinColorGroupsRepository: SkinColorGroupsRepository,
        private readonly countriesRepository: CountriesRepository,
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
        const countries = await this.countriesRepository.findCountry({
            name: ILike(`${search}%`),
        });
        return countries;
    }

    async basicDetails() {
        const [ethnicities, genders, skinColorGroups] = await Promise.all([
            this.ethnicitiesRepository.findEthinicities(),
            this.gendersRepository.findGender(),
            this.skinColorGroupsRepository.findSkinColorGroups(),
        ]);

        return {
            ethnicities,
            genders,
            skin_color_groups: skinColorGroups,
        };
    }

    async loginSocial(loginDetails: LoginSocialDto) {
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
        const userByEmail: any = null;

        if (socialEmail) {
        }

        if (socialData.id) {
        }

        if (user) {
            if (socialEmail && !userByEmail) {
                user.email = socialEmail;
            }
        } else if (userByEmail) {
            user = userByEmail;
        } else if (socialData.id) {
        }

        if (!user) {
            throw new UnprocessableEntityException({
                status: HttpStatus.UNPROCESSABLE_ENTITY,
                errors: {
                    user: 'userNotFound',
                },
            });
        }
        return {};
    }
}
