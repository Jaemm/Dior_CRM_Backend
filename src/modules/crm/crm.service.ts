import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { ConsultantsService } from '../consultants/consultants.service';
import {
    CustomerSyncDto,
    GetByEmailDto,
    GetCustomerDto,
    PresignedUploadDto,
    UpdateConsentForm,
    UpdateCrmCustomersDto,
} from './crm.dto';
import { CustomersService } from '../customers/customers.service';
import { ResponseMessages } from '@/src/common/constants/response-messages';
import { CountriesService } from '../countries/countries.service';
import { ProductsService } from '../products/products.service';

import { CommonService } from '@/src/common/common.service';

import axios from 'axios';
import * as fs from 'fs';
import * as FormData from 'form-data';
import { ErrorStatus } from '@/src/common/constants/error-status';
import { Customers, Consultants, DiorCustomerConsents, Countries } from '@/src/common/entities/crmEntities';
import { AwsS3Service } from '@/src/common/awsS3/awsS3.service';

@Injectable()
export class CRMService {
    constructor(
        @InjectRepository(Customers)
        private readonly customersRepository: Repository<Customers>,
        @InjectRepository(Consultants)
        private readonly consultantRepository: Repository<Consultants>,
        @InjectRepository(DiorCustomerConsents)
        private readonly diorCustomerConsentsRepository: Repository<DiorCustomerConsents>,
        @InjectRepository(Countries)
        private readonly countryRepository: Repository<Countries>,

        private awsS3Service: AwsS3Service,
        private readonly customerService: CustomersService,
        private consultantsService: ConsultantsService,
        private countriesService: CountriesService,
        private productService: ProductsService,
        private commonService: CommonService,
    ) {}

    async getCustomer(id: number, data: GetCustomerDto) {
        const { email, name, surname, search } = data;
        const page = data.page ? Number(data.page) : 1;
        const perPage = data.per ? Number(data.per) : 20;

        try {
            const customerQuery = this.customersRepository.createQueryBuilder('customers');

            if (email) {
                customerQuery.andWhere('customers.email LIKE :email', { email: `%${email}%` });
            }

            if (name) {
                customerQuery.andWhere('customers.name LIKE :name', { name: `%${name}%` });
            }

            if (surname) {
                customerQuery.andWhere('customers.surname LIKE :surname', { surname: `%${surname}%` });
            }

            if (search) {
                const searchLower = search.toLowerCase();
                customerQuery.andWhere(
                    '(LOWER(customers.email) LIKE :search OR LOWER(customers.name) LIKE :search OR LOWER(customers.surname) LIKE :search)',
                    { search: `%${searchLower}%` },
                );
            }

            const [customers, totalCount] = await customerQuery
                .take(perPage)
                .skip((page - 1) * perPage)
                .getManyAndCount();

            return {
                data: customers,
                total_size: totalCount,
                current_page_size: customers.length,
                current_page: page,
                total_pages: Math.ceil(totalCount / perPage),
            };
        } catch (e) {
            throw e;
        }
    }

    async getCustomerById(consultantId: number, customerId: number) {
        const selection = {
            customers: {
                id: true,
                email: true,
                name: true,
                surname: true,
                os: true,
                language: true,
                phone_country_code: true,
                phone: true,
                address: true,
                city: true,
                state: true,
                zip_code: true,
                notes: true,
                push_token: true,
                app_id: true,
                company_id: true,
                consultant_id: true,
                skin_color_group_id: true,
                ethnicity_id: true,
                age: true,
                birth: true,
                register_date: true,
                country_code: true,
            },
        };
        const consultant = await this.consultantsService.getConsultant({ id: consultantId }, selection, ['customers']);

        if (!consultant) {
            this.commonService.throwNotFoundError();
        }

        const customer = consultant.customers.find((customer: any) => customer.id == customerId);

        if (!customer) {
            throw new NotFoundException({
                result_code: ErrorStatus.NOT_FOUND,
                error: ResponseMessages.CrmCustomerNotFound,
            });
        }

        return customer;
    }

    async deleteCustomer(consultantId: number, customerId: number) {
        const consultant = await this.consultantRepository.findOne({
            where: {
                id: consultantId,
            },
            relations: ['customers', 'customers.products', 'customers.chowisCustomerConsents'],
        });

        if (!consultant) {
            this.commonService.throwNotFoundError();
        }

        const customer = consultant.customers.find((customer: any) => customer.id == customerId);

        if (!customer) {
            throw new NotFoundException({
                result_code: ErrorStatus.NOT_FOUND,
                error: ResponseMessages.CrmCustomerNotFound,
            });
        }

        const productIds = customer.products.map((p: any) => p.id);

        if (productIds && productIds.length) {
            await this.productService.updateProducts({ id: In(productIds) }, { customer_id: null });
        }

        const deletedCustomer = await this.customersRepository.delete(customer.id);

        if (deletedCustomer.affected === 0) {
            throw new BadRequestException({
                result_code: ErrorStatus.CUSTOM_ERROR,
                error: ResponseMessages.CustomerNotDeleted,
            });
        }

        return this.commonService.generateMessage(ResponseMessages.RecordDeleted);
    }

    async register(id: number, data: UpdateCrmCustomersDto) {
        const { email, phone, app_id, country_code } = data;
        // let country_id = data.country_id;

        if (!email && !phone) {
            throw new BadRequestException({
                result_code: ErrorStatus.BAD_REQUEST,
                error: ResponseMessages.EmailOrPhoneRequired,
            });
        }

        if (!app_id) {
            throw new BadRequestException({
                result_code: ErrorStatus.BAD_REQUEST,
                error: ResponseMessages.AppIdRequired,
            });
        }

        const consultant = await this.consultantsService.getConsultant({ id: id }, [], ['customers']);

        if (!consultant) {
            this.commonService.throwNotFoundError();
        }

        let customer;
        if (email) {
            customer = consultant.customers.find(
                (customer: any) => customer.email === email && customer.app_id == app_id,
            );
        }

        if (phone) {
            customer = consultant.customers.find(
                (customer: any) => customer.phone === phone && customer.app_id == app_id,
            );
        }

        if (customer) {
            throw new ConflictException({
                result_code: ErrorStatus.DATA_ALREADY_EXIST,
                error: ResponseMessages.DataAlreadyExist,
            });
        }

        if (country_code) {
            const country = await this.countriesService.findOneCountry({ country_code: country_code }, ['id']);
            if (country) {
                // country_id = Number(country.id);
            }
        }

        const customerData = {
            ...data,
            consultant_id: consultant.id,
            // country_id: country_id,
            register_date: new Date(),
            register_for_crm: true,
            created_at: new Date(),
            updated_at: new Date(),
        };

        const createdCustomer = await this.customerService.createCrmCustomer(customerData);
        const newCustomer = await this.customerService.getCustomer({ id: createdCustomer.id }, [], ['country']);

        return {
            id: newCustomer.id,
            email: newCustomer.email,
            name: newCustomer.name,
            surname: newCustomer.surname,
            os: newCustomer.os,
            language: newCustomer.language,
            phone: newCustomer.phone,
            address: newCustomer.address,
            city: newCustomer.city,
            state: newCustomer.state,
            zip_code: newCustomer.zip_code,
            notes: newCustomer.notes,
            push_token: newCustomer.push_token,
            app_id: newCustomer.app_id,
            company_id: newCustomer.company_id,
            consultant_id: newCustomer.consultant_id,
            skin_color_group_id: newCustomer.skin_color_group_id,
            ethnicity_id: newCustomer.ethnicity_id,
            sign_in_count: newCustomer.sign_in_count,
            image_url: newCustomer.image_url,
            country_id: newCustomer.country_id,
            country: newCustomer.country,
            birth: newCustomer.birth,
            gender: newCustomer.gender_id,
            optic_number: newCustomer.getOpticNumbers,
            consultant_name: consultant.name,
            social: newCustomer.social,
        };
    }

    async updateCustomer(consultantId: number, customerId: number, data: UpdateCrmCustomersDto) {
        // let country_id = data.country_id;

        const consultant = await this.consultantRepository.findOne({
            where: {
                id: consultantId,
            },
            relations: ['customers'],
        });

        if (!consultant) {
            this.commonService.throwNotFoundError();
        }

        const customer = consultant.customers.find((c: any) => c.id == customerId);

        if (!customer) {
            throw new NotFoundException({
                result_code: ErrorStatus.NOT_FOUND,
                error: ResponseMessages.CustomerNotFound,
            });
        }

        const mergeData = await this.customersRepository.merge(customer, data);
        await this.customersRepository.save(mergeData);

        const updatedCustomer = await this.customersRepository.findOne({
            where: { id: customerId },

            relations: ['products'],
        });

        return { ...updatedCustomer, consultant_name: consultant.name, optic_number: updatedCustomer.getOpticNumbers };
    }

    async createCustomer(consultantId: number, data: UpdateCrmCustomersDto) {
        // TODO: Use locale from headers for translation

        try {
            const { email, phone } = data;

            if (!email || !phone) {
                throw new BadRequestException({
                    result_code: ErrorStatus.INVALID_REQUEST,
                    error: 'Missing email and phone number',
                });
            }

            const consultant = this.consultantRepository.findOneBy({ id: consultantId });

            if (!consultant) {
                throw new BadRequestException({
                    result_code: ErrorStatus.NOT_FOUND,
                    error: 'Cannot found consultant',
                });
            }

            const newCustomer = this.customersRepository.create({
                email: data?.email,
                name: data?.name,
                surname: data?.surname,
                gender: data?.gender,
                birth: data?.birth,
                skin_color_group_id: data?.skin_color_group_id,
                ethnicity_id: data?.ethnicity_id,
                os: data?.os,
                language: data?.language,
                phone_country_code: data?.phone_country_code,
                notes: data?.notes,
                age: data?.age,
                app_id: data?.app_id,
                phone: data?.phone,
                address: data?.address,
                city: data?.city,
                zip_code: data?.zip_code,
                state: data?.state,
                country: data?.country,
                country_code: data?.country_code,
                image_url: data?.image_url,
            });

            const createdCustomer = await this.customersRepository.save(newCustomer);

            return {
                id: createdCustomer.id,
                email: createdCustomer.email,
                name: createdCustomer.name,
                surname: createdCustomer.surname,
                os: createdCustomer.os,
                language: createdCustomer.language,
                phone_country_code: createdCustomer.phone_country_code,
                phone: createdCustomer.phone,
                address: createdCustomer.address,
                city: createdCustomer.city,
                state: createdCustomer.state,
                zip_code: createdCustomer.zip_code,
                notes: createdCustomer.notes,
                push_token: createdCustomer.push_token,
                app_id: createdCustomer.app_id,
                company_id: createdCustomer.company_id,
                consultant_id: createdCustomer.consultant_id,
                skin_color_group_id: createdCustomer.skin_color_group_id,
                ethnicity_id: createdCustomer.ethnicity_id,
                age: createdCustomer.age,
                birth: createdCustomer.birth,
                country: createdCustomer.country,
                register_date: createdCustomer.register_date,
                country_code: createdCustomer.country_code,
            };
        } catch (e) {
            throw e;
        }
    }

    async getByEmail(consultantId: number, data: GetByEmailDto) {
        const selection = {
            customers: {
                id: true,
                email: true,
                name: true,
                surname: true,
                os: true,
                language: true,
                phone_country_code: true,
                phone: true,
                address: true,
                city: true,
                state: true,
                zip_code: true,
                notes: true,
                push_token: true,
                app_id: true,
                company_id: true,
                consultant_id: true,
                skin_color_group_id: true,
                ethnicity_id: true,
                age: true,
                birth: true,
                register_date: true,
                country_code: true,
            },
        };
        const consultant = await this.consultantsService.getConsultant({ id: consultantId }, selection, ['customers']);

        if (!consultant) {
            this.commonService.throwNotFoundError();
        }

        const customer = consultant.customers.find((customer: any) => customer.email === data.email);

        if (!customer) {
            throw new NotFoundException({
                result_code: ErrorStatus.NOT_FOUND,
                error: ResponseMessages.CrmCustomerNotFound,
            });
        }

        return customer;
    }

    async syncCustomer(consultantId: number, authToken: string, data: CustomerSyncDto) {
        const localCustomerId = data.customer_id;
        const { name, email, phone_number, diagnosis_info } = data;

        const newCustomer = await this.customersRepository.create({
            consultant_id: consultantId,
            name: name,
            email: email,
            phone: phone_number,
            created_at: new Date(),
            updated_at: new Date(),
        });

        const customer = await this.customersRepository.save(newCustomer);

        if (!customer) {
            throw new BadRequestException({
                result_code: ErrorStatus.CUSTOM_ERROR,
                error: ResponseMessages.CustomerNotCreated,
            });
        }

        const cloudCustomerId = customer.id;
        const batches = [];

        for (const d of diagnosis_info) {
            // Sync batch_id
            const batchIdUrl = `${process.env.CHOWIS_CLOUD_V2_URL}/analysis/requestBatchId?customer_id=${cloudCustomerId}`;
            const batchIdResponse = await axios
                .get(batchIdUrl, {
                    headers: { Authorization: `Bearer ${authToken}` },
                })
                .catch((error) => {
                    throw new BadRequestException({
                        result_code: ErrorStatus.SERVER_ERROR,
                        error: error.message || ResponseMessages.InternalServerError,
                    });
                });
            const batchData = batchIdResponse.data.body || batchIdResponse.data.data;

            const localBatchId = d.batch_id;
            const cloudBatchId = batchData.batch_id;
            batches.push({ local_batch_id: localBatchId, cloud_batch_id: cloudBatchId });

            for (const m of d.measurements) {
                // Sync analysis data
                // TODO: send originalImage & analyzedImage as a file
                const analysisUrl = `${process.env.CHOWIS_CLOUD_V2_URL}/analysis/offline`;

                let file: any = this.convertToFileFromBase64(m.original_image, 'originalImage.png');
                let file2: any = this.convertToFileFromBase64(m.result_image, 'analyzedImage.png');
                file = fs.createReadStream(file);
                file2 = fs.createReadStream(file2);

                const formData = new FormData();
                formData.append('batchId', cloudBatchId);
                formData.append('type', m.measurement_value);
                formData.append('originalImage', file);
                formData.append('analyzedImage', file2);
                formData.append('multipart', 'true');

                await axios
                    .post(analysisUrl, formData, {
                        headers: {
                            Authorization: `Bearer ${authToken}`,
                            ...formData.getHeaders(),
                        },
                    })
                    .catch((error) => {
                        throw new BadRequestException({
                            result_code: ErrorStatus.SERVER_ERROR,
                            error: error.message || ResponseMessages.InternalServerError,
                        });
                    });
            }
        }

        return {
            local_customer_id: localCustomerId,
            cloud_customer_id: cloudCustomerId,
            batches: batches,
        };
    }

    async presignedUpload(data: PresignedUploadDto) {
        try {
            const { file_name, consent_type, customer_id, file } = data;

            if (!['ipos_consent', 'without_ipos_consent'].includes(consent_type)) {
                throw new BadRequestException({
                    result_code: ErrorStatus.CUSTOM_ERROR,
                    error: ResponseMessages.InvalidConsentType,
                });
            }

            const result = await this.awsS3Service.getPresignedUpload({
                fileName: file_name,
                consentType: consent_type,
                customerId: customer_id,
                file: file,
            });

            return { result };
        } catch (e) {
            throw e;
        }
    }

    async updateConsentForm(data: UpdateConsentForm) {
        // TODO: Use locale from headers for translation

        const { customer_id, consent_type, consent_form_answers, batch_id, url } = data;

        if (!['ipos_consent', 'without_ipos_consent'].includes(consent_type)) {
            throw new BadRequestException({
                result_code: ErrorStatus.CUSTOM_ERROR,
                error: ResponseMessages.InvalidConsentType,
            });
        }

        const customer = await this.customersRepository.findOneBy({ id: customer_id });

        if (!customer) {
            throw new NotFoundException({
                status_code: ErrorStatus.NOT_FOUND,
                error: ResponseMessages.CustomerNotFound,
            });
        }

        const newConsent = await this.diorCustomerConsentsRepository.create({
            customerId: customer.id,
            consentType: consent_type,
            consentFormAnswers: consent_form_answers ? [consent_form_answers] : null,
            batchId: batch_id ? Number(batch_id) : null,
            withIposUrl: consent_type === 'ipos_consent' ? url : null,
            withoutIposUrl: consent_type === 'without_ipos_consent' ? url : null,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        const consent = await this.diorCustomerConsentsRepository.save(newConsent);

        if (!consent) {
            throw new BadRequestException('Error in creating consent');
        }

        return this.commonService.generateMessage('Success update consent form url');
    }

    convertToFileFromBase64(imageData: any, filename: string) {
        imageData = imageData.replace(/^data:image\/png;base64,/, '');

        const dir = 'public/images/crm';

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(`${dir}/${filename}`, imageData);

        return `${dir}/${filename}`;
    }
}
