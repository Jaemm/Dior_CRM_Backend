import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ConsultantStores } from '@/src/common/entities/crmEntities';

@Injectable()
export class ConsultantStoresRepository extends Repository<ConsultantStores> {
    constructor(dataSource: DataSource) {
        super(ConsultantStores, dataSource.createEntityManager());
    }
}
