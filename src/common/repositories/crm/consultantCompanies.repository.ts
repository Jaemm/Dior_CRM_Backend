import { Injectable } from '@nestjs/common';
import { DataSource, Repository, FindOptionsSelectByString } from 'typeorm';
import { ConsultantCompanies } from '@/src/common/entities/crmEntities';

@Injectable()
export class ConsultantCompaniesRepository extends Repository<ConsultantCompanies> {
    constructor(dataSource: DataSource) {
        super(ConsultantCompanies, dataSource.createEntityManager());
    }

    async getOneCompany(id: number): Promise<ConsultantCompanies | undefined> {
        const consultant: any = await this.findOne({
            where: { id },
            relations: ['applications'],
        });

        return consultant;
    }

    async getOneCompanyByFilters(conditions?: any, selections?: string[], includes?: string[]) {
        const companies = await this.findOne({
            where: conditions ? conditions : {},
            select: selections ? (selections as FindOptionsSelectByString<ConsultantCompanies>) : [],
            relations: includes ? includes : [],
        });
        return companies;
    }

    async getCompanies(conditions?: any, selections?: string[], includes?: string[]) {
        const companies = await this.find({
            where: conditions ? conditions : {},
            select: selections ? (selections as FindOptionsSelectByString<ConsultantCompanies>) : [],
            relations: includes ? includes : [],
        });
        return companies;
    }
}
