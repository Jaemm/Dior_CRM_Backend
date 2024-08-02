import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Presign } from '@/src/common/entities/crmEntities';

@Injectable()
export class PresignRepository extends Repository<Presign> {
    constructor(dataSource: DataSource) {
        super(Presign, dataSource.createEntityManager());
    }
}
