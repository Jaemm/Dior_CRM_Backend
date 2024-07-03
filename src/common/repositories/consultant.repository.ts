import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Consultants } from '../entities/crmEntities';

@Injectable()
export class ConsultantsRepository extends Repository<Consultants> {
    constructor(dataSource: DataSource) {
        super(Consultants, dataSource.createEntityManager());
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
}
