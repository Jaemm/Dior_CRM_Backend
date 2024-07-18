import { Injectable } from '@nestjs/common';
import { GetProductAttributesDto } from './productAttributes.dto';
import { ConsultantsRepository, ProductAttributesRepository } from '@/src/common/repositories/crm';
import { ProductAttributesForDiorT } from '@/src/common/types/entities/product_attributes.type';
import { ProductAttributes } from '@/src/common/entities/crmEntities';
import { ProductAttributeTranslationsForDiorT } from '@/src/common/types/entities';

@Injectable()
export class DiorProductAttributesService {
    constructor(
        private readonly consultantsRepository: ConsultantsRepository,
        private readonly productAttributesRepository: ProductAttributesRepository,
    ) {}

    async getProductAttributes(query: GetProductAttributesDto) {
        try {
            const { search, page, per } = query;
            const diorCompanyId = await this.consultantsRepository.getDiorConsultantCompanyId();

            const attributesQuery = this.productAttributesRepository
                .createQueryBuilder('productAttributes')
                .leftJoinAndSelect('productAttributes.productAttributeTranslations', 'productAttributeTranslations')
                .where('productAttributes.consultantCompanyId = :diorCompanyId', {
                    diorCompanyId,
                });

            if (search) {
                attributesQuery.andWhere('productAttributes.value LIKE :search OR productAttributes.typ LIKE :search', {
                    search: `%${search}%`,
                });
            }

            const searchPage = Number(page || 1);
            const searchPer = Number(per || 10);

            const [productAttributes, totalCount] = await attributesQuery.getManyAndCount();

            const reformatProductAttributeList: ProductAttributesForDiorT[] = productAttributes.map((attributes) => {
                let translations: ProductAttributeTranslationsForDiorT[] = [];

                if (attributes.productAttributeTranslations && attributes.productAttributeTranslations.length > 0) {
                    translations = attributes.productAttributeTranslations.map((translation) => {
                        return {
                            id: Number(translation.id),
                            field_name: translation.fieldName,
                            language: translation.language,
                            value: translation.value,
                        };
                    });
                }

                return {
                    id: Number(attributes.id),
                    typ: attributes.typ,
                    value: attributes.value,
                    product_attribute_translations: translations,
                };
            });

            return {
                data: reformatProductAttributeList,
                current_page_size: reformatProductAttributeList.length,
                current_page: searchPage,
                total_pages: Math.ceil(totalCount / searchPer),
            };
        } catch (e) {
            throw e;
        }
    }
}
