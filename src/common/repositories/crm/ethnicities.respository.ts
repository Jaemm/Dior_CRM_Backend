import { Injectable } from '@nestjs/common';
import { DataSource, Repository, FindOptionsSelectByString } from 'typeorm';
import { Ethnicities } from '@/src/common/entities/crmEntities';

@Injectable()
export class EthnicitiesRepository extends Repository<Ethnicities> {
    constructor(dataSource: DataSource) {
        super(Ethnicities, dataSource.createEntityManager());
    }

    async findOneEthinicities(id: string) {
        const ethinicity = await this.findOne({
            where: {
                id: id,
            },
        });
        return ethinicity;
    }

    async findEthinicities(conditions?: any, selections?: string[], includes?: string[]) {
        const ethinicity = await this.find({
            where: conditions,
            select: selections ? (selections as FindOptionsSelectByString<Ethnicities>) : [],
            relations: includes,
        });
        return ethinicity.map((item) => ({
            ...item,
            id: Number(item.id),
        }));
    }
}
