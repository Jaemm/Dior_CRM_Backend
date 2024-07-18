import { Injectable } from '@nestjs/common';
import { DataSource, Repository, FindOptionsSelectByString } from 'typeorm';
import { Licenses } from '@/src/common/entities/crmEntities';

@Injectable()
export class LicensesRepository extends Repository<Licenses> {
    constructor(dataSource: DataSource) {
        super(Licenses, dataSource.createEntityManager());
    }

    async findOneLicence(id: number) {
        const licence = await this.findOne({
            where: {
                id: id,
            },
        });
        return licence;
    }

    async findLicence(conditions?: any, selections?: string[], includes?: string[]) {
        const country = await this.find({
            where: conditions,
            select: selections as FindOptionsSelectByString<Licenses>,
            relations: includes,
        });
        return country;
    }
}
