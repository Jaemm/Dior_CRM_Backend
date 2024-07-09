import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Applications } from '@/src/common/entities/crmEntities';

@Injectable()
export class ApplicationsRepository extends Repository<Applications> {
    constructor(dataSource: DataSource) {
        super(Applications, dataSource.createEntityManager());
    }
}
