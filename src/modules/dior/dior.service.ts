import { Injectable } from '@nestjs/common';

import {
    NotFoundException,
    BadRequestException,
    ConflictException,
    UnauthorizedException,
} from '@nestjs/common/exceptions';

import {
    ConsultantsRepository,
    ConsultantCountriesRepository,
    ConsultantBranchesRepository,
    CustomersRepository,
    ProductAttributesRepository,
    ProductRecommendationRepository,
    ProductRecommendationSelectedRepository,
    ProductRecommendationGroupsRepository,
    ProductAttributeTranslationsRepository,
    ProductTranslationsRepository,
    ProductsRepository,
} from '@/src/common/repositories/crm';

import { Request } from 'express';

import { CustomerByConsultantIdDto, createCustomerDto } from './dior.dto';
import { ErrorStatus } from '@/src/common/constants/error-status';
import { ProductTranslations } from '@/src/common/entities/crmEntities';
import { CommonService } from '@/src/common/common.service';
import { CustomersT } from '@/src/common/types/entities';

@Injectable()
export class DiorService {
    constructor(
        private commonService: CommonService,

        // Repos
        private consultantRepository: ConsultantsRepository,
        private customersRepository: CustomersRepository,
        private productAttributesRepository: ProductAttributesRepository,
        private productRecommendationRepository: ProductRecommendationRepository,
        private prSelectedRepository: ProductRecommendationSelectedRepository,
    ) {}

    /** Customers */
    async getCustomers(query: CustomerByConsultantIdDto, locale = 'en') {
        try {
            const { consultant_id: consultantId, email } = query;

            const foundConsultant = await this.consultantRepository.getConsultantById(Number(consultantId));

            if (!foundConsultant) {
                throw new NotFoundException({
                    result_code: ErrorStatus.RECORD_NOT_FOUND,
                    errors: this.commonService.createLocaleErrorMessage(locale, 'record_not_found'),
                });
            }

            const customerByConsultantIdQuery = this.customersRepository
                .createQueryBuilder('customers')
                .where('customers.consultant_id = :consultantId', { consultantId });

            if (email) {
                customerByConsultantIdQuery.andWhere('customers.email LIKE :email', { email: `%${email}%` });
            }

            const customersByConsultant = await customerByConsultantIdQuery.getMany();

            const reformatCustomerList: CustomersT[] = customersByConsultant.map((customer) => {
                const reformatCustomer: CustomersT = {
                    id: customer.id,
                    email: customer.email,
                    name: customer.name,
                    surname: customer.surname,
                    os: customer.os,
                    language: customer.language,
                    phone: customer.phone,
                    birth: customer.birth,
                    address: customer.address,
                    city: customer.city,
                    state: customer.state,
                    zip_code: customer.zip_code,
                    country: customer.country,
                    notes: customer.notes,
                    push_token: customer.push_token,
                    app_id: customer.app_id,
                    company_id: customer.company_id,
                    consultant_id: customer.consultant_id,
                    skin_color_group_id: customer.skin_color_group_id,
                    ethnicity_id: customer.ethnicity_id,
                    gender: customer.gender,
                    sign_in_count: customer.sign_in_count,
                    image_url: customer.image_url,
                    external_id: customer.external_id,
                };

                return reformatCustomer;
            });

            return {
                data: reformatCustomerList,
            };
        } catch (e) {
            throw e;
        }
    }

    async createCustomers(body: createCustomerDto) {
        try {
            const { email, consultant_id, name, external_id, surname } = body;

            const existCustomer = await this.customersRepository.find({
                where: {
                    email: email,
                    consultant_id: Number(consultant_id),
                    external_id: external_id,
                },
            });

            if (existCustomer.length > 0) {
                throw new ConflictException({
                    result_code: 409,
                    error: `Data already Exists.`,
                });
            }

            const newCustomer = this.customersRepository.create({
                email: email,
                consultant_id: Number(consultant_id),
                name: name,
                external_id: external_id,
                surname: surname,
                created_at: new Date(),
                updated_at: new Date(),
            });

            const savedCustomer = await this.customersRepository.save(newCustomer);

            const reformatCustomer: CustomersT = {
                id: savedCustomer.id,
                email: savedCustomer.email,
                name: savedCustomer.name,
                surname: savedCustomer.surname,
                os: savedCustomer.os,
                language: savedCustomer.language,
                phone: savedCustomer.phone,
                birth: savedCustomer.birth,
                address: savedCustomer.address,
                city: savedCustomer.city,
                state: savedCustomer.state,
                zip_code: savedCustomer.zip_code,
                country: savedCustomer.country,
                notes: savedCustomer.notes,
                push_token: savedCustomer.push_token,
                app_id: savedCustomer.app_id,
                company_id: savedCustomer.company_id,
                consultant_id: savedCustomer.consultant_id,
                skin_color_group_id: savedCustomer.skin_color_group_id,
                ethnicity_id: savedCustomer.ethnicity_id,
                gender: savedCustomer.gender,
                sign_in_count: savedCustomer.sign_in_count,
                image_url: savedCustomer.image_url,
                external_id: savedCustomer.external_id,
            };

            return reformatCustomer;
        } catch (e) {
            throw e;
        }
    }
}
