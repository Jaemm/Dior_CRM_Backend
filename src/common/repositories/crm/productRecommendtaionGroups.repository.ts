import { Injectable } from '@nestjs/common';
import { DataSource, Repository, ILike } from 'typeorm';
import { ProductRecommendationGroups } from '@/src/common/entities/crmEntities';

@Injectable()
export class ProductRecommendationGroupsRepository extends Repository<ProductRecommendationGroups> {
    constructor(dataSource: DataSource) {
        super(ProductRecommendationGroups, dataSource.createEntityManager());
    }

    getGroupByNameAndRoutine(routine: number, name: string) {
        const group = this.findOne({
            where: {
                name: ILike(`%${name}%`),
                routine: routine,
            },
            relations: ['prSelecteds'],
        });

        return group;
    }
}
