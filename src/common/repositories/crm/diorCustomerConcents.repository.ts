import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { DiorCustomerConsents } from '@/src/common/entities/crmEntities';

@Injectable()
export class DiorCustomerConsentsRepository extends Repository<DiorCustomerConsents> {
    constructor(dataSource: DataSource) {
        super(DiorCustomerConsents, dataSource.createEntityManager());
    }
}
