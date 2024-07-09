import { Injectable } from '@nestjs/common';
import { DataSource, Repository, ILike } from 'typeorm';
import { ProductRecommendationGroups, ProductTranslations } from '@/src/common/entities/crmEntities';

@Injectable()
export class ProductRecommendationGroupsRepository extends Repository<ProductRecommendationGroups> {
    constructor(dataSource: DataSource) {
        super(ProductRecommendationGroups, dataSource.createEntityManager());
    }

    async getGroupByNameAndRoutine(routine: number, name: string): Promise<ProductRecommendationGroups> {
        const searchName = `%${name}%`;

        const group = await this.createQueryBuilder('groups')
            .where('groups.name ILIKE :name AND groups.routine = :routine', { name: searchName, routine: routine })
            .leftJoinAndSelect('groups.prSelecteds', 'prSelecteds')
            .leftJoinAndSelect('prSelecteds.productRecommendation', 'productRecommendation')
            .leftJoinAndSelect('productRecommendation.productVariants', 'productVariants')
            .getOne();

        return group;
    }
}
