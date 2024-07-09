import { Injectable } from '@nestjs/common';
import { DataSource, Repository, Or, Equal } from 'typeorm';
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
