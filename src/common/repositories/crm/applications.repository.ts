import { Injectable } from '@nestjs/common';
import { DataSource, Repository, FindOptionsSelect } from 'typeorm';
import { Applications, Consultants, Customers } from '@/src/common/entities/crmEntities';

@Injectable()
export class ApplicationsRepository extends Repository<Applications> {
    constructor(dataSource: DataSource) {
        super(Applications, dataSource.createEntityManager());
    }

    async findByEntitiesAppId(entity: Customers | Consultants) {
        return await this.findOne({
            where: {
                id: entity.app_id,
            },
        });
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
