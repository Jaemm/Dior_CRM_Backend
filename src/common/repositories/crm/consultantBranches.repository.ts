import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ConsultantBranches } from '@/src/common/entities/crmEntities';

@Injectable()
export class ConsultantBranchesRepository extends Repository<ConsultantBranches> {
    constructor(dataSource: DataSource) {
        super(ConsultantBranches, dataSource.createEntityManager());
    }

    async findOneconsultantBranches(id: string) {
        const consultantbranches = await this.findOne({
            where: {
                id: id,
            },
        });
        return consultantbranches;
    }
}
