import { Injectable } from '@nestjs/common';
import { DataSource, Repository, FindOptionsSelectByString } from 'typeorm';
import { Countries } from '@/src/common/entities/crmEntities';

@Injectable()
export class CountriesRepository extends Repository<Countries> {
    constructor(dataSource: DataSource) {
        super(Countries, dataSource.createEntityManager());
    }

    async findOneCountryById(id: number) {
        const country = await this.findOne({
            where: {
                id: id,
            },
        });

        return country;
    }

    async findOneCountry(conditions?: any, selections?: string[], includes?: string[]) {
        const country = await this.findOne({
            where: conditions,
            select: selections ? (selections as FindOptionsSelectByString<Countries>) : ['id', 'name'],
            relations: includes,
        });

        return country;
    }

    async findCountry(conditions?: any, selections?: string[], includes?: string[]) {
        const country = await this.find({
            where: conditions,
            select: selections as FindOptionsSelectByString<Countries>,
            relations: includes,
        });

        return country;
    }
}
