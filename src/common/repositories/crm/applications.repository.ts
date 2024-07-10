import { Injectable } from '@nestjs/common';
import { DataSource, Repository, FindOptionsSelect } from 'typeorm';
import { Applications } from '@/src/common/entities/crmEntities';

@Injectable()
export class ApplicationsRepository extends Repository<Applications> {
    constructor(dataSource: DataSource) {
        super(Applications, dataSource.createEntityManager());
    }

    async findOneApplication(id: number) {
        const application = await this.findOne({
            where: {
                id: id,
            },
        });
        return application;
    }

    async findApplications(conditions?: any, selections?: string[], includes?: string[]) {
        const application = await this.find({
            where: conditions,
            select: selections ? (selections as FindOptionsSelect<Applications>) : [],
            relations: includes,
        });
        return application;
    }
}
