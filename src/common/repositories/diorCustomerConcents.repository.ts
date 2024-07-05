import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { DiorCustomerConsents } from '../entities/crmEntities';

@Injectable()
export class DiorCustomerConsentsRepository extends Repository<DiorCustomerConsents> {
    constructor(dataSource: DataSource) {
        super(DiorCustomerConsents, dataSource.createEntityManager());
    }
}
