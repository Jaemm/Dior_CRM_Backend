import { Products } from '@/src/common/entities/crmEntities/Products.entity';
import {
    BadRequestException,
    ConflictException,
    Inject,
    Injectable,
    NotFoundException,
    forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsSelectByString, Repository, In } from 'typeorm';
import { ProductsEnterDto, ProductsFetchDto } from './products.dto';
import { ResponseMessages } from '@/src/common/constants/response-messages';
import { CustomersService } from '../customers/customers.service';
import { CommonService } from '@/src/common/common.service';
import { ConsultantsService } from '../consultants/consultants.service';
import { Versions } from '@/src/common/entities/crmEntities/Versions.entity';
import { VersionItemType } from '@/src/common/enums/version-item-type.enum';
import { VersionEvent } from '@/src/common/enums/version-event.enum';
import { EmailSubject } from '@/src/common/constants/email-subjects';
import { ErrorStatus } from '@/src/common/constants/error-status';

import { ConsultantCompanyService } from '../consultantCompany/consultantCompany.service';
import { DevicesRepository, ProductsRepository } from '@/src/common/repositories/crm';

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Versions)
        private readonly versionsRepository: Repository<Versions>,

        private readonly companies: ConsultantCompanyService,
        private readonly commonService: CommonService,
        private readonly customersService: CustomersService,
        @Inject(forwardRef(() => ConsultantsService)) private readonly consultantsService: ConsultantsService,

        // repos
        private readonly productsRepository: ProductsRepository,
        private readonly devicesRepository: DevicesRepository,
    ) {}

    async findOneProductById(id: number) {
        const products = await this.productsRepository.findOne({
            where: {
                id: id,
            },
        });
        if (!products) {
            this.commonService.throwNotFoundError();
        }
        return products;
    }

    async findOneProduct(conditions?: any, selections?: string[], includes?: string[]) {
        const product = await this.productsRepository.findOne({
            where: conditions,
            select: selections ? (selections as FindOptionsSelectByString<Products>) : [],
            relations: includes,
        });

        return product;
    }

    async findProduct(conditions?: any, selections?: string[], includes?: string[]) {
        const products = await this.productsRepository.find({
            where: conditions,
            select: selections ? (selections as FindOptionsSelectByString<Products>) : [],
            relations: includes,
        });

        return products;
    }

    async insertProduct(product: Products) {
        const newProduct = this.productsRepository.create(product);
        const result = await this.productsRepository.save(newProduct);
        return result;
    }

    async proctConnectMulti(product: Products, customer: any) {
        // const countProduct = await this.productsMultiConnectRepository.count({ where: { product_id: product.id } });
        // if (countProduct > 5) {
        //     throw new ConflictException({
        //         result_code: ErrorStatus.DEVICE_ALREADY_REGISTERED,
        //         error: ResponseMessages.DeviceReachedMaximumRegistration,
        //     });
        // }
        // try {
        //     const insertProduct = this.productsMultiConnectRepository.create({
        //         consultant_id: null,
        //         customer_id: customer.id,
        //         product_id: product.id,
        //         created_at: new Date(),
        //         updated_at: new Date(),
        //     });
        //     await this.productsMultiConnectRepository.save(insertProduct).catch((e) => {});
        // } catch (error) {
        //     if (error.code === '23505' && error.detail.includes('Key (customer_id, product_id)')) {
        //     } else {
        //         throw new Error();
        //     }
        // }
        // const updatedProduct = await this.updateProduct(product.id, {
        //     app_use_yn: 'Y',
        //     products_multi_connect: true,
        // });
        // return updatedProduct;
    }

    async enterProduct(customerId: string, query: ProductsEnterDto, locale: string = 'en') {
        const { password, application_id, mac_address, lat, lng } = query;
        const isFirstUseDate = query.first_use_date === 'n';
        const optic_number = query.optic_number.toUpperCase();

        let useDate = new Date().toISOString().slice(0, 10).replace(/-/g, ''); // Format: YYYYMMDD
        let useTime = new Date().toISOString().slice(11, 16).replace(/:/g, ''); // Format: HHMM

        const customer = await this.customersService.getCustomerById(customerId);

        if (!customer) {
            throw new NotFoundException({
                result_code: ErrorStatus.NOT_FOUND,
                error: ResponseMessages.CustomerNotFound,
            });
        }

        const device = await this.devicesRepository.findOneDevices({ optic_number, pwd: password });

        const latt = lat ?? device.lat;
        const long = lng ?? device.long;
        const macAddress = mac_address ?? device.mac_address;

        if (!device) {
            throw new BadRequestException({
                result_code: ErrorStatus.PRODUCT_NOT_FOUND,
                error: ResponseMessages.ProductNotFound,
            });
        }

        if (device.use_yn !== 'Y') {
            throw new BadRequestException({
                result_code: ErrorStatus.DEVICE_ALREADY_IN_USE,
                error: ResponseMessages.DeviceAlreadyInUse,
            });
        }

        const product = await this.findOneProduct({ application_id }, [], ['license', 'application']);

        if (!product || (product && !product.license)) {
            throw new BadRequestException({
                result_code: ErrorStatus.LICENSE_NOT_FOUND,
                error: ResponseMessages.LicenseNotFound,
            });
        }

        const beforeUseDate = product.use_date;

        let updateProductResponse: any;
        if (Number(product?.customer_id) !== Number(customer.id)) {
            updateProductResponse = await this.proctConnectMulti(product, customer);
        } else {
            updateProductResponse = await this.updateProduct(product.id, {
                customer_id: customer.id,
                use_date: useDate,
                use_time: useTime,
                mac_address: mac_address,
                app_use_yn: 'Y',
            });
        }

        if (!updateProductResponse.affected) {
            throw new BadRequestException({
                result_code: ErrorStatus.LICENSE_NOT_UPDATED,
                error: ResponseMessages.LicenseNotUpdated,
            });
        }

        let updatedProduct: any = await this.findOneProduct(
            { id: product.id },
            [],
            ['device', 'license', 'application'],
        );

        if (!beforeUseDate || (beforeUseDate == '' && product.use_date)) {
            if (!product.first_use_date) {
                await this.updateProduct(product.id, {
                    customer_id: customer.id,
                    first_use_date: product.use_date?.toString().replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'),
                });

                const updatedProduct = await this.findOneProduct(
                    { id: product.id },
                    [],
                    ['device', 'license', 'application'],
                );

                await this.versionsRepository.save({
                    itemId: product.id,
                    itemType: VersionItemType.Product,
                    event: VersionEvent.Update,
                    object: JSON.stringify(product),
                    objectChanges: JSON.stringify(updatedProduct),
                    comments: 'done by api, triggered by customer',
                    whodunnit: customer.id,
                    createdAt: new Date(),
                });
                const subject = await this.commonService.translate('device_activation_subject', locale);

                if (customer.email) {
                    await this.commonService.sendEmail({
                        to: customer.email,
                        subject: subject,
                        templateName: 'device-activation',
                        templateContext: {
                            deviceNumber: device.optic_number,
                            email: customer.email,
                        },
                    });
                }
            } else {
                await this.updateProduct(product.id, { customer: customer });
                const updatedProduct = await this.findOneProductById(product.id);

                await this.versionsRepository.save({
                    itemId: product.id,
                    itemType: VersionItemType.Product,
                    event: VersionEvent.Update,
                    object: JSON.stringify(product),
                    objectChanges: JSON.stringify(updatedProduct),
                    comments: 'done by api, triggered by customer',
                    whodunnit: customer.id,
                    createdAt: new Date(),
                });
            }
        }

        await this.devicesRepository.updateDevice(device.id, { lat: latt, lng: long });

        if (device.consultant_company_id) {
            updatedProduct.device.consultant_company = await this.consultantsService.getCompanyDetails({
                consultant_company_id: device.consultant_company_id,
            });
        }

        const expiredDate = this.consultantsService.expiredDate(product.first_use_date, product.license_period);
        let formattedDate;

        if (expiredDate) {
            const month = (expiredDate.getMonth() + 1).toString().padStart(2, '0');
            const date = expiredDate.getDate().toString().padStart(2, '0');
            const year = expiredDate.getFullYear();
            formattedDate = `${year}-${month}-${date}`;
        }
        updatedProduct.expired_date = formattedDate ?? null;
        updatedProduct.is_expired = updatedProduct.expired_date ? new Date() > updatedProduct.expired_date : false;

        const files = await this.companies.getCompaniesFiles(String(updatedProduct.application.id));
        const attachmentObject: any = {};
        files.forEach((attachment) => {
            const { name, blob } = attachment;
            const { key } = blob;
            attachmentObject[name] = `${process.env.URL}/api/image/${key}`;
        });
        updatedProduct.application.apk_url = attachmentObject.apk;
        updatedProduct.application.old_apk_url = attachmentObject.old_apk;
        updatedProduct.application.app_icon = attachmentObject.icon;

        return {
            result_code: '0',
            product: updatedProduct,
        };
    }

    async fetchProduct(query: ProductsFetchDto) {
        const { optic_number, password } = query;

        const device = await this.devicesRepository.findOneDevices({ optic_number, pwd: password });

        if (!device) {
            throw new NotFoundException({
                result_code: ErrorStatus.LOGIN_FAILED,
                error: ResponseMessages.ProductLoginFailed,
            });
        }

        const products = await this.findProduct(
            { device_id: device.id },
            [],
            ['device', 'device.consultant_company', 'application', 'license'],
        );

        if (!products) {
            throw new NotFoundException({
                result_code: ErrorStatus.LOGIN_FAILED,
                error: ResponseMessages.ProductLoginFailed,
            });
        }

        const companyDetails = await this.consultantsService.getCompanyDetails({
            consultant_company_id: device.consultant_company_id,
        });

        products.map((p) => (p.device.consultant_company = { ...companyDetails }));

        return products;
    }

    async updateProduct(id: number, productInput: any) {
        const result = await this.productsRepository.update(id, productInput);
        return result;
    }

    async updateProducts(condition: any, productInput: any) {
        const result = await this.productsRepository.update(condition, productInput);
        return result;
    }

    async getCustomerMultiProduct(customer_id: number) {
        // const productsList = await this.productsMultiConnectRepository.find({
        //     where: {
        //         customer_id,
        //     },
        //     select: {
        //         product_id: true,
        //     },
        // });
        // return productsList;
    }

    async getProducts(customer_id: any) {
        let productIds: any = await this.getCustomerMultiProduct(Number(customer_id));

        const numericProductIds = productIds.map((product_id: any) => product_id['product_id']);

        const products = await this.findProduct(
            {
                id: In(numericProductIds),
            },
            [],
            ['device', 'license', 'device.consultant_company', 'device.consultant_company.applications', 'application'],
        );

        return products;
    }
}
