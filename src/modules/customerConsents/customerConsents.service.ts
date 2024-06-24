import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsSelectByString, Repository } from 'typeorm';
import { ChowisCustomerConsents } from '@/src/common/entities/crmEntities/ChowisCustomerConsents.entity';
import { ConsultantsService } from '../consultants/consultants.service';
import { CustomerConsentsDto } from './customerConsents.dto';
import { CustomersService } from '../customers/customers.service';
import { DiorCustomerConsents } from '@/src/common/entities/crmEntities/DiorCustomerConsents.entity';
import { ErrorStatus } from '@/src/common/constants/error-status';
import { ResponseMessages } from '@/src/common/constants/response-messages';
import { CommonService } from '@/src/common/common.service';

@Injectable()
export class CustomerConsentsService {
    constructor(
        @InjectRepository(ChowisCustomerConsents)
        private readonly customerConsentsRepository: Repository<ChowisCustomerConsents>,
        @InjectRepository(DiorCustomerConsents)
        private readonly diorCustomerConsentsRepository: Repository<DiorCustomerConsents>,

        private readonly consultantsService: ConsultantsService,
        private readonly customersService: CustomersService,
        private readonly commonService: CommonService,
    ) {}

    async findOneCustomerConsents(id: string) {
        const customerconsents = await this.customerConsentsRepository.findOne({
            where: {
                id: id,
            },
        });
        if (!customerconsents) {
            this.commonService.throwNotFoundError();
        }
        return customerconsents;
    }

    async insertCustomerConsents(customerConsents: ChowisCustomerConsents) {
        const newCustomerConsents = this.customerConsentsRepository.create(customerConsents);
        return await this.customerConsentsRepository.save(newCustomerConsents);
    }

    async updateConsent(id: string, customerConsents: ChowisCustomerConsents) {
        const updatedConsent = this.customerConsentsRepository.update(Number(id), customerConsents);
        return updatedConsent;
    }

    async findCustomerConsents(conditions?: any, selections?: string[], includes?: string[]) {
        const customerconsents = await this.customerConsentsRepository.find({
            where: conditions,
            select: selections ? (selections as FindOptionsSelectByString<ChowisCustomerConsents>) : [],
            relations: includes,
        });
        if (!customerconsents) {
            this.commonService.throwNotFoundError();
        }
        return customerconsents;
    }

    async createCustomerConsentsForConsultant(customerConsents: CustomerConsentsDto) {
        const { customer_id, consultant_id } = customerConsents;

        const [customer, consultant] = await Promise.all([
            this.customersService.getCustomer({ id: customer_id }),
            this.consultantsService.findOneConsultant(Number(consultant_id)),
        ]);

        if (!customer) {
            throw new NotFoundException({
                result_code: ErrorStatus.CUSTOMER_NOT_FOUND,
                error: ResponseMessages.CustomerNotFound,
            });
        }
        if (!consultant) {
            this.commonService.throwNotFoundError();
        }

        const consentsInput: any = {
            customer_id: Number(customer_id),
            consultant_id: Number(consultant_id),
            createdAt: new Date(),
            updatedAt: new Date(),
            consentFormAnswers: [customerConsents.consent_form_answers],
            dataTransfer: customerConsents.data_transfer,
            dataPrivacy: customerConsents.data_privacy,
            receiveLicenseNotification: customerConsents.receive_license_notification,
            receiveNewsletter: customerConsents.receive_newsletter,
            additionalInformation: customerConsents.additional_information,
            consentType: customerConsents.consent_type,
        };

        const newConsent = await this.insertCustomerConsents(consentsInput);

        if (!newConsent) {
            return { message: 'Something went wrong!' };
        }

        return { message: 'Success!' };
    }

    async updateCustomerConsentsForConsultant(id: string, customerConsents: CustomerConsentsDto) {
        if (!id) {
            throw new BadRequestException({
                result_code: ErrorStatus.BAD_REQUEST,
                error: ResponseMessages.IdRequired,
            });
        }
        const { customer_id, consultant_id } = customerConsents;

        const [customer, consultant] = await Promise.all([
            this.customersService.getCustomer({ id: customer_id }),
            this.consultantsService.findOneConsultant(Number(consultant_id)),
        ]);

        if (!customer) {
            throw new NotFoundException({
                result_code: ErrorStatus.CUSTOMER_NOT_FOUND,
                error: ResponseMessages.CustomerNotFound,
            });
        }
        if (!consultant) {
            this.commonService.throwNotFoundError();
        }

        const consentsInput: any = {
            customer_id: Number(customer_id),
            consultant_id: Number(consultant_id),
            createdAt: new Date(),
            updatedAt: new Date(),
            consentFormAnswers: [customerConsents.consent_form_answers],
            dataTransfer: customerConsents.data_transfer,
            dataPrivacy: customerConsents.data_privacy,
            receiveLicenseNotification: customerConsents.receive_license_notification,
            receiveNewsletter: customerConsents.receive_newsletter,
            additionalInformation: customerConsents.additional_information,
            consentType: customerConsents.consent_type,
        };

        const updatedConsent = await this.updateConsent(id, consentsInput);

        if (!updatedConsent.affected) {
            return { message: 'Something went wrong!' };
        }

        return { message: 'Success!' };
    }

    async createCustomerConsents(customerConsents: CustomerConsentsDto) {
        const { customer_id, consultant_id } = customerConsents;

        const customer = await this.customersService.getCustomer({ id: Number(customer_id) });

        if (!customer) {
            throw new NotFoundException({
                result_code: ErrorStatus.CUSTOMER_NOT_FOUND,
                error: ResponseMessages.CustomerNotFound,
            });
        }

        if (consultant_id) {
            const consultant = await this.consultantsService.findOneConsultant(Number(consultant_id));

            // consultant_id = null;
            // if (!consultant) {
            //     this.commonService.throwNotFoundError();
            // }
        }

        const consentsInput: any = {
            customer_id: Number(customer_id),
            consultant_id: consultant_id ? Number(consultant_id) : null,
            createdAt: new Date(),
            updatedAt: new Date(),
            consentFormAnswers: [customerConsents.consent_form_answers],
            dataTransfer: customerConsents.data_transfer,
            dataPrivacy: customerConsents.data_privacy,
            receiveLicenseNotification: customerConsents.receive_license_notification,
            receiveNewsletter: customerConsents.receive_newsletter,
            additionalInformation: customerConsents.additional_information,
            consentType: customerConsents.consent_type,
        };

        const newConsent = await this.insertCustomerConsents(consentsInput);

        if (!newConsent) {
            return { message: 'Something went wrong!' };
        }

        return { message: 'Success!' };
    }

    async updateCustomerConsents(id: string, customerConsents: CustomerConsentsDto) {
        if (!id) {
            throw new BadRequestException({
                result_code: ErrorStatus.BAD_REQUEST,
                error: ResponseMessages.IdRequired,
            });
        }
        const { customer_id, consultant_id } = customerConsents;

        const customer = await this.customersService.getCustomer({ id: customer_id });
        if (!customer) {
            throw new NotFoundException({
                result_code: ErrorStatus.CUSTOMER_NOT_FOUND,
                error: ResponseMessages.CustomerNotFound,
            });
        }

        if (consultant_id) {
            const consultant = await this.consultantsService.findOneConsultant(Number(consultant_id));

            if (!consultant) {
                this.commonService.throwNotFoundError();
            }
        }

        const consentsInput: any = {
            customer_id: Number(customer_id),
            consultant_id: consultant_id ? Number(consultant_id) : null,
            createdAt: new Date(),
            updatedAt: new Date(),
            consentFormAnswers: [customerConsents.consent_form_answers],
            dataTransfer: customerConsents.data_transfer,
            dataPrivacy: customerConsents.data_privacy,
            receiveLicenseNotification: customerConsents.receive_license_notification,
            receiveNewsletter: customerConsents.receive_newsletter,
            additionalInformation: customerConsents.additional_information,
            consentType: customerConsents.consent_type,
        };

        const updatedConsent = await this.updateConsent(id, consentsInput);

        if (!updatedConsent) {
            return { message: 'Something went wrong!' };
        }

        return { message: 'Success!' };
    }

    async createDiorCustomerConsent(data: any) {
        const consent = await this.diorCustomerConsentsRepository.save(data);
        return consent;
    }
}
