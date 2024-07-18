import { Injectable } from '@nestjs/common';
import { DataSource, Repository, FindOptionsSelectByString } from 'typeorm';
import { SkinColorGroups } from '@/src/common/entities/crmEntities';

@Injectable()
export class SkinColorGroupsRepository extends Repository<SkinColorGroups> {
    constructor(dataSource: DataSource) {
        super(SkinColorGroups, dataSource.createEntityManager());
    }

    async findOneskinColorGroups(id: string) {
        const skinColorGroup = await this.findOne({
            where: {
                id: id,
            },
        });

        return skinColorGroup;
    }

    async findSkinColorGroups(conditions?: any, selections?: string[], includes?: string[]) {
        const skinColorGroup = await this.find({
            where: conditions,
            select: selections ? (selections as FindOptionsSelectByString<SkinColorGroups>) : [],
            relations: includes,
        });

        return skinColorGroup.map((item) => ({
            ...item,
            id: Number(item.id),
        }));
    }
}
