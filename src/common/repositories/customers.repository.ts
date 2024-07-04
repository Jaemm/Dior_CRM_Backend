import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Customers } from '../entities/crmEntities';

@Injectable()
export class CustomersRepository extends Repository<Customers> {
    constructor(dataSource: DataSource) {
        super(Customers, dataSource.createEntityManager());
    }
}
