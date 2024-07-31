import path from 'path';
import * as csv from 'csv';

import { Request } from 'express';
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as ExcelJS from 'exceljs';

import { ErrorStatus } from '@/src/common/constants/error-status';
import {
    ConsultantCountriesRepository,
    ConsultantsRepository,
    ProductAttributeTranslationsRepository,
    ProductAttributesRepository,
    ProductRecommendationGroupsRepository,
    ProductRecommendationRepository,
    ProductTranslationsRepository,
} from '@/src/common/repositories/crm';

import { AttributeRoutine, AutomaticProductByBatchIdDto, SearchProductRecommendationDto } from '../dior.dto';
import { CommonService } from '@/src/common/common.service';
import { ProductAttributes, ProductRecommendations } from '@/src/common/entities/crmEntities';
import { Not, In, Equal } from 'typeorm';
import { AutomaticProductDiorGenerator } from './automaticProductDiorGenerator';
import {
    CreateProductRecommendationDto,
    ExportRecommendtaionsDto,
    GetPresignUploadDto,
    ImportCountriesDto,
    ImportPicturesDto,
    ImportProductRecommendtaionDto,
    ImportTranslationsDto,
    UpdateProductRecommendationDto,
} from './productRecommendation.dto';
import { ProductRecommendationT, ProductTranslationT } from '@/src/common/types/entities';
import axios from 'axios';
import { AwsS3Service } from '@/src/common/awsS3/awsS3.service';

@Injectable()
export class ProductRecommendationService {
    constructor(
        private readonly commonService: CommonService,
        private readonly awsS3Service: AwsS3Service,

        private readonly consultantCountriesRepository: ConsultantCountriesRepository,
        private readonly productRecommendationRepository: ProductRecommendationRepository,
        private readonly productAttributesRepository: ProductAttributesRepository,
        private readonly paTranslationsRepository: ProductAttributeTranslationsRepository,
        private readonly prGroupsRepository: ProductRecommendationGroupsRepository,
        private readonly productTranslationsRepository: ProductTranslationsRepository,
        private readonly consultantRepository: ConsultantsRepository,
    ) {}
    async getProductRecommendation(req: Request, query: SearchProductRecommendationDto, locale: string = 'en') {
        try {
            const {
                request_origin,
                filter_by,
                filter_by_2,
                filter_by_country,
                category,
                routine,
                collection,
                search,
                page,
                limit,
            } = query;

            const userId = (<{ id: string }>req.user).id;

            const currentConsultant = await this.consultantRepository.getConsultantById(Number(userId), [
                'consultant_branch',
            ]);

            if (!currentConsultant) {
                throw new UnauthorizedException({
                    result_code: ErrorStatus.UNAUTHORIZED,
                    error: this.commonService.createLocaleErrorMessage(locale, 'unauthorized'),
                });
            }

            const diorConsultant = await this.consultantRepository.getDiorConsultant();

            if (!diorConsultant) {
                throw new NotFoundException({
                    result_code: ErrorStatus.NOT_FOUND,
                });
            }

            const prQuery = this.productRecommendationRepository
                .createQueryBuilder('productRecommendation')
                .where('productRecommendation.productRecommendationId IS NULL');

            if (request_origin && request_origin === 'dior_bo') {
                prQuery.andWhere('productRecommendation.consultantId = :diorConsultantId', {
                    diorConsultantId: diorConsultant.id,
                });
            } else {
                if (currentConsultant.consultant_position_id === 5) {
                    prQuery.andWhere('productRecommendation.consultantId = :diorConsultantId', {
                        diorConsultantId: diorConsultant.id,
                    });
                } else if (currentConsultant.consultant_position_id === 6) {
                    prQuery
                        .andWhere('productRecommendation.consultantId = :diorConsultantId', {
                            diorConsultantId: diorConsultant.id,
                        })
                        .andWhere('productRecommendation.countries && ARRAY[:countries]', {
                            countries: currentConsultant.countries,
                        });
                } else {
                    prQuery
                        .andWhere('productRecommendation.consultantId = :diorConsultantId', {
                            diorConsultantId: diorConsultant.id,
                        })
                        .andWhere('productRecommendation.countries && ARRAY[:country]', {
                            country: currentConsultant.consultant_branch?.country,
                        });
                }
            }

            if (search) {
                prQuery.andWhere(
                    'LOWER(productRecommendation.name) LIKE :search OR LOWER(productRecommendation.category) LIKE :search OR LOWER(productRecommendation.collection) LIKE :search OR LOWER(productRecommendation.routine) LIKE :search OR LOWER(productRecommendation.code) LIKE :search',
                    { search: `%${search.toLowerCase()}%` },
                );
            }

            if (filter_by) {
                prQuery.andWhere('productRecommendation.category = :filterBy', {
                    filterBy: req.query.filter_by,
                });
            }

            if (filter_by_2) {
                prQuery.andWhere('productRecommendation.collection = :filterBy2', {
                    filterBy2: filter_by_2,
                });
            }

            if (filter_by_country) {
                prQuery.andWhere('productRecommendation.countries && ARRAY[:filterByCountry]', {
                    filterByCountry: filter_by_country,
                });
            }

            if (category) {
                prQuery.andWhere('productRecommendation.category = :category', {
                    category: category,
                });
            }

            if (routine) {
                prQuery.andWhere('productRecommendation.routine = :routine', {
                    routine: routine,
                });
            }

            if (collection) {
                prQuery.andWhere('productRecommendation.collection = :collection', {
                    collection: collection,
                });
            }

            const searchPage = Number(page || 1);
            const searchLimit = Number(limit || 30);

            const [data, totalCount] = await prQuery
                // .leftJoinAndSelect(
                //     ProductTranslations,
                //     'productTranslations',
                //     'productRecommendation.id = CAST(productTranslations.product_recommendation_id AS integer)',
                // )
                .skip((searchPage - 1) * searchLimit)
                .take(searchLimit)
                .getManyAndCount();

            const result = data.map(async (d) => {
                const returnFormat = {
                    id: d.id,
                    product_type: d.productType,
                    description: d.description,
                    link: d.link,
                    image_url: d.imageUrl,
                    code: d.code,
                    routine: d.routine,
                    collection: d.collection,
                    category: d.category,
                    countries: d.countries,
                    product_recommendation_id: d.productRecommendationId,
                    name: d.name,
                    shades: d.shades,
                    collection_shades: [] as any[],
                    product_translations: [] as any[],
                    category_translations: [] as any[],
                    collection_translations: [] as any[],
                    product_variants: [] as any[],
                };

                d.productTranslations = await this.productTranslationsRepository.find({
                    where: {
                        productRecommendationId: d.id,
                    },
                });

                let recommendationForProperties = d;
                if (d.productRecommendationId) {
                    recommendationForProperties = await this.productRecommendationRepository.findOne({
                        where: { id: String(d.productRecommendationId) },
                    });

                    if (recommendationForProperties) {
                        recommendationForProperties.productTranslations = await this.productTranslationsRepository.find(
                            {
                                where: {
                                    productRecommendationId: recommendationForProperties.id,
                                },
                            },
                        );
                    }

                    returnFormat.name = recommendationForProperties ? recommendationForProperties.name : d.name;
                }

                recommendationForProperties.productTranslations?.forEach((translation) => {
                    returnFormat.product_translations.push({
                        id: translation.id,
                        field_name: translation.fieldName,
                        language: translation.language,
                        value: translation.value,
                        attribute_name: null,
                        collection_name: null,
                    });
                });

                // collection_shades
                const recommendationForShade = await this.productRecommendationRepository.find({
                    where: {
                        collection: d.collection,
                    },
                });
                recommendationForShade
                    .filter((forShade) => forShade.shades)
                    .forEach((forShade) => returnFormat.collection_shades.push(forShade.shades));

                // category_translations
                returnFormat.category_translations = await this.productAttributesRepository.getTranslationsByType(
                    'Category',
                    d.category,
                );

                // collection_translations
                returnFormat.collection_translations = await this.productAttributesRepository.getTranslationsByType(
                    'Collection',
                    d.collection,
                );

                return returnFormat;
            });

            return {
                data: await Promise.all(result),
                total_size: totalCount,
                current_page_size: data.length,
                current_page: searchPage,
                total_pages: Math.ceil(totalCount / searchLimit),
            };
        } catch (e) {
            throw e;
        }
    }

    async getProductRecommendationById(recommendationId: string, locale = 'en') {
        try {
            const foundRecommendtaion = await this.productRecommendationRepository.findOne({
                where: {
                    id: recommendationId,
                },
                relations: ['productVariants'],
            });

            if (!foundRecommendtaion) {
                throw new NotFoundException({});
            }

            const foundVariants = foundRecommendtaion.productVariants || [];

            const productVariants = foundVariants.map((variant) => {
                return {
                    id: Number(variant.id),
                    name: variant.name,
                    product_type: variant.productType,
                    description: variant.description,
                    link: variant.link,
                    image_url: variant.imageUrl,
                    category: variant.category,
                    routine: variant.routine,
                    code: variant.code,
                    collection: variant.collection,
                    shades: variant.shades,
                };
            });

            const foundProductTranslations = await this.productTranslationsRepository.find({
                where: {
                    productRecommendationId: foundRecommendtaion.id,
                },
            });

            let translations: ProductTranslationT[] = [];
            if (foundProductTranslations) {
                translations = foundProductTranslations.map((translations) => {
                    return {
                        id: Number(translations.id),
                        field_name: translations.fieldName,
                        language: translations.language,
                        value: translations.value,
                    };
                });
            }

            const reformatProductRecommendation: ProductRecommendationT = {
                id: Number(foundRecommendtaion.id),
                name: foundRecommendtaion.name,
                product_type: foundRecommendtaion.productType,
                description: foundRecommendtaion.description,
                link: foundRecommendtaion.link,
                image_url: foundRecommendtaion.imageUrl,
                category: foundRecommendtaion.category,
                routine: foundRecommendtaion.routine,
                code: foundRecommendtaion.code,
                collection: foundRecommendtaion.collection,
                shades: foundRecommendtaion.getShade(),
                product_translations: translations,
                product_variants: productVariants,
            };

            return reformatProductRecommendation;
        } catch (e) {
            throw e;
        }
    }

    async updateProductRecommendationById(
        body: UpdateProductRecommendationDto,
        recommendationId: string,
        locale = 'en',
    ) {
        try {
            const foundRecommendtaion = await this.productRecommendationRepository.findOneBy({ id: recommendationId });

            if (!foundRecommendtaion) {
                throw new NotFoundException({
                    result_code: ErrorStatus.RECORD_NOT_FOUND,
                    error: this.commonService.createLocaleErrorMessage(locale, 'record_not_found'),
                });
            }

            foundRecommendtaion.productType = body.product_type ? body.product_type : foundRecommendtaion.productType;
            foundRecommendtaion.name = body.name ? body.name : foundRecommendtaion.name;
            foundRecommendtaion.description = body.description ? body.description : foundRecommendtaion.description;
            foundRecommendtaion.link = body.link ? body.link : foundRecommendtaion.link;
            foundRecommendtaion.imageUrl = body.image_url ? body.image_url : foundRecommendtaion.imageUrl;
            foundRecommendtaion.code = body.code ? body.code : foundRecommendtaion.code;
            foundRecommendtaion.category = body.category ? body.category : foundRecommendtaion.category;
            foundRecommendtaion.productRecommendationId = body.product_recommendation_id
                ? Number(body.product_recommendation_id)
                : foundRecommendtaion.productRecommendationId;
            foundRecommendtaion.collection = body.collection ? body.collection : foundRecommendtaion.collection;
            foundRecommendtaion.countries = body.countries ? body.countries : foundRecommendtaion.countries;
            foundRecommendtaion.updatedAt = new Date();

            await this.productRecommendationRepository.save(foundRecommendtaion);

            const foundProductTranslations = await this.productTranslationsRepository.findBy({
                productRecommendationId: foundRecommendtaion.id,
            });

            await this.productTranslationsRepository.remove(foundProductTranslations);

            if (body.product_translations_attributes) {
                const productTranslationList = body.product_translations_attributes.map(async (translations) => {
                    const newTranslations = this.productTranslationsRepository.create({
                        productRecommendationId: foundRecommendtaion.id,
                        fieldName: translations.field_name,
                        language: translations.field_name,
                        value: translations.value,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    });
                    return await this.productTranslationsRepository.save(newTranslations);
                });

                const translations = await Promise.all(productTranslationList);
                foundRecommendtaion.productTranslations = translations;
            }

            const foundVariants = await this.productRecommendationRepository.find({
                where: {
                    productRecommendationId: Number(foundRecommendtaion.id),
                },
            });
            foundRecommendtaion.productVariants = foundVariants;

            const productVariants = foundVariants.map((variant) => {
                return {
                    id: Number(variant.id),
                    name: variant.name,
                    product_type: variant.productType,
                    description: variant.description,
                    link: variant.link,
                    image_url: variant.imageUrl,
                    category: variant.category,
                    routine: variant.routine,
                    code: variant.code,
                    collection: variant.collection,
                    shades: variant.shades,
                };
            });

            let translations: ProductTranslationT[] = [];
            if (foundRecommendtaion.productTranslations) {
                translations = foundRecommendtaion.productTranslations.map((translations) => {
                    return {
                        id: Number(translations.id),
                        field_name: translations.fieldName,
                        language: translations.language,
                        value: translations.value,
                    };
                });
            }

            const reformatProductRecommendation: ProductRecommendationT = {
                id: Number(foundRecommendtaion.id),
                name: foundRecommendtaion.name,
                product_type: foundRecommendtaion.productType,
                description: foundRecommendtaion.description,
                link: foundRecommendtaion.link,
                image_url: foundRecommendtaion.imageUrl,
                category: foundRecommendtaion.category,
                routine: foundRecommendtaion.routine,
                code: foundRecommendtaion.code,
                collection: foundRecommendtaion.collection,
                shades: foundRecommendtaion.getShade(),
                product_translations: translations,
                product_variants: productVariants,
            };

            return reformatProductRecommendation;
        } catch (e) {
            throw e;
        }
    }

    async deleteProductRecommendationById(recommendandationId: string, locale = 'en') {
        try {
            const foundRecommendtaion = await this.productRecommendationRepository.findOneBy({
                id: recommendandationId,
            });

            if (!foundRecommendtaion) {
                throw new NotFoundException({});
            }

            await this.productRecommendationRepository.remove(foundRecommendtaion);

            return {
                message: 'Product deleted',
            };
        } catch (e) {
            throw e;
        }
    }

    async deleteMultipleProductRecommendationByIds(recommendationsIds: string, locale = 'en') {
        try {
            const splitIds = recommendationsIds.split(',').map((id) => Number(id));

            const foundRecommendtaions = await this.productRecommendationRepository.find({
                where: {
                    id: In(splitIds),
                },
            });

            await this.productRecommendationRepository.remove(foundRecommendtaions);

            return {
                message: 'Successfully deleted multiple record',
            };
        } catch (e) {
            throw e;
        }
    }

    async createProductRecommendation(body: CreateProductRecommendationDto) {
        try {
            const diorConsultant = await this.consultantRepository.getDiorConsultant();

            const newProductRecommendation = this.productRecommendationRepository.create({
                consultantId: diorConsultant.id,
                shades: body.shades,
                productType: body.product_type,
                name: body.name,
                description: body.description,
                link: body.link,
                imageUrl: body.image_url,
                code: body.code,
                category: body.category,
                routine: body.routine,
                productRecommendationId: Number(body.product_recommendation_id),
                collection: body.collection,
                countries: body.countries,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            const savedProductRecommendation = await this.productRecommendationRepository.save(
                newProductRecommendation,
            );

            if (body.product_translations_attributes) {
                const productTranslationList = body.product_translations_attributes.map(async (translations) => {
                    const newTranslations = this.productTranslationsRepository.create({
                        productRecommendationId: savedProductRecommendation.id,
                        fieldName: translations.field_name,
                        language: translations.field_name,
                        value: translations.value,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    });
                    return await this.productTranslationsRepository.save(newTranslations);
                });

                const translations = await Promise.all(productTranslationList);
                savedProductRecommendation.productTranslations = translations;
            }

            const foundVariants = await this.productRecommendationRepository.find({
                where: {
                    productRecommendationId: Number(savedProductRecommendation.id),
                },
            });

            const productVariants = foundVariants.map((variant) => {
                return {
                    id: Number(variant.id),
                    name: variant.name,
                    product_type: variant.productType,
                    description: variant.description,
                    link: variant.link,
                    image_url: variant.imageUrl,
                    category: variant.category,
                    routine: variant.routine,
                    code: variant.code,
                    collection: variant.collection,
                    shades: variant.shades,
                };
            });

            let translations: ProductTranslationT[] = [];
            if (savedProductRecommendation.productTranslations) {
                translations = savedProductRecommendation.productTranslations.map((translations) => {
                    return {
                        id: Number(translations.id),
                        field_name: translations.fieldName,
                        language: translations.language,
                        value: translations.value,
                    };
                });
            }

            const reformatProductRecommendation: ProductRecommendationT = {
                id: Number(savedProductRecommendation.id),
                name: savedProductRecommendation.name,
                product_type: savedProductRecommendation.productType,
                description: savedProductRecommendation.description,
                link: savedProductRecommendation.link,
                image_url: savedProductRecommendation.imageUrl,
                category: savedProductRecommendation.category,
                routine: savedProductRecommendation.routine,
                code: savedProductRecommendation.code,
                collection: savedProductRecommendation.collection,
                shades: savedProductRecommendation.getShade(),
                product_translations: translations,
                product_variants: productVariants,
            };

            return reformatProductRecommendation;
        } catch (e) {
            throw e;
        }
    }

    async getRecommendationsCollection(routine: AttributeRoutine) {
        try {
            const categories: ProductAttributes[] = await this.productAttributesRepository.findAndOrderByValue(
                'productAttributes',
                "productAttributes.typ = 'Collection'",
                routine,
            );

            const { data, translatedData } = this.createReturnFormForRecoCollectionAndCategories(categories);

            return {
                data: data,
                translated_data: translatedData,
            };
        } catch (e) {
            throw e;
        }
    }

    async getAutomaticProductByBatchId(query: AutomaticProductByBatchIdDto) {
        try {
            const diorConsultant = await this.consultantRepository.getDiorConsultant();

            if (!diorConsultant) {
                throw new NotFoundException();
            }

            const generatorCreateParameter = {
                diorConsultant: diorConsultant,
                skinTone: query.skin_tone,
                routineRecommendation: query.routine_recommendation,
                market: query.market,
                answers: query.answers,
                old: true,
            };

            const repositories = {
                consultantCountriesRepository: this.consultantCountriesRepository,
                productRecommendationsRepository: this.productRecommendationRepository,
                prGroupsRepository: this.prGroupsRepository,
            };

            const automaticProductDiorGenerator = new AutomaticProductDiorGenerator(
                generatorCreateParameter,
                repositories,
            );

            const psSelecteds = await automaticProductDiorGenerator.questionAnswers();

            const data = psSelecteds
                .sort((a, b) => a.orderNumber - b.orderNumber)
                .map(async (productRecommendationSelected) => {
                    let recommendation = productRecommendationSelected.productRecommendation;

                    const isPrincipal = productRecommendationSelected.isPrincipal;
                    const shades = recommendation.getShade();
                    const collectionShades = (
                        await this.productRecommendationRepository
                            .createQueryBuilder('pr')
                            .where('pr.collection = :collection', {
                                collection: recommendation.collection,
                            })
                            .andWhere('pr.shades IS NOT NULL')
                            .getMany()
                    ).map((collection) => collection.shades);

                    const categoryTranslations = await this.productAttributesRepository.getTranslationsByType(
                        'Category',
                        recommendation.category,
                    );
                    const collectionTranslations = await this.productAttributesRepository.getTranslationsByType(
                        'Collection',
                        recommendation.collection,
                    );

                    const productVariants = recommendation.getVariants;

                    let cloneRecomm;
                    let name = null;
                    let productTranslations = [];

                    if (recommendation) {
                        if (recommendation.routine === 'Makeup') {
                            recommendation = recommendation.getSkinToneFromProduct(query.skin_tone);
                        }

                        name = recommendation.name;
                        if (recommendation.productRecommendationId) {
                            cloneRecomm = await this.productRecommendationRepository.findOne({
                                where: {
                                    id: String(recommendation.productRecommendationId),
                                },
                            });
                        }
                    }

                    const translationRecomm = cloneRecomm || recommendation;
                    const translations = await this.productTranslationsRepository.find({
                        where: {
                            productRecommendationId: String(translationRecomm.id),
                        },
                    });

                    const promiseTranslations = translations.map(async (t) => {
                        const attribute = await this.productAttributesRepository.findOne({
                            where: {
                                value: translationRecomm.category,
                            },
                        });

                        const collection = await this.productAttributesRepository.findOne({
                            where: {
                                value: translationRecomm.collection,
                            },
                        });

                        const attributeName = attribute
                            ? (
                                  await this.paTranslationsRepository.findOne({
                                      where: {
                                          productAttributeId: Number(attribute.id),
                                          language: t.language,
                                      },
                                  })
                              )?.value
                            : null;

                        const collectionName = collection
                            ? (
                                  await this.paTranslationsRepository.findOne({
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

                    return {
                        ...recommendation.getBasicInfo,
                        name,
                        is_principal: isPrincipal,
                        shades,
                        collection_shades: collectionShades,
                        product_translations: productTranslations,
                        category_translations: categoryTranslations,
                        collection_translations: collectionTranslations,
                        product_variants: productVariants,
                    };
                });

            return {
                data: await Promise.all(data),
            };
        } catch (e) {
            throw e;
        }
    }

    async getNewAutomaticProductByBatchId(query: AutomaticProductByBatchIdDto) {
        try {
            const diorConsultant = await this.consultantRepository.getDiorConsultant();

            if (!diorConsultant) {
                throw new NotFoundException();
            }

            const generatorCreateParameter = {
                diorConsultant: diorConsultant,
                skinTone: query.skin_tone,
                routineRecommendation: query.routine_recommendation,
                market: query.market,
                answers: query.answers,
                old: false,
            };

            const repositories = {
                consultantCountriesRepository: this.consultantCountriesRepository,
                productRecommendationsRepository: this.productRecommendationRepository,
                prGroupsRepository: this.prGroupsRepository,
            };

            const automaticProductDiorGenerator = new AutomaticProductDiorGenerator(
                generatorCreateParameter,
                repositories,
            );

            const psSelecteds = await automaticProductDiorGenerator.questionAnswers();

            const data = psSelecteds
                .sort((a, b) => a.orderNumber - b.orderNumber)
                .map(async (productRecommendationSelected) => {
                    let recommendation = productRecommendationSelected.productRecommendation;

                    const isPrincipal = productRecommendationSelected.isPrincipal;
                    const shades = recommendation.getShade();
                    const collectionShades = (
                        await this.productRecommendationRepository
                            .createQueryBuilder('pr')
                            .where('pr.collection = :collection', {
                                collection: recommendation.collection,
                            })
                            .andWhere('pr.shades IS NOT NULL')
                            .getMany()
                    ).map((collection) => collection.shades);

                    const categoryTranslations = await this.productAttributesRepository.getTranslationsByType(
                        'Category',
                        recommendation.category,
                    );
                    const collectionTranslations = await this.productAttributesRepository.getTranslationsByType(
                        'Collection',
                        recommendation.collection,
                    );

                    const productVariants = recommendation.getVariants;

                    let cloneRecomm;
                    let name = null;
                    let productTranslations = [];

                    if (recommendation) {
                        if (recommendation.routine === 'Makeup') {
                            recommendation = recommendation.getNewSkinToneFromProduct(query.skin_tone);
                        }

                        name = recommendation.name;
                        if (recommendation.productRecommendationId) {
                            cloneRecomm = await this.productRecommendationRepository.findOne({
                                where: {
                                    id: String(recommendation.productRecommendationId),
                                },
                            });
                        }
                    }

                    const translationRecomm = cloneRecomm || recommendation;
                    const translations = await this.productTranslationsRepository.find({
                        where: {
                            productRecommendationId: String(translationRecomm.id),
                        },
                    });

                    const promiseTranslations = translations.map(async (t) => {
                        const attribute = await this.productAttributesRepository.findOne({
                            where: {
                                value: translationRecomm.category,
                            },
                        });

                        const collection = await this.productAttributesRepository.findOne({
                            where: {
                                value: translationRecomm.collection,
                            },
                        });

                        const attributeName = attribute
                            ? (
                                  await this.paTranslationsRepository.findOne({
                                      where: {
                                          productAttributeId: Number(attribute.id),
                                          language: t.language,
                                      },
                                  })
                              )?.value
                            : null;

                        const collectionName = collection
                            ? (
                                  await this.paTranslationsRepository.findOne({
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

                    return {
                        ...recommendation.getBasicInfo,
                        name,
                        is_principal: isPrincipal,
                        shades,
                        collection_shades: collectionShades,
                        product_translations: productTranslations,
                        category_translations: categoryTranslations,
                        collection_translations: collectionTranslations,
                        product_variants: productVariants,
                    };
                });

            return {
                data: await Promise.all(data),
            };
        } catch (e) {
            throw e;
        }
    }

    async getRecommendationsCategories(routine: AttributeRoutine) {
        try {
            const categories: ProductAttributes[] = await this.productAttributesRepository.findAndOrderByValue(
                'productAttributes',
                "productAttributes.typ = 'Category'",
                routine,
            );

            const { data, translatedData } = this.createReturnFormForRecoCollectionAndCategories(categories);

            return {
                data,
                translated_data: translatedData,
            };
        } catch (e) {
            throw e;
        }
    }

    async importProductRecommendtaion(body: ImportProductRecommendtaionDto, locale = 'en') {
        //  Columns
        //  1 - Product Code
        //  2 - Product Name
        //  3 - Product Link
        //  4 - Category
        //  5 - Collection
        //  6 - Axis
        //  7 - Image URL
        //  8 - Product Variant Code
        //  9 - Shades

        try {
            const diorConsultant = await this.consultantRepository.getDiorConsultant();

            const fileUrl = body.file_url;

            const worksheet = await this.getWorkSheet(fileUrl);

            const rowCount = worksheet.rowCount + 1;

            for (let i = 2; i < rowCount; i++) {
                const row = worksheet.getRow(i);

                const productCode = row.getCell(8).value as string;
                const productVariant = productCode
                    ? await this.productRecommendationRepository.findOne({ where: { code: productCode } })
                    : null;

                const linkText = (<{ text: string }>row.getCell(3).value)?.text ?? null;
                const imageUrlText = (<{ text: string }>row.getCell(7).value)?.text ?? null;

                const link = linkText ? linkText : (row.getCell(3).value as string);
                const imageUrl = imageUrlText ? imageUrlText : (row.getCell(7).value as string);

                const newProduct = this.productRecommendationRepository.create({
                    code: row.getCell(1).value as string,
                    name: (row.getCell(2).value as string).trim(),
                    link: link,
                    category: row.getCell(4).value as string,
                    collection: row.getCell(5).value as string,
                    routine: row.getCell(6).value as string,
                    imageUrl: imageUrl,
                    shades: row.getCell(9).value as string,
                    productRecommendationId: Number(productVariant?.id || null),
                    consultantId: Number(diorConsultant.id),
                    updatedAt: new Date(),
                    createdAt: new Date(),
                });

                await this.productRecommendationRepository.save(newProduct);
            }

            return { message: 'Success import data' };
        } catch (e) {
            throw e;
        }
    }

    async importProductTranslations(body: ImportTranslationsDto, locale = 'en') {
        try {
            const fileUrl = body.file_url;
            const country = body.country;

            const worksheet = await this.getWorkSheet(fileUrl);

            const headers = worksheet.getRow(1);

            const rowCount = worksheet.rowCount + 1;

            const newBranches = [];

            const diorConsultant = await this.consultantRepository.getDiorConsultant();

            for (let i = 2; i < rowCount; i++) {
                const row = worksheet.getRow(i);
                const productCode = row.getCell(1).value as string;
                const translationProductName = row.getCell(2).value as string;

                const product = diorConsultant?.productRecommendations.find((pr) => pr.code === productCode);
                if (product) {
                    let translation = product.productTranslations.find(
                        (pt) => pt.fieldName === 'product_name' && pt.language === country,
                    );
                    if (translation) {
                        translation.value = translationProductName;
                        await this.productTranslationsRepository.save(translation);
                    } else {
                        translation = this.productTranslationsRepository.create({
                            fieldName: 'product_name',
                            language: country,
                            value: translationProductName,
                            productRecommendationId: product.id,
                        });
                        await this.productTranslationsRepository.save(translation);
                    }
                }
            }

            return {
                message: 'Success import data',
            };
        } catch (e) {
            throw e;
        }
    }

    async importCountries(body: ImportCountriesDto) {
        try {
            const fileUrl = body.file_url;
            const country = body.country;

            const worksheet = await this.getWorkSheet(fileUrl);

            const headers = worksheet.getRow(1);
            const rowCount = worksheet.rowCount + 1;

            for (let i = 2; i < rowCount; i++) {
                const row = worksheet.getRow(i);

                const productCode = row.getCell(1).value as string;
                const excludeInCountry = (row.getCell(2).value as string).toLocaleLowerCase() === 'y';

                const product = await this.productRecommendationRepository.findOne({
                    where: {
                        code: productCode,
                    },
                });

                if (product) {
                    let productCountries = product.countries;
                    if (excludeInCountry) {
                        productCountries = productCountries.filter((c) => c !== country);
                    } else {
                        if (!productCountries.includes(country)) {
                            productCountries.push(country);
                        }
                    }
                    product.countries = productCountries;
                    await this.productRecommendationRepository.save(product);
                }
            }

            return {
                message: 'Success import data',
            };
        } catch (e) {
            throw e;
        }
    }

    async importPictures(body: ImportPicturesDto) {
        try {
            const fileUrl = body.file_url;

            const response = await axios.get(fileUrl);

            const isExistImage = response.headers['Content-Type'].toLocaleString().startsWith('image');

            if (isExistImage) {
                throw new Error();
            }

            const fileName = path.basename(fileUrl, path.extname(fileUrl));
            const productCode = fileName.slice(37);

            const diorConsultant = await this.consultantRepository.getDiorConsultant();

            const product = diorConsultant.productRecommendations.find((pr) => pr.code === productCode);
            if (product) {
                product.imageUrl = fileUrl;
                await this.productRecommendationRepository.save(product);
            }

            return {
                message: 'Success import data',
            };
        } catch (e) {
            throw e;
        }
    }

    async exportRecommendation(req: Request, query: ExportRecommendtaionsDto, locale = 'en') {
        try {
            const { search, filter_by, filter_by2, country, typ } = query;
            const userId = (<{ id: string }>req.user).id;

            const currentConsultant = await this.consultantRepository.getConsultantById(userId, [
                'consultant_position',
                'consultant_branch',
            ]);

            if (!currentConsultant) {
                throw new UnauthorizedException({
                    resule_code: ErrorStatus.UNAUTHORIZED,
                    error: this.commonService.createLocaleErrorMessage(locale, 'unauthorized'),
                });
            }

            const diorConsultant = await this.consultantRepository.getDiorConsultant();

            const recommendationQuery = await this.productRecommendationRepository
                .createQueryBuilder('productRecommendation')
                .where('productRecommendation.consultant_id = :consultantId', { consultantId: diorConsultant.id });
            if (Number(currentConsultant.consultant_position.id) === 5) {
            } else if (Number(currentConsultant.consultant_position_id) === 6) {
                recommendationQuery.andWhere('productRecommendation.countries && ARRAY[:countries]', {
                    countries: currentConsultant.countries,
                });
            } else {
                recommendationQuery.andWhere('productRecommendation.countries && ARRAY[:country]', {
                    country: currentConsultant.consultant_branch.country,
                });
            }

            if (search) {
                recommendationQuery.andWhere('LOWER (productRecommendation.name) LIKE :search', {
                    search: `%${search}%`,
                });
            }

            if (filter_by) {
                recommendationQuery.andWhere('productRecommendation.category = :category', { category: filter_by });
            }
            if (filter_by2) {
                recommendationQuery
                    .andWhere('productRecommendation.collection = :collection', {
                        collection: filter_by2,
                    })
                    .orWhere('productRecommendation.countries = :countries', { countries: filter_by2 });
            }
            if (country) {
                recommendationQuery.andWhere('productRecommendation.countries && :countries', { countries: [country] });
            }

            const productRecommendations = await recommendationQuery.getMany();
            const productTranslations = await this.productTranslationsRepository.find({
                where: {
                    productRecommendationId: In(productRecommendations.map((recomm) => recomm.id)),
                },
            });

            productRecommendations.forEach((recomm) => {
                const foundTranslations = productTranslations.filter(
                    (translation) => translation.productRecommendationId === recomm.id,
                );
                recomm.productTranslations = foundTranslations;
            });

            let result;
            if (typ === 'translations') {
                result = await this.writeCSVFileForExportByTranslations(productRecommendations);
            } else {
                result = await this.writeCSVFileForExportByOthers(productRecommendations);
            }

            return result;
        } catch (e) {
            throw e;
        }
    }

    async getAxis() {
        try {
            const axis = [];

            const productAttributes = await this.productAttributesRepository.find({
                where: {
                    typ: 'Axis',
                },
                relations: ['productAttributeTranslations'],
            });

            return {
                data: [...new Set(productAttributes.map((row) => row.value))],
                translated_data: productAttributes.map((category) => ({
                    value: category.value,
                    category_translations: (category.productAttributeTranslations || []).map((translation) => ({
                        id: translation.id,
                        field_name: translation.fieldName,
                        language: translation.language,
                        value: translation.value,
                    })),
                })),
            };
        } catch (e) {
            throw e;
        }
    }

    async getPresignUpload(query: GetPresignUploadDto) {
        try {
            const diorConsultant = await this.consultantRepository.getDiorConsultant();

            const { filename } = query;

            const result = await this.awsS3Service.getPresignUploadForDiorProductRecommendation(
                filename,
                diorConsultant.id,
            );

            return {
                result,
            };
        } catch (e) {
            throw e;
        }
    }

    /**
     *
     * Utils
     *
     * */
    async getWorkSheet(fileUrl: string) {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(fileUrl);
        const worksheet = workbook.getWorksheet(1);

        return worksheet;
    }

    writeCSVFileForExportByTranslations(recommendations: ProductRecommendations[]) {
        const header = ['Product Code', 'Language', 'Value'];

        const records = recommendations.flatMap((u) => u.productTranslations.map((t) => [u.code, t.language, t.value]));

        return new Promise((resolve, reject) => {
            csv.stringify([header, ...records], (err, output) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(output);
            });
        });
    }

    writeCSVFileForExportByOthers(recommendations: ProductRecommendations[]) {
        const header = [
            'Product Code',
            'Product Name',
            'Category',
            'Collection',
            'Axis',
            'Link',
            'Image URL',
            'Product Variant Code',
        ];

        const records = recommendations.map((u) => [
            u.code,
            u.name,
            u.category,
            u.collection,
            u.routine,
            u.link,
            u.imageUrl,
            u.productVariant?.code || '',
        ]);

        return new Promise((resolve, reject) => {
            csv.stringify([header, ...records], (err, output) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(output);
            });
        });
    }

    createReturnFormForRecoCollectionAndCategories(categories: ProductAttributes[]) {
        const data = categories
            .map((category) => category.value)
            .filter((value, index, self) => self.indexOf(value) === index);

        const translatedData = categories.map((category) => ({
            value: category.value,
            category_translations: category.productAttributeTranslations.map((translation) => ({
                id: translation.id,
                field_name: translation.fieldName,
                language: translation.language,
                value: translation.value,
            })),
        }));

        return {
            data,
            translatedData,
        };
    }
}
