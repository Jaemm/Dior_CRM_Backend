import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { SalesConn } from '@/src/common/entities/crmEntities';

@Injectable()
export class SalesConnectionRepository extends Repository<SalesConn> {
    constructor(dataSource: DataSource) {
        super(SalesConn, dataSource.createEntityManager());
    }
}
