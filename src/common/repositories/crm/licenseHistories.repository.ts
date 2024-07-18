import { Injectable } from '@nestjs/common';
import { DataSource, Repository, FindOptionsSelect } from 'typeorm';
import { LicenseHistories } from '@/src/common/entities/crmEntities';

@Injectable()
export class LicenseHistoriesRepository extends Repository<LicenseHistories> {
    constructor(dataSource: DataSource) {
        super(LicenseHistories, dataSource.createEntityManager());
    }

    async findLicenceHistories(conditions?: any, order?: any, selections?: string[], includes?: string[]) {
        const licence = await this.find({
            where: conditions,
            select: selections as FindOptionsSelect<LicenseHistories>,
            relations: includes,
            order: order,
        });
        return licence;
    }

    async findLicenceHistory(conditions?: any, order?: any, selections?: string[], includes?: string[]) {
        const licence = await this.findOne({
            where: conditions,
            select: selections as FindOptionsSelect<LicenseHistories>,
            relations: includes,
            order: order,
        });
        return licence;
    }
}
