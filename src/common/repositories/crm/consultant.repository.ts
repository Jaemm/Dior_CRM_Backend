import { Injectable } from '@nestjs/common';
import { DataSource, Repository, Or, Equal, FindOptionsSelectByString } from 'typeorm';
import { Consultants } from '@/src/common/entities/crmEntities';

@Injectable()
export class ConsultantsRepository extends Repository<Consultants> {
    constructor(dataSource: DataSource) {
        super(Consultants, dataSource.createEntityManager());
    }

    async getConsultantById(consultantId: number, relations?: string[]) {
        const query: { where: object; relations: any[] } = {
            where: {
                id: consultantId,
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
            where: { app_id: Or(Equal(app_id), null), email },
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
}
