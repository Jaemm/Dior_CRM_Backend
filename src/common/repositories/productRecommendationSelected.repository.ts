import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ProductRecommendationSelecteds } from '../entities/crmEntities';

@Injectable()
export class ProductRecommendationSelectedRepository extends Repository<ProductRecommendationSelecteds> {
    constructor(dataSource: DataSource) {
        super(ProductRecommendationSelecteds, dataSource.createEntityManager());
    }
}
