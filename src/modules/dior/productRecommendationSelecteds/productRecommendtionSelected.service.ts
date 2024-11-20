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
import { Equal, Not } from 'typeorm';
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

            // const prsQuery = this.prSelectedRepository
            //     .createQueryBuilder('prSelected')
            //     .where('prSelected.customer_id = :customerId', { customerId: Number(customer_id) })
            //     .orderBy('order_number')
            //     .leftJoinAndSelect('prSelected.productRecommendation', 'productRecommendation');

            console.log(customer_id, customer_id !== null);
            const prsQuery = this.prSelectedRepository
                .createQueryBuilder('prSelected')
                .where('prSelected.batch_id = :batchId', { batchId: batch_id })
                .andWhere(
                    `DATE(prSelected.createdAt) = (
                    SELECT DATE(p.created_at)
                    FROM product_recommendation_selecteds p
                    WHERE p.batch_id = :batchId
                    ORDER by p.id DESC
                    LIMIT 1
                )`,
                )
                .orderBy('order_number')
                .leftJoinAndSelect('prSelected.productRecommendation', 'productRecommendation');

            // if (customer_id || customer_id !== null || customer_id !== 'null') {
            //     prsQuery.andWhere('prSelected.customer_id = :customerId', { customerId: Number(customer_id) });
            // }
            // if (batch_id) {
            //     prsQuery.andWhere('prSelected.batch_id = :batchId', { batchId: batch_id });
            // } else
            if (customer_id && !batch_id) {
                prsQuery.andWhere('prSelected.batch_id IS NULL');
            }

            prsQuery.orderBy('prSelected.order_number', 'ASC');
            const productRecommendationSelecteds = await prsQuery.getMany();

            const data = productRecommendationSelecteds.map(async (selected) => {
                const product = selected.productRecommendation;

                let cloneRecommendation;
                if (product && product.productRecommendationId) {
                    cloneRecommendation = await this.productRecommendationRepository.findOne({
                        where: {
                            id: String(product.productRecommendationId),
                        },
                    });
                }

                const originOrClone = cloneRecommendation || product;

                // translations
                const translations = await this.productTranslationsRepository.find({
                    where: {
                        productRecommendationId: originOrClone.id,
                    },
                });

                const productTranslations =
                    translations && translations.length > 0
                        ? translations.map(async (t) => {
                              const categoryAttribute = await this.productAttributesRepository.findOneBy({
                                  value: product.category,
                              });

                              const collectionAttribute = await this.productAttributesRepository.findOneBy({
                                  value: product.collection,
                              });

                              const attributeName =
                                  (
                                      await this.productAttributeTranslationsRepository.findOne({
                                          where: {
                                              productAttributeId: Number(categoryAttribute.id),
                                              language: t.language,
                                          },
                                      })
                                  )?.value || null;

                              const collectionName =
                                  (
                                      await this.productAttributeTranslationsRepository.findOne({
                                          where: {
                                              productAttributeId: Number(collectionAttribute.id),
                                              language: t.language,
                                          },
                                      })
                                  )?.value || null;

                              return {
                                  ...t.getBasicInfo,
                                  attribute_name: attributeName,
                                  collection_name: collectionName,
                              };
                          })
                        : [];

                const categoryTranslations = await this.productAttributesRepository.getTranslationsByType(
                    'Category',
                    product.category,
                );
                const collectionTranslations = await this.productAttributesRepository.getTranslationsByType(
                    'Collection',
                    product.collection,
                );

                return {
                    ...product.getBasicInfo,
                    is_principal: selected.isPrincipal,
                    name: originOrClone?.name,
                    shades: originOrClone.getShade(),
                    product_translations: productTranslations,
                    category_translations: categoryTranslations,
                    collection_translations: collectionTranslations,
                    batch_id: selected.batchId,
                    customer_id: selected.customerId,
                };
            });

            return {
                data: (await Promise.all(data)).filter(Boolean),
            };
        } catch (e) {
            throw e;
        }
    }

    async selectProducts(body: SelectProductsDto, userId: number) {
        const { batch_id, customer_id, products_selected } = body;
        try {
            const whereCondition: any = { batchId: batch_id };

            if (customer_id !== null && customer_id !== undefined) {
                whereCondition.customerId = customer_id;
            }

            const prevProductSelected = await this.prSelectedRepository.find({
                where: whereCondition,
            });

            const deleteList = prevProductSelected.map((prev) => this.prSelectedRepository.delete(prev));
            await Promise.all(deleteList);

            const newSelectedList = products_selected.map(async (pid, i) => {
                const existingEntry = await this.prSelectedRepository.findOne({
                    where: { batchId: batch_id, productRecommendationId: pid, consultantId: userId },
                });

                if (!existingEntry) {
                    const newSelect = this.prSelectedRepository.create({
                        batchId: batch_id,
                        customerId: customer_id,
                        productRecommendationId: pid,
                        orderNumber: i + 1,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        consultantId: userId,
                    });

                    await this.prSelectedRepository.save(newSelect);
                }
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

            const productIds = Object.keys(productSelectedGrouped).map(Number).filter(Boolean);

            const searchPage = Number(page || 1);
            const searchPer = Number(per || 25);

            const productQuery = this.productRecommendationRepository
                .createQueryBuilder('prdouctRecommendation')
                .leftJoinAndSelect('prdouctRecommendation.productVariants', 'productVariants')
                .where('prdouctRecommendation.id IN (:...productIds)', {
                    productIds: productIds,
                })
                .andWhere('prdouctRecommendation.recommendationCount > 0')
                .orderBy('prdouctRecommendation.recommendationCount', 'DESC')
                .skip((searchPage - 1) * searchPer)
                .take(searchPer);

            const [productRecommendations, totalCount] = await productQuery.getManyAndCount();

            const promiseReformat: Promise<ProductRecommendationForDiorT>[] = productRecommendations.map(
                async (recommendation) => {
                    let refRecommendation;
                    let name: string | null = null;
                    let shades: string | null = null;
                    let collectionShades: string[] = [];
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
                    const recommShadeList = await this.productRecommendationRepository
                        .createQueryBuilder('recommendtaions')
                        .where('recommendtaions.collection = :collection', {
                            collection: recommendation.collection,
                        })
                        .andWhere('recommendtaions.shades IS NOT NULL')
                        .getMany();

                    collectionShades = recommShadeList.map((recomm) => recomm.shades);
                    // collection_shades END

                    // product translations START
                    if (refRecommendation || recommendation) {
                        const oneOfRecomm = refRecommendation || recommendation;

                        const translations = await this.productTranslationsRepository.findBy({
                            productRecommendationId: oneOfRecomm.id,
                        });

                        const promiseTranslations = translations.map(async (t) => {
                            const attribute = await this.productAttributesRepository.findOne({
                                where: {
                                    value: recommendation.category,
                                },
                            });

                            const collection = await this.productAttributesRepository.findOne({
                                where: {
                                    value: recommendation.collection,
                                },
                            });

                            const attributeName = attribute
                                ? (
                                      await this.productAttributeTranslationsRepository.findOne({
                                          where: {
                                              productAttributeId: Number(attribute.id),
                                              language: t.language,
                                          },
                                      })
                                  )?.value
                                : null;

                            const collectionName = collection
                                ? (
                                      await this.productAttributeTranslationsRepository.findOne({
                                          where: {
                                              productAttributeId: Number(collection.id),
                                              language: t.language,
                                          },
                                      })
                                  )?.value
                                : null;

                            return {
                                ...t.getBasicInfo,
                                attribute_name: attributeName || null,
                                collection_name: collectionName || null,
                            };
                        });

                        productTranslations = await Promise.all(promiseTranslations);
                    }
                    // product translations END

                    categoryTranslations = await this.productAttributesRepository.getTranslationsByType(
                        'Category',
                        recommendation.category,
                    );

                    collectionTranslations = await this.productAttributesRepository.getTranslationsByType(
                        'Collection',
                        recommendation.collection,
                    );

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
                        ...recommendation.getBasicInfo,
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
                total_size: page && per ? totalCount : undefined,
                current_page_size: page && per ? data.length : undefined,
                current_page: page && per ? Number(page) : undefined,
                total_pages: page && per ? Math.ceil(totalCount / Number(per)) : undefined,
            };
        } catch (e) {
            throw e;
        }
    }
}
