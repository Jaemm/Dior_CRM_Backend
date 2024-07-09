import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ConsultantBranches } from '@/src/common/entities/crmEntities';

@Injectable()
export class ConsultnatBranchesRepository extends Repository<ConsultantBranches> {
    constructor(dataSource: DataSource) {
        super(ConsultantBranches, dataSource.createEntityManager());
    }
}
