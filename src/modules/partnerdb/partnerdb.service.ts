import { Request } from 'express';
import * as argon2 from 'argon2';
import bcrypt from 'bcrypt';
import axios from 'axios';
import _ from 'lodash';

import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import {
    ApplicationsRepository,
    ConsultantsRepository,
    CustomersRepository,
    DevicesRepository,
    PasswordEmailDetailsRepository,
    ProductsRepository,
} from '@/src/common/repositories/crm';

import { ErrorStatus } from '@/src/common/constants/error-status';
import {
    GetAnalysisHistoriesDto,
    GetAnalysisHistoryByBatchIdDto,
    GetCustomerByConsultantDto,
    GetHydrationSebumByBatchIdDto,
    LoginDiorConsultantDto,
    ResetPasswordDto,
} from './partnerdb.dto';
import { Brackets, In } from 'typeorm';
import { ConsultantsService } from '../consultants/consultants.service';
import { CommonService } from '@/src/common/common.service';
import { PositionsIds } from '@/src/common/enums/position.enum';
import { Role } from '@/src/common/enums/role.enum';
import { AuthService } from '../auth/auth.service';
import { Applications, Devices } from '@/src/common/entities/crmEntities';
import { NotFoundError } from 'rxjs';

@Injectable()
export class PartnerDbService {
    constructor(
        private authService: AuthService,
        private consultantService: ConsultantsService,
        private commonService: CommonService,

        private readonly applicationRepository: ApplicationsRepository,
        private readonly customerRepository: CustomersRepository,
        private readonly consultantRepository: ConsultantsRepository,
        private readonly productsRepository: ProductsRepository,
        private readonly passwordEmailDetailsRepository: PasswordEmailDetailsRepository,
    ) {}

    async getConsultantById(consultantId: string) {
        try {
            const consultant = await this.consultantRepository.findOne({
                where: {
                    id: Number(consultantId),
                },
                relations: [
                    'products',
                    'products.device',
                    'consultant_licenses',
                    'consultant_licenses.licenses',
                    'consultant_company',
                    'consultant_branch',
                    'country_details',
                    'consultant_store',
                    'consultant_shop',
                    'consultant_position',
                ],
            });

            const reformatConsultant = {
                id: consultant.id,
                email: consultant.email,
                name: consultant.name,
                surname: consultant.surname,
                gender: consultant.gender,
                os: consultant.os,
                language: consultant.language,
                phone: consultant.phone,
                address: consultant.address,
                city: consultant.city,
                country: consultant.country,
                zip_code: consultant.zip_code,
                state: consultant.state,
                token: consultant.token,
                refresh_token: null as any,
                birthdate: consultant.birthdate,
                note: consultant.note,
                push_token: consultant.push_token,
                social: consultant.social,
                memo: consultant.memo,
                app_id: consultant.app_id,
                company_name: consultant.company_name,
                company_address: consultant.company_address,
                branch: consultant.branch,
                position: consultant.position,
                skin_color_group_id: consultant.skin_color_group_id,
                ethnicity_id: consultant.ethnicity_id,
                callback_url: consultant.callback_url,
                code: consultant.code,
                country_code: consultant.getContryCode,
                store: consultant.getStoreName,
                optic_number: consultant.getOpticNumbers,
                password_update_needed: consultant.password_update_needed,
                licenses: consultant.consultant_licenses
                    ? consultant.consultant_licenses.map((license) => {
                          return {
                              id: license.id,
                              name: license.licenses?.name,
                          };
                      })
                    : [],
                products: consultant.products
                    ? consultant.products.map((product) => {
                          return {
                              id: product.id,
                              first_use_date: product.first_use_date,
                              use_date: product.use_date,
                              use_time: product.use_time,
                              mac_address: product.mac_address,
                              app_use_yn: product.app_use_yn,
                              license_period: product.license_period,
                              created_at: product.created_at,
                              is_expired: product.getIsExpired,
                              device: product.device,
                              license: product.license,
                              application: product.application,
                          };
                      })
                    : [],
                consultant_company: consultant.consultant_company ? consultant.consultant_company.getBasicInfo : {},
                consultant_branch: consultant.consultant_branch
                    ? {
                          id: Number(consultant.consultant_branch.id),
                          consultant_company_id: Number(consultant.consultant_branch.consultantCompanyId),
                          name: consultant.consultant_branch.name,
                          created_at: consultant.consultant_branch.createdAt,
                          updated_at: consultant.consultant_branch.updatedAt,
                          code: consultant.consultant_branch.code,
                          email: consultant.consultant_branch.email,
                          password: consultant.consultant_branch.password,
                          country: consultant.consultant_branch.country,
                          consultant_country_id: consultant.consultant_branch.countryId,
                      }
                    : {},
                consultant_country: consultant.country_details
                    ? {
                          id: consultant.country_details.id,
                          consultant_branch_id: consultant.country_details.consultantBranchId,
                          name: consultant.country_details.name,
                          code: consultant.country_details.code,
                          created_at: consultant.country_details.createdAt,
                          updated_at: consultant.country_details.updatedAt,
                          consultant_company_id: consultant.country_details.consultantCompanyId,
                          url_and_port: consultant.country_details.urlAndPort,
                          default_recommendation: consultant.country_details.defaultRecommendation,
                      }
                    : {},
                consultant_store: consultant.consultant_store
                    ? {
                          id: Number(consultant.consultant_store.id),
                          consultant_country_id: Number(consultant.consultant_store.consultantCountryId),
                          name: consultant.consultant_store.name,
                          created_at: consultant.consultant_store.createdAt,
                          updated_at: consultant.consultant_store.updatedAt,
                      }
                    : {},
                consultant_shop: consultant.consultant_shop
                    ? {
                          id: consultant.consultant_shop.id,
                          name: consultant.consultant_shop.name,
                          created_at: consultant.consultant_shop.createdAt,
                          updated_at: consultant.consultant_shop.updatedAt,
                      }
                    : {},
                consultant_position: consultant.getPosition,
            };

            return reformatConsultant;
        } catch (e) {
            throw e;
        }
    }

    async getCustomersByConsultantId(consultantId: string, query: GetCustomerByConsultantDto) {
        try {
            const { search, filter_by, page, limit } = query;

            const consultant = await this.consultantRepository.findBy({ id: Number(consultantId) });

            if (!consultant) {
                throw new NotFoundException({
                    result_code: ErrorStatus.RECORD_NOT_FOUND,
                });
            }

            const customerQuery = this.customerRepository
                .createQueryBuilder('customer')
                .where('customer.consultant_id = :consultantId', { consultantId });

            if (search) {
                customerQuery.andWhere(
                    new Brackets((qb) => {
                        qb.where('customer.id LIKE :search', { search: `%${search}%` })
                            .orWhere('customer.name LIKE :search', { search: `%${search}%` })
                            .orWhere('customer.surname LIKE :search', { search: `%${search}%` })
                            .orWhere('customer.email LIKE :search', { search: `%${search}%` })
                            .orWhere('customer.phone LIKE :search', { search: `%${search}%` })
                            .orWhere('customer.country LIKE :search', { search: `%${search}%` })
                            .orWhere('customer.gender LIKE :search', { search: `%${search}%` });
                    }),
                );
            }
            //
            if (filter_by) {
                let filterByOrder = 'ASC';
                let filterByField = filter_by.toString();

                if (filterByField.includes('-')) {
                    filterByOrder = 'DESC';
                    filterByField = filterByField.replace('-', '');
                }

                if (filterByField.includes('app_name')) {
                    filterByField = 'application.name';
                    customerQuery.leftJoin('customer.application', 'application');
                }

                customerQuery.orderBy(filterByField, filterByOrder as 'ASC' | 'DESC');
            }

            const searchPage = Number(page || 1);
            const searchPer = Number(limit || 10);

            const [customers, totalCount] = await customerQuery
                .skip((searchPage - 1) * searchPer)
                .take(searchPer)
                .getManyAndCount();

            const reformatCustomer = customers.map((customer) => {
                return {
                    id: customer.id,
                    email: customer.email,
                    name: customer.name,
                    surname: customer.surname,
                    gender: customer.gender,
                    age: customer.age,
                    os: customer.os,
                    language: customer.language,
                    phone: customer.phone,
                    birth: customer.birth,
                    address: customer.address,
                    note: customer.note,
                    push_token: customer.push_token,
                    app_id: customer.app_id,
                    consultant_id: customer.consultant_id,
                    ethnicity_id: customer.ethnicity_id,
                    skin_color_group_id: customer.skin_color_group_id,
                    country_code: customer.country_code,
                    created_at: customer.created_at,
                };
            });

            return {
                data: reformatCustomer,
                total_size: totalCount,
                current_page_size: reformatCustomer.length,
                current_page: searchPage,
                total_pages: Math.ceil(totalCount / searchPer),
            };
        } catch (e) {
            throw e;
        }
    }

    async loginDiorConsultant(body: LoginDiorConsultantDto, locale: string = 'en') {
        let { email, password } = body;

        let consultant;

        const app_id = body?.app_id ?? '88';
        // if (app_id) {
        consultant = await this.consultantRepository.getConsultantEmailAndAppId(email, app_id);

        // if (!consultant) {
        consultant = await this.consultantRepository.getConsultantEmailAndAppId(email);

        if (!consultant) {
            throw new UnauthorizedException({
                result_code: ErrorStatus.LOGIN_FAILED,
                error: this.commonService.createLocaleErrorMessage(locale, 'login_failed'),
            });
        }

        if (!consultant.password_digest || consultant.password_digest === '') {
            throw new UnauthorizedException({
                result_code: ErrorStatus.LOGIN_FAILED,
                error: this.commonService.createLocaleErrorMessage(locale, 'login_failed'),
            });
        }

        consultant.app_id = Number(app_id);
        consultant = await this.consultantRepository.save(consultant);

        const passWordCheck = await this.consultantService.verifyPassword(password, consultant.password_digest, locale);

        if (!passWordCheck) {
            throw new UnauthorizedException({
                result_code: ErrorStatus.LOGIN_FAILED,
                error: this.commonService.createLocaleErrorMessage(locale, 'login_failed'),
            });
        }
        // }
        // }

        // else {
        //     const consultants = await this.consultantRepository.find({
        //         where: {
        //             email: email,
        //         },
        //     });

        //     if (!consultants && consultants.length < 1) {
        //         throw new UnauthorizedException({
        //             result_code: ErrorStatus.LOGIN_FAILED,
        //             error: this.commonService.createLocaleErrorMessage(locale, 'login_failed'),
        //         });
        //         if (passWordCheck === true) {
        //             throw new UnauthorizedException({
        //                 result_code: ErrorStatus.LOGIN_FAILED,
        //                 error: this.commonService.createLocaleErrorMessage(locale, 'login_failed'),
        //             });
        //         }
        //     }

        //     for (let i = 0; i < consultants.length; i++) {
        //         const c = consultants[i];

        //         if (c.password_digest) {
        //             this.consultantService.verifyPassword(password, c.password_digest, locale);
        //             consultant = c;
        //             break;
        //         }
        //     }
        // }

        if (!consultant) {
            throw new UnauthorizedException({
                result_code: ErrorStatus.LOGIN_FAILED,
                error: this.commonService.createLocaleErrorMessage(locale, 'login_failed'),
            });
        }

        if (!consultant.email_confirmed) {
            throw new UnauthorizedException({
                result_code: ErrorStatus.EMAIL_NOT_CONFIRMED,
                error: this.commonService.createLocaleErrorMessage(locale, 'not_confirmed'),
            });
        }

        if (Number(consultant.consultant_position) === PositionsIds.BRAND_MANAGER) {
            throw new UnauthorizedException({
                result_code: ErrorStatus.UNAUTHORIZED,
                error: this.commonService.createLocaleErrorMessage(locale, 'unauthorized'),
            });
        }

        const [accessToken, refreshToken] = await this.authService.generateAuthTokens(
            { id: consultant.id, email: consultant.email, role: Role.Consultant },
            '',
        );

        consultant.token = accessToken;
        consultant = await this.consultantRepository.save(consultant);

        const consultants = await this.consultantRepository.find({
            where: {
                email: email,
            },
        });

        const appIds = consultants.map((c) => c.app_id);

        const applications = await this.applicationRepository.find({
            where: {
                id: In(appIds),
            },
        });

        const apps = applications.map((appl) => {
            return {
                id: appl.id,
                name: appl.name,
            };
        });

        return {
            id: consultant.id,
            email: consultant.email,
            name: consultant.name,
            location: consultant.address,
            language: consultant.language,
            token: consultant.token,
            logged_in: new Date(),
            consultant_company: consultant.consultant_company ? consultant.consultant_company?.getBasicInfo : null,
            consultant_position: consultant.consultant_position ?? null,
            app_id: consultant.app_id,
            applications: apps,
            consultant_country: consultant.country || consultant?.consultant_branch?.country,
            countries: consultant?.countries || [],
        };
    }

    async getAnalysisHistories(req: Request, customerId: string, query: GetAnalysisHistoriesDto, locale = 'en') {
        try {
            const { filter_by: filterBy, page, limit } = query;

            const requestHeaders = req.headers;

            const authorization = requestHeaders?.authorization;

            const bearerToken = authorization.startsWith('Bearer') ? authorization : null;

            if (!bearerToken) {
                throw new UnauthorizedException({
                    result_code: ErrorStatus.UNAUTHORIZED,
                    error: this.commonService.createLocaleErrorMessage(locale, 'unauthorized'),
                });
            }

            const customer = await this.customerRepository.findOne({
                where: {
                    id: Number(customerId),
                },
                relations: ['consultant'],
            });

            if (!customer) {
                throw new NotFoundException({});
            }

            const consultant = customer?.consultant;

            let application: Applications;
            let device: Devices;
            if (customer?.app_id) {
                application = await this.applicationRepository.findByEntitiesAppId(customer);
                device = await this.productsRepository.findProductsDeviceByEntityAndAppId(customer);
            } else if (consultant?.app_id) {
                application = await this.applicationRepository.findByEntitiesAppId(consultant);
                device = await this.productsRepository.findProductsDeviceByEntityAndAppId(consultant);
            }

            // const data = [];

            const analysisTypeList = application?.analysis_type || [];

            const analysisHistoryRequestPromise = analysisTypeList.map(async (analysisType) => {
                let result: any;

                if (['CNDP Skin'].includes(analysisType)) {
                    const type = analysisType as 'CNDP Skin';
                    result = await this.analysisHistoryRequest(type, customerId, bearerToken);
                }

                if (result) {
                    result = {
                        data: result?.data || [],
                        device_id: device?.optic_number,
                        analysis_type: analysisType,
                        service_name: application?.name,
                    };
                }

                return result;
            });

            const data = await Promise.all(analysisHistoryRequestPromise);

            let filteredData = data;

            if (filterBy) {
                let filterByOrder = 'ASC';
                let filterByField = filterBy;

                if (filterBy.includes('-')) {
                    filterByOrder = 'DESC';
                    filterByField = filterBy.replace('-', '');
                }

                if (filterByOrder === 'DESC') {
                    filteredData = _.orderBy(filteredData, [filterByField], ['desc']);
                } else {
                    filteredData = _.orderBy(filteredData, [filterByField], ['asc']);
                }
            }

            const searchPage = Number(page || 1);
            const searchLimit = Number(limit || 25);

            return this.commonService.paginate(filteredData, searchPage, searchLimit);
        } catch (e) {
            throw e;
        }
    }

    async getAnalysisHistoriesByBatchId(
        req: Request,
        customerId: string,
        batchId: string,
        query: GetAnalysisHistoryByBatchIdDto,
        locale = 'en',
    ) {
        try {
            const { analysis_type: analysisType } = query;

            // const requestHeaders = req.headers;

            const authorization: any = req.headers['x-chowis-consultant-token']; //requestHeaders?.authorization;

            let bearerToken = authorization ? 'Bearer ' + authorization : null;
            if (!bearerToken) {
                bearerToken = req.headers?.authorization;
            }

            let result: any;

            // if (['cndpskin'].includes(analysisType)) {
            const type = 'cndpskin';
            result = await this.analysisHistoryRequestByBatchId(type, customerId, batchId, bearerToken);
            // }

            if (result.data && result.data.length > 0) {
                // Remove duplicates by 'hash' key
                const uniqueData = Array.from(new Map(result.data.map((item: any) => [item['hash'], item])).values());

                result.data = uniqueData;
            }
            return {
                data: result,
            };
        } catch (e) {
            throw e;
        }
    }

    async getHydrationSebumByBatchId(
        req: Request,
        customerId: string,
        batchId: string,
        query: GetHydrationSebumByBatchIdDto,
        locale = 'en',
    ) {
        try {
            const { analysis_type: analysisType } = query;

            const requestHeaders = req.headers;

            const authorization = requestHeaders?.authorization;

            const bearerToken = authorization.startsWith('Bearer') ? authorization : null;

            let result: any;

            if (['cndpskin'].includes(analysisType)) {
                const type = analysisType as 'cndpskin';
                result = await this.analysisHydrationSebumByBatchId(type, batchId, bearerToken);
            }

            return {
                data: result,
            };
        } catch (e) {
            throw e;
        }
    }

    async analysisHistoryRequest(analysisType: 'CNDP Skin', customerId: string, bearerToken: string): Promise<any[]> {
        const baseUrl = process.env['CNDP_SKIN_ANALYSIS_URL'];

        if (!baseUrl) {
            return null;
        }

        const requestUrl = `${baseUrl}/cndpskin/${customerId}/analysis-history?page=1&limit=25`;

        const response = await axios.get(requestUrl, {
            headers: {
                Authorization: bearerToken,
            },
        });

        return response.data || [];
    }

    async analysisHistoryRequestByBatchId(
        analysisType: 'cndpskin',
        customerId: string,
        batchId: string,
        bearerToken: string,
    ): Promise<any[]> {
        const baseUrl = process.env['CNDP_SKIN_ANALYSIS_URL'];

        if (!baseUrl) {
            return null;
        }
        //

        const requestUrlObj = `${baseUrl}/cndpskin/${customerId}/analysis-history/analysis-infor?batch_id=${batchId}`;

        const requestUrl = requestUrlObj;

        const response = await axios.get(requestUrl, {
            headers: {
                Authorization: bearerToken,
            },
        });

        // Return the result as JSON

        return response.data || [];
    }

    async analysisHydrationSebumByBatchId(
        analysisType: 'cndpskin',
        batchId: string,
        bearerToken: string,
    ): Promise<any[]> {
        const baseUrl = process.env['CNDP_SKIN_ANALYSIS_URL'];

        if (!baseUrl) {
            return null;
        }

        const requestUrl = `${baseUrl}/cndpskin/hydration-sebum?batch_id=${batchId}`;

        const response = await axios.get(requestUrl, {
            headers: {
                Authorization: bearerToken,
            },
        });

        return response.data || [];
    }

    async resetPassword(body: ResetPasswordDto, locale: string = 'en') {
        try {
            const { app_id, email } = body;

            let consultant;

            if (app_id) {
                consultant = await this.consultantRepository.findOne({
                    where: {
                        email: email,
                        app_id: Number(app_id),
                    },
                });
            } else {
                consultant = await this.consultantRepository.findOne({
                    where: {
                        email: email,
                    },
                });
            }

            if (!consultant) {
                throw new NotFoundException({
                    result_code: ErrorStatus.CUSTOM_ERROR,
                    error: this.commonService.createLocaleErrorMessage(
                        locale,
                        'custom_error',
                        'Please enter a valid email address.',
                    ),
                });
            }

            const MAXIMUM_REQUEST_PASSWORD_RESET = 50;

            const oneHourCount = await this.passwordEmailDetailsRepository.countingPassingOneHourTry(email);

            // if (oneHourCount >= MAXIMUM_REQUEST_PASSWORD_RESET) {
            //     throw new BadRequestException({
            //         result_code: ErrorStatus.CUSTOM_ERROR,
            //         error: 'You have reached maximum limit of reset password request!',
            //     });
            // }

            await this.passwordEmailDetailsRepository.save({
                email: email,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            const password = this.commonService.generateRandomPassword(12);
            console.log('새로 생성된 비밀번호:', password);
            const hashedPassword = await argon2.hash(password);

            await this.consultantRepository.updateConsultant(consultant.id, { password_digest: hashedPassword });

            const subject = await this.commonService.translate('password_recovery_subject', locale);

            await this.commonService.sendEmail({
                to: consultant.email,
                subject: subject,
                templateName: 'password-recovery',
                templateContext: {
                    password: password,
                },
            });

            return this.commonService.generateMessage('Success!');
        } catch (e) {
            throw e;
        }
    }

    async getCustomerById(customerId: string, locale: string = 'en') {
        try {
            const customer = await this.customerRepository.findOne({
                where: {
                    id: Number(customerId),
                },
                relations: ['skinColorGroup', 'applications'],
            });

            if (!customer) {
                throw new NotFoundException({
                    result_code: ErrorStatus.CUSTOMER_NOT_FOUND,
                    error: this.commonService.createLocaleErrorMessage(locale, 'crm_customer_not_found'),
                });
            }

            return {
                id: customer.id || null,
                external_id: customer.external_id || null,
                email: customer.email || null,
                name: customer.name || null,
                surname: customer.surname || null,
                gender: customer.gender || null,
                age: customer.age || null,
                os: customer.os || null,
                language: customer.language || null,
                phone: customer.phone || null,
                birth: customer.birth || null,
                address: customer.address || null,
                note: customer.note || null,
                city: customer.city || null,
                state: customer.state || null,
                zip_code: customer.zip_code || null,
                country: customer.country || null,
                skin_color: customer.skinColorGroup?.code || null,
                ethnicity: customer.ethnicity || null,
                notes: customer.notes || null,
                push_token: customer.push_token || null,
                app_id: customer.app_id || null,
                company_id: customer.company_id || null,
                consultant_id: customer.consultant_id || null,
                skin_color_group_id: customer.skin_color_group_id || null,
                ethnicity_id: customer.ethnicity_id || null,
                sign_in_count: customer.sign_in_count || null,
                image_url: customer.image_url || null,
                app_name: customer.applications?.name || null,
            };
        } catch (e) {
            throw e;
        }
    }
}
