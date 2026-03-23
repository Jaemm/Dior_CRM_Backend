import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { In } from 'typeorm';
import { v4 as uuid } from 'uuid';
import axios from 'axios';
import * as fs from 'fs';
import * as FormData from 'form-data';
import * as path from 'path';

import { ConsultantsService } from '../consultants/consultants.service';
import {
    CreateCrmCustomerDto,
    CustomerSyncDto,
    GetByEmailDto,
    GetCustomerDto,
    PresignedUploadDto,
    UpdateConsentForm,
    UpdateCrmCustomersDto,
} from './crm.dto';
import { CustomersService } from '../customers/customers.service';
import { ResponseMessages } from '@/src/common/constants/response-messages';
import { ProductsService } from '../products/products.service';

import { CommonService } from '@/src/common/common.service';

import { ErrorStatus } from '@/src/common/constants/error-status';
import { AwsS3Service } from '@/src/common/awsS3/awsS3.service';
import {
    ConsultantsRepository,
    CustomersRepository,
    DiorCustomerConsentsRepository,
    PresignRepository,
} from '@/src/common/repositories/crm';
import { CountriesRepository } from '@/src/common/repositories/crm/countries.repository';
import { ConfigService } from '@nestjs/config';
import { Customers } from '@/src/common/entities/crmEntities';

@Injectable()
export class CRMService {
    constructor(
        private awsS3Service: AwsS3Service,
        private configService: ConfigService,
        private readonly customerService: CustomersService,
        private consultantsService: ConsultantsService,
        private productService: ProductsService,
        private commonService: CommonService,
        private readonly countriesRepository: CountriesRepository,
        private readonly customersRepository: CustomersRepository,
        private readonly consultantRepository: ConsultantsRepository,
        private readonly diorCustomerConsentsRepository: DiorCustomerConsentsRepository,
        private readonly presignRepository: PresignRepository,
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
                .orderBy('customers.id', 'DESC')
                .take(perPage)
                .skip((page - 1) * perPage)
                .getManyAndCount();

            return {
                data: customers.map((c) => c.getBasicInfo),
                total_size: totalCount,
                current_page_size: customers.length,
                current_page: page,
                total_pages: Math.ceil(totalCount / perPage),
            };
        } catch (e) {
            throw e;
        }
    }

    async getCustomerById(consultantId: number, customerId: number, locale = 'en') {
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
            throw new UnauthorizedException({
                result_code: ErrorStatus.UNAUTHORIZED,
                error: this.commonService.createLocaleErrorMessage(locale, 'unathorized'),
            });
        }

        const customer = consultant.customers.find((customer: any) => customer.id === customerId);

        if (!customer) {
            throw new NotFoundException({
                result_code: ErrorStatus.CUSTOMER_NOT_FOUND,
                error: this.commonService.createLocaleErrorMessage(locale, 'crm_customer_not_found'),
            });
        }

        return customer.getBasicInfo;
    }

    async deleteCustomer(consultantId: number, customerId: number, locale = 'en') {
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
                result_code: ErrorStatus.CUSTOMER_NOT_FOUND,
                error: this.commonService.createLocaleErrorMessage(locale, 'crm_customer_not_found'),
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
            const country = await this.countriesRepository.findOneCountry({ country_code: country_code }, ['id']);
            if (country) {
            }
        }

        const customerData = {
            ...data,
            consultant_id: consultant.id,
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
        const {
            email,
            social,
            social_id,
            name,
            os,
            language,
            phone,
            birth,
            address,
            note,
            app_id,
            company_id,
            consultant_id,
            surname,
            gender,
            skin_condition,
            skin_color_group_id,
            ethnicity_id,
            state,
            zip_code,
            country_code,
            is_active,
            notes,
            image_url,
            status,
            phone_country_code,
            ipos_consent_url,
            external_id,
        } = data;

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

        customer.email = email ? email : customer.email;
        customer.social = social ? social : customer.social;
        customer.social_id = social_id ? social_id : customer.social_id;
        customer.os = os ? os : customer.os;
        customer.language = language ? language : customer.language;
        customer.name = name ? name : customer.name;
        customer.phone = phone ? phone : customer.phone;
        customer.birth = birth ? birth : customer.birth;
        customer.address = address ? address : customer.address;
        customer.note = note ? note : customer.note;
        customer.app_id = app_id ? app_id : customer.app_id;
        customer.company_id = company_id ? company_id : customer.company_id;
        customer.consultant_id = consultant_id ? consultant_id : customer.consultant_id;
        customer.surname = surname ? surname : customer.surname;
        customer.gender = gender ? gender : customer.gender;
        customer.skin_condition = skin_condition ? skin_condition : customer.skin_condition;
        customer.skin_color_group_id = skin_color_group_id ? skin_color_group_id : customer.skin_color_group_id;
        customer.ethnicity_id = ethnicity_id ? ethnicity_id : customer.ethnicity_id;
        customer.state = state ? state : customer.state;
        customer.zip_code = zip_code ? zip_code : customer.zip_code;
        customer.country_code = country_code ? country_code : customer.country_code;
        customer.is_active = is_active ? is_active : customer.is_active;
        customer.notes = notes ? notes : customer.notes;
        customer.image_url = image_url ? image_url : customer.image_url;
        customer.status = status ? status : customer.status;
        customer.phone_country_code = phone_country_code ? phone_country_code : customer.phone_country_code;
        customer.ipos_consent_url = ipos_consent_url ? ipos_consent_url : customer.ipos_consent_url;
        customer.external_id = external_id ? external_id : customer.external_id;

        await this.customersRepository.save(customer);

        const updatedCustomer = await this.customersRepository.findOne({
            where: { id: customerId },

            relations: ['products'],
        });

        return { ...updatedCustomer, consultant_name: consultant.name, optic_number: updatedCustomer.getOpticNumbers };
    }

    async createCustomer(consultantId: number, data: CreateCrmCustomerDto, locale = 'en') {
        try {
            const { email, phone } = data;

            if (!email && !phone) {
                throw new BadRequestException({
                    result_code: ErrorStatus.CUSTOM_ERROR,
                    error: this.commonService.createLocaleErrorMessage(
                        locale,
                        'custom_error',
                        'Either email or phone number must be provided',
                    ),
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
                consultant_id: consultantId,
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
                ...createdCustomer.getBasicInfo,
                birth: createdCustomer.birth,
                register_date: createdCustomer.register_date,
            };
        } catch (e) {
            throw e;
        }
    }

    async getByEmail(consultantId: number, data: GetByEmailDto, locale = 'en') {
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

        const customer: Customers = consultant.customers.find((customer: any) => customer.email === data.email);

        if (!customer) {
            throw new NotFoundException({
                result_code: ErrorStatus.NOT_FOUND,
                error: this.commonService.createLocaleErrorMessage(locale, 'crm_customer_not_found'),
            });
        }

        return {
            ...customer.getBasicInfo,
            birth: customer.birth,
            register_date: customer.register_date,
        };
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

    async getFileFromS3(hash: string) {
        try {
            const existFile = await this.presignRepository.findOne({
                where: {
                    key: hash,
                },
            });

            if (!existFile) {
                throw new NotFoundException({
                    result_code: ErrorStatus.NOT_FOUND,
                });
            }

            const s3Key = `${existFile.prefix}/${hash}${existFile.fileExtension}`;

            const s3File = await this.awsS3Service.getImageCloudS3(s3Key);

            return {
                binary: s3File.Body,
                mimeType: existFile.mimeType,
                fileName: existFile.fileName,
            };
        } catch (e) {
            throw e;
        }
    }

    async presignedUpload(req: Request, data: PresignedUploadDto, file: Express.Multer.File, locale = 'en') {
        try {
            const consultantId = (<{ id: string }>req.user).id;
            const { consent_type } = data;

            const { originalname: fileName, mimetype, buffer } = file;

            if (!fileName || !consent_type) {
                throw new BadRequestException({
                    result_code: ErrorStatus.CUSTOM_ERROR,
                    error: this.commonService.createLocaleErrorMessage(
                        locale,
                        'custom_error',
                        'file or consent_type missing',
                    ),
                });
            }

            if (!['ipos_consent', 'without_ipos_consent'].includes(consent_type)) {
                throw new BadRequestException({
                    result_code: ErrorStatus.CUSTOM_ERROR,
                    error: this.commonService.createLocaleErrorMessage(
                        locale,
                        'custom_error',
                        'Only consent_type ipos_consent or without_ipos_consent accepted',
                    ),
                });
            }

            const limit = 8 * 1024 * 1024;
            const prefix = `uploads/images/customers/consents/${consent_type}`;

            const hash = uuid();
            const fileExtension = path.extname(fileName);

            const keyForS3 = `${hash}${fileExtension}`;

            await this.awsS3Service.uploadFileToS3(buffer, keyForS3, prefix);

            const baseUrl = this.configService.get('URL') || 'http://localhost:3100';
            const downloadUrl = `${baseUrl}/api/crm/customers/files/${hash}`;

            await this.presignRepository.saveNewPresignEntity({
                hash: hash,
                fileName: fileName,
                fileExtension: fileExtension,
                downloadUrl: downloadUrl,
                mimeType: mimetype,
                prefix: prefix,
                consultantId: Number(consultantId),
            });

            return {
                url: downloadUrl,
            };
        } catch (e) {
            throw e;
        }
    }

    async updateConsentForm(data: UpdateConsentForm, locale = 'en') {
        const { customer_id, consent_type, consent_form_answers, batch_id, url } = data;

        if (!consent_type) {
            throw new BadRequestException({
                result_code: ErrorStatus.CUSTOM_ERROR,
                error: this.commonService.createLocaleErrorMessage(locale, 'custom_error', 'Consent_type missing'),
            });
        }

        if (!['ipos_consent', 'without_ipos_consent'].includes(consent_type)) {
            throw new BadRequestException({
                result_code: ErrorStatus.CUSTOM_ERROR,
                error: this.commonService.createLocaleErrorMessage(
                    locale,
                    'custom_error',
                    'Only consent_type ipos_consent or without_ipos_consent accepted',
                ),
            });
        }

        const customer = await this.customersRepository.findOneBy({ id: customer_id });

        if (!customer) {
            throw new NotFoundException({
                status_code: ErrorStatus.CUSTOMER_NOT_FOUND,
                error: this.commonService.createLocaleErrorMessage(locale, 'crm_customer_not_found'),
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

        const splitUrl = url.split('/');
        const candidateKey = splitUrl[splitUrl.length - 1];

        const presign = await this.presignRepository.findOne({ where: { key: candidateKey } });

        if (presign) {
            newConsent.presignId = presign.id;
        }

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
