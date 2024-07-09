import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ProductRecommendations } from '@/src/common/entities/crmEntities';

@Injectable()
export class ProductRecommendationRepository extends Repository<ProductRecommendations> {
    constructor(dataSource: DataSource) {
        super(ProductRecommendations, dataSource.createEntityManager());
    }
}
