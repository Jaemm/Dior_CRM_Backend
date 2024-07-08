import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ProductTranslations } from '@/src/common/entities/crmEntities';

@Injectable()
export class ProductTranslationsRepository extends Repository<ProductTranslations> {
    constructor(dataSource: DataSource) {
        super(ProductTranslations, dataSource.createEntityManager());
    }
}
