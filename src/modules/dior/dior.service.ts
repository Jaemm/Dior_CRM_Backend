import * as path from 'path';
import { v4 as uuid } from 'uuid';

import { ConsoleLogger, Injectable } from '@nestjs/common';
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common/exceptions';

import { ConsultantsRepository, CustomersRepository, PresignRepository } from '@/src/common/repositories/crm';

import { Request } from 'express';

import { CustomerByConsultantIdDto, CreateCustomerDto, SendWebResultDto } from './dior.dto';
import { ErrorStatus } from '@/src/common/constants/error-status';

import { CommonService } from '@/src/common/common.service';
import { CustomersT } from '@/src/common/types/entities';
import { fileName } from 'typeorm-model-generator/dist/src/NamingStrategy';
import { AwsS3Service } from '@/src/common/awsS3/awsS3.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DiorService {
    constructor(
        private commonService: CommonService,
        private awsS3Service: AwsS3Service,
        private configService: ConfigService,

        private consultantRepository: ConsultantsRepository,
        private customersRepository: CustomersRepository,
        private presignRepository: PresignRepository,
    ) {}

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
                .where('customers.consultant_id = :consultantId', { consultantId })
                .orderBy('customers.id', 'DESC');

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

    async createCustomers(body: CreateCustomerDto): Promise<CustomersT> {
        const { email, consultant_id, name, external_id, surname } = body;

        const existCustomer = await this.customersRepository.findOne({
            where: {
                email: email,
                consultant_id: Number(consultant_id),
                external_id: external_id,
            },
        });

        if (existCustomer) {
            return this.reformatCustomer(existCustomer);
        }

        const currentDate = new Date();
        const newCustomer = this.customersRepository.create({
            email,
            consultant_id: Number(consultant_id),
            name,
            external_id,
            surname,
            created_at: currentDate,
            updated_at: currentDate,
        });

        const savedCustomer = await this.customersRepository.save(newCustomer);

        return this.reformatCustomer(savedCustomer);
    }

    private reformatCustomer(customer: CustomersT): CustomersT {
        return {
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
    }

    async sendWebResult(body: SendWebResultDto, locale = 'en') {
        try {
            const { email, batch_id } = body;

            if (!email || !batch_id) {
                throw new BadRequestException({
                    result_code: ErrorStatus.CUSTOM_ERROR,
                    error: this.commonService.createLocaleErrorMessage(
                        locale,
                        'custom_error',
                        'Batch ID and email is missing!',
                    ),
                });
            }

            await this.commonService.justSendMail(email, 'Dior Skin Analyzer Consultation Results', batch_id);
        } catch (e) {
            throw e;
        }
    }

    async fileUpload(file: Express.Multer.File) {
        try {
            const { originalname, mimetype, buffer } = file;

            const allowdMimeTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'image/jpeg'];

            const isAllowedFileType = allowdMimeTypes.includes(mimetype);

            if (!isAllowedFileType) {
                throw new BadRequestException({
                    result_code: ErrorStatus.INVALID_REQUEST,
                    error: 'file type',
                });
            }

            const hash = uuid();

            const fileExtension = path.extname(originalname);

            const keyForS3 = `${hash}${fileExtension}`;

            const prefix = 'upload';

            const uploadData: any = await this.awsS3Service.uploadFileToS3(buffer, keyForS3, prefix);

            const createFileUrl = (key: string) => {
                const baseUrl = this.configService.get('URL') || 'http://localhost:3100';

                const url = `${baseUrl}/v1/api/dior/file/${key}`;

                return url;
            };

            const downloadUrl = createFileUrl(hash);

            const newPresign = this.presignRepository.create({
                key: hash,
                fileName: originalname,
                fileExtension: fileExtension,
                url: downloadUrl,
                mimeType: mimetype,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            await this.presignRepository.save(newPresign);

            return {
                url: downloadUrl,
            };
        } catch (e) {
            throw e;
        }
    }

    async getFile(hash: string) {
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

            const keyForS3 = `upload/${existFile.key}${existFile.fileExtension}`;

            const s3File = await this.awsS3Service.getImageCloudS3(keyForS3);

            return {
                binary: s3File.Body,
                mimeType: existFile.mimeType,
                fileName: existFile.fileName,
            };
        } catch (e) {
            throw e;
        }
    }
}
