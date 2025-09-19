import { Injectable } from '@nestjs/common';
import { DataSource, Repository, FindOptionsSelectByString } from 'typeorm';
import { ConsultantShops } from '@/src/common/entities/crmEntities';

@Injectable()
export class ConsultantShopsRepository extends Repository<ConsultantShops> {
    constructor(dataSource: DataSource) {
        super(ConsultantShops, dataSource.createEntityManager());
    }

    async findOneConsultantShops(id: any) {
        const consultantshops = await this.findOne({
            where: {
                id: id,
            },
        });
        return consultantshops;
    }

    async findConsultantShops(conditions?: any, selections?: string[], includes?: string[]) {
        const shops = await this.find({
            where: conditions,
            select: selections ? (selections as FindOptionsSelectByString<ConsultantShops>) : [],
            relations: includes,
        });

        return shops;
    }
}
