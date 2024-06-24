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
import { ChowisCustomerConsents } from '@/src/common/entities/crmEntities/ChowisCustomerConsents.entity';
import { CommonService } from '@/src/common/common.service';
import { CustomerConsentsService } from '../customerConsents/customerConsents.service';
import axios from 'axios';
import * as fs from 'fs';
import * as FormData from 'form-data';
import { ErrorStatus } from '@/src/common/constants/error-status';

@Injectable()
export class CRMService {
    constructor(
        @InjectRepository(ChowisCustomerConsents)
        private readonly chowisCustomerConsentRepository: Repository<ChowisCustomerConsents>,

        private readonly customerService: CustomersService,
        private consultantsService: ConsultantsService,
        private countriesService: CountriesService,
        private productService: ProductsService,
        private commonService: CommonService,
        private customerConsentsService: CustomerConsentsService,
    ) {}

    async getCustomer(id: number, data: GetCustomerDto) {
        const { email, name, surname, search } = data;
        const page = data.page ? Number(data.page) : 1;
        const perPage = data.per ? Number(data.per) : 20;
        const selection = {
            id: true,
            email: true,
            external_id: true,
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
        };
<<<<<<< HEAD
        const consultant = await this.consultantsService.getConsultant({ id: id }, selection, [
            'customers',
            'customers.gender',
            'customers.country',
        ]);

        if (!consultant) {
            this.commonService.throwNotFoundError();
        }

        let customers = consultant.customers;

        customers = customers.map((c: any) => {
            return { ...c, country_code: c.getContryCode, gender: c.getGenderId, country: null };
        });

=======
        let condition: any = { consultant_id: id };
>>>>>>> 822c3150c3c70eb7b10d09d0d0b97f415d973247
        if (email) {
            condition = { consultant_id: id, email: email };
        }

        if (name) {
            condition = { consultant_id: id, name: name };
        }

        if (surname) {
            condition = { consultant_id: id, surname: surname };
        }
        // const consultant = await this.consultantsService.getConsultant({ id: id }, selection, [
        //     'customers',
        //     'customers.gender',
        //     'customers.country',
        // ]);

        if (!id) {
            this.commonService.throwNotFoundError();
        }

        let customers = await this.customerService.getCustomersByConsultant(
            condition,
            selection,
            search,
            page,
            perPage,
        );

        // const customersData = customers.data.map((c: any) => {
        //     return { ...c, country_code: c.getContryCode, gender: c.getGenderId, country: null };
        // });

        // if (page && perPage) {
        //     console.log(page, perPage,"--->", (page && perPage))
        //     const startIndex = (page - 1) * perPage;
        //     const endIndex = page * perPage;
        //     customers = customers.slice(startIndex, endIndex);
        // }

        // customersData.forEach((item: any) => {
        //     if(item?.gender){
        //         item.gender = Number(item.gender);
        //     }
        // });

        delete customers.perPage;
        return customers;
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
        const consultant = await this.consultantsService.getConsultant({ id: consultantId }, selection, [
            'customers',
            'customers.gender',
            'customers.country',
        ]);

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

        customer.country_code = customer.getContryCode;
        customer.gender = customer.getGenderId;
        customer.country_id = customer.getContryId;

        return customer;
    }

    async deleteCustomer(consultantId: number, customerId: number) {
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
        const consultant = await this.consultantsService.getConsultant({ id: consultantId }, selection, [
            'customers',
            'customers.products',
            'customers.chowisCustomerConsents',
        ]);

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

        const consentIds = customer.chowisCustomerConsents.map((c: any) => c.id);

        if (consentIds && consentIds.length) {
            await this.chowisCustomerConsentRepository.update({ id: In(consentIds) }, { customer_id: null });
        }

        const deletedCustomer = await this.customerService.deleteCustomer(customer.id);

        if (!deletedCustomer) {
            throw new BadRequestException({
                result_code: ErrorStatus.CUSTOM_ERROR,
                error: ResponseMessages.CustomerNotDeleted,
            });
        }

        return this.commonService.generateMessage(ResponseMessages.RecordDeleted);
    }

    async register(id: number, data: UpdateCrmCustomersDto) {
        const { email, phone, app_id, country_code } = data;
        let country_id = data.country_id;

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
                country_id = Number(country.id);
            }
        }

        const customerData = {
            ...data,
            consultant_id: consultant.id,
            country_id: country_id,
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

    async updateCustomer(customerId: number, data: UpdateCrmCustomersDto) {
        // TODO: Use locale from headers for translation

        const customer = await this.customerService.getCustomer({ id: customerId });
        if (!customer) {
            throw new NotFoundException({
                result_code: ErrorStatus.CUSTOMER_NOT_FOUND,
                error: ResponseMessages.CustomerNotFound,
            });
        }

        const customerData = await this.customerService.update(customerId, data);
        return customerData;
    }

    async update(consultantId: number, customerId: number, data: UpdateCrmCustomersDto) {
        let country_id = data.country_id;
        const consultant = await this.consultantsService.getConsultant({ id: consultantId }, [], ['customers']);

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

        if (data.country_code) {
            const country = await this.countriesService.findOneCountry({ country_code: data.country_code }, ['id']);
            if (country) {
                country_id = Number(country.id);
            }
        }

        await this.customerService.update(customerId, data);
        const updatedCustomer = await this.customerService.getCustomer(
            { id: customerId },
            [],
            ['country', 'gender', 'products'],
        );

        return { ...updatedCustomer, consultant_name: consultant.name, optic_number: updatedCustomer.getOpticNumbers };
    }

    async createCustomer(id: number, data: UpdateCrmCustomersDto) {
        // TODO: Use locale from headers for translation

        const { email, phone, app_id, country_code } = data;
        let country_id = data.country_id;

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

        let customers = consultant.customers;
        if (email) {
            customers = customers.filter((customer: any) => customer.email === email && customer.app_id == app_id);
        }

        if (phone) {
            customers = customers.filter((customer: any) => customer.phone === phone && customer.app_id == app_id);
        }

        if (customers.length) {
            throw new ConflictException({
                result_code: ErrorStatus.DATA_ALREADY_EXIST,
                error: ResponseMessages.DataAlreadyExist,
            });
        }

        if (country_code) {
            const country = await this.countriesService.findOneCountry({ country_code: country_code }, ['id']);
            if (country) {
                country_id = Number(country.id);
            }
        }

        const customer = {
            ...data,
            consultant_id: consultant.id,
            country_id: country_id,
            register_date: new Date(),
            register_for_crm: true,
            created_at: new Date(),
            updated_at: new Date(),
        };

        const createdCustomer = await this.customerService.createCrmCustomer(customer);

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
            country_id: createdCustomer.country_id,
            birth: createdCustomer.birth,
            country: createdCustomer.country,
            register_date: createdCustomer.register_date,
            country_code: createdCustomer.country_code,
            gender: createdCustomer.gender_id,
        };
    }

    async getByEmail(id: number, data: GetByEmailDto) {
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
        const consultant = await this.consultantsService.getConsultant({ id: id }, selection, [
            'customers',
            'customers.gender',
            'customers.country',
        ]);

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

        customer.country_code = customer.getContryCode;
        customer.gender = customer.getGenderId;
        customer.country_id = customer.getContryId;

        return customer;
    }

    async syncCustomer(consultantId: number, authToken: string, data: CustomerSyncDto) {
        const localCustomerId = data.customer_id;
        const { name, email, phone_number, diagnosis_info } = data;

        // TODO: Need validation email in future
        // const customerExist = await this.customerService.getCustomer({ email: email });

        // if (customerExist) {
        //     throw new ConflictException(ResponseMessages.EmailExist);
        // }

        const customer = await this.customerService.createCrmCustomer({
            consultant_id: consultantId,
            name: name,
            email: email,
            phone: phone_number,
            created_at: new Date(),
            updated_at: new Date(),
        });

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

                const analysisResponse = await axios
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

    async presignedUpload(data: PresignedUploadDto) {}

    async updateConsentForm(data: UpdateConsentForm) {
        // TODO: Use locale from headers for translation

        if (!['ipos_consent', 'without_ipos_consent'].includes(data.consent_type)) {
            throw new BadRequestException({
                result_code: ErrorStatus.CUSTOM_ERROR,
                error: ResponseMessages.InvalidConsentType,
            });
        }

        const customer = await this.customerService.getCustomer({ id: data.customer_id });

        if (!customer) {
            throw new NotFoundException({
                status_code: ErrorStatus.NOT_FOUND,
                error: ResponseMessages.CustomerNotFound,
            });
        }

        // const consent = await this.customerConsentsService.createDiorCustomerConsent({
        //     customerId: customer.id,
        //     consentType: data.consent_type,
        //     consentFormAnswers: [data.consent_form_answers],
        //     batchId: Number(data.batch_id),
        //     withIposUrl: data.consent_type === 'ipos_consent' ? data.url : null,
        //     withoutIposUrl: data.consent_type === 'without_ipos_consent' ? data.url : null,
        //     createdAt: new Date(),
        //     updatedAt: new Date(),
        // });

        // if (!consent) {
        //     throw new BadRequestException('Error in creating consent');
        // }

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
