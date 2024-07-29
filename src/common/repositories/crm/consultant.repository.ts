import { Injectable } from '@nestjs/common';
import { DataSource, Repository, Or, Equal, FindOptionsSelectByString } from 'typeorm';
import { Consultants } from '@/src/common/entities/crmEntities';
import * as argon2 from 'argon2';

@Injectable()
export class ConsultantsRepository extends Repository<Consultants> {
    constructor(dataSource: DataSource) {
        super(Consultants, dataSource.createEntityManager());
    }

    async getConsultantEmailAndAppId(email: string, app_id?: string) {
        const query = this.createQueryBuilder('consultants')
            .leftJoinAndSelect('consultants.products', 'products')
            .leftJoinAndSelect('products.device', 'devices')
            .leftJoinAndSelect('products.application', 'applications')
            .leftJoinAndSelect('consultants.consultant_licenses', 'consultantLicenses')
            .leftJoinAndSelect('consultantLicenses.licenses', 'license')
            .leftJoinAndSelect('consultants.application', 'application')
            .andWhere('consultants.email = :email', { email: email });

        if (app_id) {
            query.andWhere('consultants.app_id = :appId', { appId: app_id });
        }

        return await query.getOne();
    }

    async getConsultantById(consultantId: number | string, relations?: string[]) {
        const numberedId = Number(consultantId);
        const query: { where: object; relations: any[] } = {
            where: {
                id: numberedId,
            },
            relations: [],
        };

        if (relations) {
            query.relations = relations;
        }

        return await this.findOne(query);
    }

    async fetchConsultants(conditions?: any, selections?: string[], includes?: string[], addFields?: string[]) {
        const consultants: any[] = await this.find({
            where: conditions ? conditions : {},
            select: selections
                ? (selections as FindOptionsSelectByString<Consultants>)
                : ['id', 'email', 'app_id', 'name'],
            relations: includes ? includes : [],
        });

        if (addFields) {
            consultants.forEach((consultant) => {
                addFields.forEach((field) => {
                    if (field === 'country_code') {
                        consultant.country_code = consultant.getContryCode;
                    }

                    if (field === 'optic_number') {
                        consultant.optic_number = consultant.getOpticNumbers;
                    }
                });
            });
        }
        return consultants;
    }

    /** Dior */
    async getDiorConsultantCompanyId() {
        const diorConsultant = await this.findOne({
            select: ['consultant_company_id'],
            where: {
                email: 'dior@chowis.com',
            },
        });

        if (!diorConsultant) {
            return null;
        }

        return diorConsultant.consultant_company_id;
    }

    async getDiorConsultant() {
        const diorConsultant = await this.findOne({
            select: ['id', 'consultant_company_id'],
            where: {
                email: 'dior@chowis.com',
            },
            relations: ['productRecommendations'],
        });

        if (!diorConsultant) {
            return null;
        }

        return diorConsultant;
    }

    /** Consultant */
    async findOneConsultantById(id: number) {
        const consultant = await this.findOne({
            where: { id },
            relations: ['consultant_company', 'country_details', 'consultant_position'],
        });

        return consultant;
    }

    async findConsultant(app_id: number, email: string) {
        const consultant = await this.findOne({
            where: [
                { app_id: app_id, email },
                {
                    app_id: Equal(null),
                    email,
                },
            ],
            relations: [
                'consultant_shop',
                'country_details',
                'consultant_company',
                'consultant_position',
                'products',
                'products.device',
                'products.device.consultant_company',
            ],
        });

        return consultant;
    }

    async updateConsultant(id: number, consultantInput: any) {
        const result = await this.update(id, consultantInput);
        return result;
    }

    async insertConsultant(newConsultant: Consultants) {
        const newCustomer = this.create(newConsultant);
        const result = await this.save(newCustomer);
        return result;
    }

    async createConsultant(newUser: any) {
        const user: any = {
            password_digest: (await argon2.hash(newUser.password)) ?? null,
            email: newUser.email,
            unconfirmed_email: newUser.email,
            app_id: newUser.app_id,
            email_confirmed: newUser.email_confirmed ? newUser.email_confirmed : false,
            rememberCreatedAt: new Date(),
            updated_at: new Date(),
            created_at: new Date(),
        };

        const result: any = await this.insertConsultant(user);
        return result;
    }
}
