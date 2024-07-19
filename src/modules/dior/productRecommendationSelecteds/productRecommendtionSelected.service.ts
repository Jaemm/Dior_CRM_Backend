import { ProductTranslations } from '@/src/common/entities/crmEntities';
import {
    ProductAttributeTranslationsRepository,
    ProductAttributesRepository,
    ProductRecommendationRepository,
    ProductRecommendationSelectedRepository,
    ProductTranslationsRepository,
} from '@/src/common/repositories/crm';
import { ProductRecommendationForDiorT, ProductRecommendationVariantForDiorT } from '@/src/common/types/entities';
import { ProductTranslationForDiorT } from '@/src/common/types/entities/product_translations.type';
import { Injectable } from '@nestjs/common';
import { Not } from 'typeorm';
import {
    GetListOfRecommendationListDto,
    GetRecommendationSelectedDto,
    SelectProductsDto,
} from './productRecommendtionSelected.dto';

@Injectable()
export class ProductRecommendationSelectedsService {
    constructor(
        private readonly productAttributesRepository: ProductAttributesRepository,
        private readonly productAttributeTranslationsRepository: ProductAttributeTranslationsRepository,
        private readonly prSelectedRepository: ProductRecommendationSelectedRepository,
        private readonly productRecommendationRepository: ProductRecommendationRepository,
        private readonly productTranslationsRepository: ProductTranslationsRepository,
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

    async getListOfRecommendationSelected(query: GetListOfRecommendationListDto) {
        try {
            const { start_date, end_date, page, per } = query;
            const selectedQuery = await this.prSelectedRepository.createQueryBuilder('recommendedSelected');

            if (start_date && end_date) {
                selectedQuery.andWhere(
                    `recommendedSelected.created_at BETWEEN ${start_date} 00:00:00 AND ${end_date} 23:59:59`,
                );
            }

            const recommendatedSelected = await selectedQuery.getMany();

            const productSelectedGrouped = recommendatedSelected.reduce((acc, curr) => {
                acc[curr.productRecommendationId] = (acc[curr.productRecommendationId] || 0) + 1;
                return acc;
            }, {} as Record<number, number>);

            const searchPage = Number(page || 1);
            const searchPer = Number(per || 10);

            const productIds = Object.keys(productSelectedGrouped).map(Number).filter(Boolean);

            const [productRecommendations, totalCount] = await this.productRecommendationRepository
                .createQueryBuilder('prdouctRecommendation')
                .leftJoinAndSelect('prdouctRecommendation.productVariants', 'productVariants')
                .where('prdouctRecommendation.id IN (:...productIds)', {
                    productIds: productIds,
                })
                .andWhere('prdouctRecommendation.recommendationCount > 0')
                .orderBy('prdouctRecommendation.recommendationCount', 'DESC')
                .skip((searchPage - 1) * searchPer)
                .take(searchPer)
                .getManyAndCount();

            const promiseReformat: Promise<ProductRecommendationForDiorT>[] = productRecommendations.map(
                async (recommendation) => {
                    let refRecommendation;
                    let name: string | null = null;
                    let shades: string | null = null;
                    let collectionShades: string[] | null = [];
                    let productTranslations: ProductTranslationForDiorT[] = [];
                    let categoryTranslations: any[] = [];
                    let collectionTranslations: any[] = [];
                    let productVariants: ProductRecommendationVariantForDiorT[] = [];
                    if (recommendation.productRecommendationId) {
                        refRecommendation = await this.productRecommendationRepository.findOne({
                            where: {
                                id: String(recommendation.productRecommendationId),
                            },
                        });
                        name = refRecommendation.name;
                    } else {
                        name = recommendation.name;
                    }

                    if (recommendation.productVariants.length > 0) {
                        shades = 'Select Shade';
                    } else {
                        shades = recommendation.shades;
                    }

                    // collection shades
                    const recommShadeList = await this.productRecommendationRepository.find({
                        select: ['shades'],
                        where: {
                            collection: recommendation.collection,
                            shades: Not(null),
                        },
                    });
                    collectionShades = recommShadeList.map((recomm) => recomm.shades);
                    // collection_shades END

                    // product translations START
                    if (refRecommendation || recommendation) {
                        const oneOfRecomm = refRecommendation || recommendation;

                        const translations = await this.productTranslationsRepository.findBy({
                            productRecommendationId: oneOfRecomm.id,
                        });

                        const promiseTranslations = translations.map(async (t) => {
                            const recomm = await this.productRecommendationRepository.findOneBy({
                                id: t.productRecommendationId,
                            });

                            const category = recomm.category;
                            const collection = recomm.collection;

                            const categoryAttribute = await this.productAttributesRepository.findOneBy({
                                value: category,
                            });

                            const collectionAttribute = await this.productAttributesRepository.findOneBy({
                                value: collection,
                            });

                            const attributeName = categoryAttribute
                                ? (
                                      await this.productAttributeTranslationsRepository.findOne({
                                          where: {
                                              productAttributeId: Number(categoryAttribute.id),
                                              language: t.language,
                                          },
                                      })
                                  )?.value
                                : null;
                            const collectionName = collectionAttribute
                                ? (
                                      await this.productAttributeTranslationsRepository.findOne({
                                          where: {
                                              productAttributeId: Number(collectionAttribute.id),
                                              language: t.language,
                                          },
                                      })
                                  )?.value
                                : null;

                            return {
                                id: Number(t.id),
                                field_name: t.fieldName,
                                language: t.language,
                                value: t.value,
                                attribute_name: attributeName,
                                collection_name: collectionName,
                            };
                        });

                        productTranslations = await Promise.all(promiseTranslations);
                    }
                    // product translations END

                    categoryTranslations = (
                        await this.productAttributesRepository.findOne({
                            where: {
                                typ: 'Category',
                                value: recommendation.category,
                            },
                            relations: ['productAttributeTranslations'],
                        })
                    ).productAttributeTranslations.map((t) => {
                        return {
                            id: Number(t.id),
                            field_name: t.fieldName,
                            language: t.language,
                            value: t.value,
                        };
                    });

                    collectionTranslations = (
                        await this.productAttributesRepository.findOne({
                            where: {
                                typ: 'Collection',
                                value: recommendation.category,
                            },
                            relations: ['productAttributeTranslations'],
                        })
                    )?.productAttributeTranslations.map((t) => {
                        return {
                            id: Number(t.id),
                            field_name: t.fieldName,
                            language: t.language,
                            value: t.value,
                        };
                    });

                    productVariants = recommendation.productVariants
                        ? recommendation.productVariants.map((variants) => {
                              return {
                                  id: Number(variants.id),
                                  name: variants.name,
                                  product_type: variants.productType,
                                  description: variants.description,
                                  link: variants.link,
                                  image_url: variants.imageUrl,
                                  code: variants.code,
                                  routine: variants.routine,
                                  collection: variants.collection,
                                  category: variants.category,
                                  countries: variants.countries,
                                  product_recommendation_id: variants.productRecommendationId,
                                  shades: variants.shades,
                              };
                          })
                        : [];

                    return {
                        id: Number(recommendation.id),
                        product_type: recommendation.productType,
                        description: recommendation.description,
                        link: recommendation.link,
                        image_url: recommendation.imageUrl,
                        code: recommendation.code,
                        routine: recommendation.routine,
                        collection: recommendation.collection,
                        category: recommendation.category,
                        countries: recommendation.countries,
                        product_recommendation_id: recommendation.productRecommendationId,
                        name: name,
                        shades: shades,
                        collection_shades: collectionShades,
                        product_translations: productTranslations,
                        category_translations: categoryTranslations,
                        collection_translations: collectionTranslations,
                        product_variants: productVariants,
                    };
                },
            );

            const data = await Promise.all(promiseReformat);

            return {
                data: data,
                total_size: totalCount,
                current_page_size: data.length,
                current_page: searchPage,
                total_pages: Math.ceil(totalCount / searchPer),
            };
        } catch (e) {
            throw e;
        }
    }
}
