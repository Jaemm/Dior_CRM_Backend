import {
    ProductAttributesRepository,
    ProductRecommendationRepository,
    ProductRecommendationSelectedRepository,
} from '@/src/common/repositories/crm';
import { Injectable } from '@nestjs/common';
import { GetRecommendationSelectedDto, SelectProductsDto } from './productRecommendtionSelected.dto';
import { ProductTranslations } from '@/src/common/entities/crmEntities';

@Injectable()
export class ProductRecommendationSelectedsService {
    constructor(
        private readonly productAttributesRepository: ProductAttributesRepository,
        private readonly prSelectedRepository: ProductRecommendationSelectedRepository,
        private readonly productRecommendationRepository: ProductRecommendationRepository,
    ) {}

    async getProductRecommendationSelecteds(query: GetRecommendationSelectedDto) {
        try {
            const { customer_id, batch_id } = query;

            const prsQuery = this.prSelectedRepository
                .createQueryBuilder('prSelected')
                .where('prSelected.customer_id = :customerId', { customerId: Number(customer_id) })
                .orderBy('order_number')
                .leftJoinAndSelect('prSelected.productRecommendation', 'productRecommendation')
                .leftJoinAndSelect(
                    ProductTranslations,
                    'productTranslations',
                    'CAST(productTranslations.product_recommendation_id AS bigint) = productRecommendation.id',
                );

            if (customer_id && batch_id) {
                prsQuery.andWhere('prSelected.batch_id = :batchId', { batchId: batch_id });
            } else if (customer_id && !batch_id) {
                prsQuery.andWhere('prSelected.batch_id IS NULL');
            }

            const productRecommendationSelecteds = await prsQuery.getMany();

            const data = productRecommendationSelecteds.map(async (productRecommendationSelected) => {
                const product = productRecommendationSelected.productRecommendation;

                if (!product) {
                    return null;
                }

                let recommendedProduct = product;
                if (product && product.productRecommendationId) {
                    // Fetch the recommended product if productRecommendationId is present
                    recommendedProduct = await this.productRecommendationRepository.findOne({
                        where: {
                            id: String(product.productRecommendationId),
                        },
                        relations: ['productTranslations'],
                    });
                }

                const productInfo = {
                    id: product.id,
                    product_type: product.productType,
                    description: product.description,
                    link: product.link,
                    image_url: product.imageUrl,
                    code: product.code,
                    routine: product.routine,
                    collection: product.collection,
                    category: product.category,
                    countries: product.countries,
                    product_recommendation_id: product.productRecommendationId,
                    is_principal: productRecommendationSelected.isPrincipal,
                    name: recommendedProduct?.name,
                    shades: recommendedProduct?.shades,
                    product_translations: recommendedProduct?.productTranslations?.map((translation) => ({
                        id: translation.id,
                        field_name: translation.fieldName,
                        language: translation.language,
                        value: translation.value,
                        attribute_name: null,
                        collection_name: null,
                    })),
                    category_translations: await this.productAttributesRepository.getTranslationsByType(
                        'Category',
                        recommendedProduct.category,
                    ),
                    collection_translations: await this.productAttributesRepository.getTranslationsByType(
                        'Collection',
                        recommendedProduct.category,
                    ),
                    batch_id: productRecommendationSelected?.batchId,
                    customer_id: productRecommendationSelected?.customerId,
                };

                return productInfo;
            });

            return {
                data: (await Promise.all(data)).filter(Boolean),
            };
        } catch (e) {
            throw e;
        }
    }

    async selectProducts(body: SelectProductsDto) {
        const { batch_id, customer_id, products_selected } = body;
        try {
            const prevProductSelected = await this.prSelectedRepository.find({
                where: {
                    batchId: batch_id,
                    customerId: customer_id,
                },
            });

            const deleteList = prevProductSelected.map((prev) => this.prSelectedRepository.delete(prev));
            await Promise.all(deleteList);

            const newSelectedList = products_selected.map(async (pid, i) => {
                const newSelect = this.prSelectedRepository.create({
                    batchId: batch_id,
                    customerId: customer_id,
                    productRecommendationId: pid,
                    orderNumber: i + 1,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });

                await this.prSelectedRepository.save(newSelect);
            });

            await Promise.all(newSelectedList);

            return {
                message: 'Saved selected products',
            };
        } catch (e) {
            throw e;
        }
    }
}
