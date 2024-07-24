import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { PasswordEmailDetails } from '@/src/common/entities/crmEntities';

@Injectable()
export class PasswordEmailDetailsRepository extends Repository<PasswordEmailDetails> {
    constructor(dataSource: DataSource) {
        super(PasswordEmailDetails, dataSource.createEntityManager());
    }
}
