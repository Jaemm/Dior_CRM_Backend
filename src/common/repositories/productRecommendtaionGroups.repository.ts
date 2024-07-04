import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ProductRecommendationGroups } from '../entities/crmEntities';

@Injectable()
export class ProductRecommendationGroupsRepository extends Repository<ProductRecommendationGroups> {
    constructor(dataSource: DataSource) {
        super(ProductRecommendationGroups, dataSource.createEntityManager());
    }
}
