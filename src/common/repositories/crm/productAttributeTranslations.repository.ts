import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ProductAttributeTranslations, ProductTranslations } from '@/src/common/entities/crmEntities';

@Injectable()
export class ProductAttributeTranslationsRepository extends Repository<ProductAttributeTranslations> {
    constructor(dataSource: DataSource) {
        super(ProductAttributeTranslations, dataSource.createEntityManager());
    }
}
