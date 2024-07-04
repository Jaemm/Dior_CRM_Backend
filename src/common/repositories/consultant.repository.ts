import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Consultants } from '../entities/crmEntities';

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
            select: ['consultant_company_id'],
            where: {
                email: 'dior@chowis.com',
            },
        });

        if (!diorConsultant) {
            return null;
        }

        return diorConsultant;
    }
}
