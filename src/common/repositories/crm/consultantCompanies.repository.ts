import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ConsultantCompanies } from '@/src/common/entities/crmEntities';

@Injectable()
export class ConsultantCompaniesRepository extends Repository<ConsultantCompanies> {
    constructor(dataSource: DataSource) {
        super(ConsultantCompanies, dataSource.createEntityManager());
    }
}
