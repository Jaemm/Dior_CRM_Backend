import { Injectable } from '@nestjs/common';
import { DataSource, Repository, FindOptionsSelectByString } from 'typeorm';
import { Genders } from '@/src/common/entities/crmEntities';

@Injectable()
export class GendersRepository extends Repository<Genders> {
    constructor(dataSource: DataSource) {
        super(Genders, dataSource.createEntityManager());
    }

    async findOneGender(id: string) {
        const gender = await this.findOne({
            where: {
                id: id,
            },
        });
        return gender;
    }

    async findGender(conditions?: any, selections?: string[], includes?: string[]) {
        const genders = await this.find({
            where: conditions,
            select: selections as FindOptionsSelectByString<Genders>,
            relations: includes,
        });

        return genders.map((item) => ({
            ...item,
            id: Number(item.id),
        }));
    }
}
