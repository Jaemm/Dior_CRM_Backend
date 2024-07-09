import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ProductAttributeTranslations } from '@/src/common/entities/crmEntities';

@Injectable()
export class ProductAttributeTranslationsRepository extends Repository<ProductAttributeTranslations> {
    constructor(dataSource: DataSource) {
        super(ProductAttributeTranslations, dataSource.createEntityManager());
    }
}
