import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ProductAttributes } from '../entities/crmEntities';

@Injectable()
export class ProductAttributesRepository extends Repository<ProductAttributes> {
    constructor(dataSource: DataSource) {
        super(ProductAttributes, dataSource.createEntityManager());
    }

    async getTranslationsByType(type: string, value: string) {
        const attribute = await this.findOne({
            where: {
                typ: type,
                value,
            },
            relations: ['productAttributeTranslations'],
        });
        return attribute
            ? attribute.productAttributeTranslations.map((translation) => ({
                  id: translation.id,
                  field_name: translation.fieldName,
                  language: translation.language,
                  value: translation.value,
              }))
            : [];
    }
}
