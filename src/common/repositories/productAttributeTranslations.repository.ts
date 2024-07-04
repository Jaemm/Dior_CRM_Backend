import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ProductAttributeTranslations } from '../entities/crmEntities';

@Injectable()
export class ProductAttributeTranslationsRepository extends Repository<ProductAttributeTranslations> {
    constructor(dataSource: DataSource) {
        super(ProductAttributeTranslations, dataSource.createEntityManager());
    }
}
