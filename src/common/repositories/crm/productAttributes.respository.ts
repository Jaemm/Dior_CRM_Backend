import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ProductAttributes } from '@/src/common/entities/crmEntities';
import { AttributeRoutine } from '@/src/modules/dior/dior.dto';

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

    async findAndOrderByValue(alias: string, queryBuilderCondtion: string, value?: AttributeRoutine) {
        const query = this.createQueryBuilder(alias)
            .andWhere(queryBuilderCondtion)
            .leftJoinAndSelect(`${alias}.productAttributeTranslations`, 'productAttributeTranslations');

        if (value === 'Makeup') {
            query.orderBy(
                `
                CASE
                    WHEN ${alias}.value = 'Forever' THEN 1
                    WHEN ${alias}.value = 'Backstage' THEN 2
                    WHEN ${alias}.value = 'Dior Prestige' THEN 3
                    WHEN ${alias}.value = 'Capture Totale' THEN 4
                    WHEN ${alias}.value = 'DreamSkin' THEN 5
                    WHEN ${alias}.value = 'Diorsnow' THEN 6
                    ELSE 7
                END`,
                'ASC',
            );
        } else if (value === 'Skincare') {
            query.orderBy(
                `
                CASE
                    WHEN ${alias}.value = 'Dior Prestige' THEN 1
                    WHEN ${alias}.value = 'Dior Prestige Light in White' THEN 2
                    WHEN ${alias}.value = 'Capture Totale' THEN 3
                    WHEN ${alias}.value = 'L''Or de vie' THEN 4
                    WHEN ${alias}.value = 'Dior Cleansers' THEN 5
                    WHEN ${alias}.value = 'Capture Youth' THEN 6
                    WHEN ${alias}.value = 'One Essential' THEN 7
                    WHEN ${alias}.value = 'DreamSkin' THEN 8
                    WHEN ${alias}.value = 'Diorsnow' THEN 9
                    WHEN ${alias}.value = 'Hydra Life' THEN 10
                    WHEN ${alias}.value = 'Dior Solar' THEN 11
                    WHEN ${alias}.value = 'Dior Homme Dermo System' THEN 12
                    ELSE 13
                END`,
                'ASC',
            );
        }

        return await query.getMany();
    }
}
