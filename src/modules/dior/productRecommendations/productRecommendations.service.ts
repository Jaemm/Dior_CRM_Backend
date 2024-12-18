import * as path from 'path';
import * as csv from 'csv';
import { v4 as uuid } from 'uuid';
import { Request } from 'express';
import { Injectable, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';

import { ErrorStatus } from '@/src/common/constants/error-status';
import {
    ConsultantCountriesRepository,
    ConsultantsRepository,
    PresignRepository,
    ProductAttributeTranslationsRepository,
    ProductAttributesRepository,
    ProductRecommendationGroupsRepository,
    ProductRecommendationRepository,
    ProductTranslationsRepository,
} from '@/src/common/repositories/crm';

import { AttributeRoutine, AutomaticProductByBatchIdDto, SearchProductRecommendationDto } from '../dior.dto';
import { CommonService } from '@/src/common/common.service';
import { ProductAttributes, ProductRecommendations } from '@/src/common/entities/crmEntities';
import { Not, In, Equal, IsNull } from 'typeorm';
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
import { ProductTranslations } from '@/src/common/entities/crmEntities';
import axios from 'axios';
import { AwsS3Service } from '@/src/common/awsS3/awsS3.service';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class ProductRecommendationService {
    constructor(
        private readonly commonService: CommonService,
        private readonly configService: ConfigService,
        private readonly httpService: HttpService,
        private readonly awsS3Service: AwsS3Service,

        private readonly consultantCountriesRepository: ConsultantCountriesRepository,
        private readonly productRecommendationRepository: ProductRecommendationRepository,
        private readonly productAttributesRepository: ProductAttributesRepository,
        private readonly paTranslationsRepository: ProductAttributeTranslationsRepository,
        private readonly prGroupsRepository: ProductRecommendationGroupsRepository,
        private readonly productTranslationsRepository: ProductTranslationsRepository,
        private readonly presignRepository: PresignRepository,
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
                .where('productRecommendation.productRecommendationId IS NULL')
                .leftJoinAndSelect('productRecommendation.productVariants', 'productVariants');

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
                prQuery
                    .andWhere(
                        'LOWER(productRecommendation.name) LIKE :search OR LOWER(productRecommendation.category) LIKE :search OR LOWER(productRecommendation.collection) LIKE :search OR LOWER(productRecommendation.routine) LIKE :search OR LOWER(productRecommendation.code) LIKE :search',
                        { search: `%${search.toLowerCase()}%` },
                    )
                    .andWhere('productRecommendation.productRecommendationId IS NULL');
            }

            if (filter_by) {
                prQuery
                    .andWhere('productRecommendation.category = :filterBy', {
                        filterBy: req.query.filter_by,
                    })
                    .andWhere('productRecommendation.productRecommendationId IS NULL');
            }

            if (filter_by_2) {
                prQuery
                    .andWhere('productRecommendation.collection = :filterBy2', {
                        filterBy2: filter_by_2,
                    })
                    .andWhere('productRecommendation.productRecommendationId IS NULL');
            }

            if (filter_by_country) {
                prQuery
                    .andWhere('productRecommendation.countries && ARRAY[:filterByCountry]', {
                        filterByCountry: filter_by_country,
                    })
                    .andWhere('productRecommendation.productRecommendationId IS NULL');
            }

            if (category) {
                prQuery
                    .andWhere('productRecommendation.category = :category', {
                        category: category,
                    })
                    .andWhere('productRecommendation.productRecommendationId IS NULL');
            }

            if (routine) {
                prQuery
                    .andWhere('productRecommendation.routine = :routine', {
                        routine: routine,
                    })
                    .andWhere('productRecommendation.productRecommendationId IS NULL');
            }

            if (collection) {
                prQuery
                    .andWhere('productRecommendation.collection = :collection', {
                        collection: collection,
                    })
                    .andWhere('productRecommendation.productRecommendationId IS NULL');
            }

            if (page && limit) {
                prQuery.skip((Number(page) - 1) * Number(limit)).take(Number(limit));
            }
            prQuery.orderBy('productRecommendation.code', 'ASC');

            const [data, totalCount] = await prQuery.getManyAndCount();

            console.log("totalCount",totalCount)

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
                    product_variants: d.getVariants,
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

                recommendationForProperties?.productTranslations?.forEach((translation) => {
                    returnFormat.product_translations.push({
                        id: translation?.id ?? null,
                        field_name: translation?.fieldName ?? null,
                        language: translation?.language ?? null,
                        value: translation?.value ?? null,
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

            let total_size;
            let current_page_size;
            let current_page;
            let total_pages;
            if (page && limit) {
                total_size = totalCount;
                current_page_size = data.length;
                current_page = Number(page);
                total_pages = Math.ceil(totalCount / Number(limit));
            }

            return {
                data: await Promise.all(result),
                total_size,
                current_page_size,
                current_page,
                total_pages,
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

            const productVariants = foundRecommendtaion.getVariants;

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

            const reformatProductRecommendation = {
                id: Number(foundRecommendtaion.id),
                name: foundRecommendtaion.name,
                product_type: foundRecommendtaion.productType,
                description: foundRecommendtaion.description,
                link: foundRecommendtaion.link,
                image_url: foundRecommendtaion.imageUrl,
                category: foundRecommendtaion.category,
                countries: foundRecommendtaion.countries,
                product_recommendation_id: foundRecommendtaion.productRecommendationId,
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
        const {
            category,
            category_translations,
            code,
            collection,
            shades,
            collection_shades,
            collection_translations,
            countries,
            description,
            image_url,
            link,
            name,
            product_type,
            product_recommendation_id,
            routine,
            product_translations,
        } = body;

        try {
            const foundRecommendtaion = await this.productRecommendationRepository.findOneBy({ id: recommendationId });

            if (!foundRecommendtaion) {
                throw new NotFoundException({
                    result_code: ErrorStatus.RECORD_NOT_FOUND,
                    error: this.commonService.createLocaleErrorMessage(locale, 'record_not_found'),
                });
            }

            foundRecommendtaion.productType = product_type ? product_type : foundRecommendtaion.productType;
            foundRecommendtaion.name = name ? name : foundRecommendtaion.name;
            foundRecommendtaion.description = description ? description : foundRecommendtaion.description;
            foundRecommendtaion.link = link ? link : foundRecommendtaion.link;
            foundRecommendtaion.imageUrl = image_url ? image_url : foundRecommendtaion.imageUrl;
            foundRecommendtaion.code = code ? code : foundRecommendtaion.code;
            foundRecommendtaion.category = category ? category : foundRecommendtaion.category;
            foundRecommendtaion.productRecommendationId = product_recommendation_id
                ? Number(product_recommendation_id)
                : foundRecommendtaion.productRecommendationId;
            foundRecommendtaion.collection = collection ? collection : foundRecommendtaion.collection;
            foundRecommendtaion.countries = countries ? countries : foundRecommendtaion.countries;
            foundRecommendtaion.shades = shades ? shades : foundRecommendtaion.shades;
            foundRecommendtaion.routine = routine ? routine : foundRecommendtaion.routine;
            foundRecommendtaion.updatedAt = new Date();

            await this.productRecommendationRepository.save(foundRecommendtaion);

            if (product_translations) {
                const foundProductTranslations = await this.productTranslationsRepository.findBy({
                    productRecommendationId: foundRecommendtaion.id,
                });

                await this.productTranslationsRepository.remove(foundProductTranslations);

                const productTranslationList = product_translations.map((translations) => {
                    const newTranslations = this.productTranslationsRepository.create({
                        productRecommendationId: foundRecommendtaion.id,
                        fieldName: translations.field_name,
                        language: translations.language,
                        value: translations.value,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    });

                    return newTranslations;
                });
                const translations = await this.productTranslationsRepository.save(productTranslationList);
                foundRecommendtaion.productTranslations = translations;
            }

            if (category_translations) {
                const attribute = await this.productAttributesRepository.findOne({
                    where: {
                        typ: 'Category',
                        value: foundRecommendtaion.category,
                    },
                    relations: ['productAttributeTranslations'],
                });

                const paTranslations = attribute.productAttributeTranslations;

                await this.paTranslationsRepository.remove(paTranslations);

                const newCategories = category_translations.map((cTranslations) => {
                    return this.paTranslationsRepository.create({
                        fieldName: cTranslations.field_name,
                        language: cTranslations.language,
                        value: cTranslations.value,
                        productAttributeId: Number(attribute.id),
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    });
                });

                await this.paTranslationsRepository.save(newCategories);
            }

            if (collection_translations) {
                const attribute = await this.productAttributesRepository.findOne({
                    where: {
                        typ: 'Collection',
                        value: foundRecommendtaion.collection,
                    },
                    relations: ['productAttributeTranslations'],
                });

                if (!attribute) {
                    throw new NotFoundException({
                        message: `${foundRecommendtaion.collection} Collection Does Not Exist`,
                    });
                }

                const paTranslations = attribute?.productAttributeTranslations;

                console.log('paTranslations ====>', paTranslations);

                await this.paTranslationsRepository.remove(paTranslations);

                const newCategories = category_translations.map((cTranslations) => {
                    return this.paTranslationsRepository.create({
                        fieldName: cTranslations.field_name,
                        language: cTranslations.language,
                        value: cTranslations.value,
                        productAttributeId: Number(attribute.id),
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    });
                });

                await this.paTranslationsRepository.save(newCategories);
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
                productRecommendationId: Number(body.product_recommendation_id) || null,
                collection: body.collection,
                countries: body.countries,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            const savedProductRecommendation = await this.productRecommendationRepository.save(
                newProductRecommendation,
            );

            if (body.product_translations) {
                const productTranslationList = body.product_translations.map(async (translations) => {
                    const newTranslations = this.productTranslationsRepository.create({
                        productRecommendationId: savedProductRecommendation.id,
                        fieldName: translations.field_name,
                        language: translations.language,
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
                market: query?.market ?? '',
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

    async importProductRecommendtaionGeneral(req: Request, body: ImportProductRecommendtaionDto, locale = 'en') {
        const userId = (<{ id: string }>req.user).id;
        const splitToken = req.headers.authorization.split(' ');
        const token = splitToken[1];
        const fileUrl = body.file_url;
        const worksheet = await this.commonService.getWorkSheetByHTTP(fileUrl, token);

        const rows: any[] = [];
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber > 1) rows.push(row.values); // Skip header row
        });

        // const productCodes = rows.map((row) => row[8]).filter(Boolean);

        const rowCount = worksheet.rowCount + 1;
        const newProducts: any[] = [];
        for (let i = 2; i < rowCount; i++) {
            // const row_ = rows[i];
            const row = worksheet.getRow(i);
            // const productVariantId = productVariantsMap.get(row_[7]) || null;
            const productCode = row.getCell(8).value as string;
            const productVariant = await this.findByCode(productCode);

            // console.log('productCode ===> ', productVariant);
            const linkText = (<{ text: string }>row.getCell(3).value)?.text ?? null;
            const link = linkText ? linkText : (row.getCell(3).value as string);
            const imageUrlText = (<{ text: string }>row.getCell(8).value)?.text ?? null;
            const imageUrl = imageUrlText ? imageUrlText : (row.getCell(7).value as string);

            newProducts.push({
                code: row.getCell(1).value as string,
                name: ((row.getCell(2).value as string) || '').trim(),
                link: link,
                category: row.getCell(4).value as string,
                collection: row.getCell(5).value as string,
                routine: row.getCell(6).value as string,
                imageUrl: imageUrl,
                shades: row.getCell(9).value as string,
                productRecommendationId: productVariant?.id ? Number(productVariant?.id) : null,
                consultantId: Number(userId),
                updatedAt: new Date(),
                createdAt: new Date(),
            });
        }

        const filteredData = newProducts.filter((item) => item.code !== null && item.name !== '');
        await this.bulkSave(filteredData);

        return { message: 'Data imported successfully' };
    }
    // save one buy one and check save productRecommendationId to the following that contains CODE
    async importProductRecommendtaion(req: Request, body: ImportProductRecommendtaionDto) {
        const userId = (<{ id: string }>req.user).id;
        const token = req.headers.authorization.split(' ')[1];
        const fileUrl = body.file_url;

        const worksheet = await this.commonService.getWorkSheetByHTTP(fileUrl, token);
        const rows: any[] = [];

        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber > 1) rows.push(row.values); // Skip header row
        });

        const productCodes = rows.map((row) => row[1]).filter(Boolean); // Get all product codes
        const mainProducts: any = [];
        const variantProducts: any = [];

        rows.forEach((row) => {
            console.log(row[8]);
            if (!row[8]) {
                // Rows without product variant code
                mainProducts.push({
                    code: row[1] as string,
                    name: ((row[2] as string) || '').trim(),
                    link: row[3]?.text || row[3],
                    category: row[4] as string,
                    collection: row[5] as string,
                    routine: row[6] as string,
                    imageUrl: row[7]?.text || row[7],
                    shades: row[9] as string,
                    consultantId: userId,
                    updatedAt: new Date(),
                    createdAt: new Date(),
                });
            } else {
                variantProducts.push(row);
            }
        });

        // Save main products and map their IDs
        const savedMainProducts = await this.bulkSave(mainProducts);
        const mainProductsMap = new Map(savedMainProducts.map((product) => [product.code, product.id]));

        // Prepare variant products, linking main product IDs
        const newProducts = variantProducts.map((row: any) => ({
            code: row[1] as string,
            name: ((row[2] as string) || '').trim(),
            link: row[3]?.text || row[3],
            category: row[4] as string,
            collection: row[5] as string,
            routine: row[6] as string,
            imageUrl: row[7]?.text || row[7],
            shades: row[9] as string,
            productRecommendationId: mainProductsMap.get(row[8]) || null,
            consultantId: userId,
            updatedAt: new Date(),
            createdAt: new Date(),
        }));

        // Save variant products in bulk
        const filteredData: any = newProducts.filter((item: any) => item.code && item.name);
        await this.bulkSave(filteredData);
        // await this.bulkSave(newProducts);

        return { message: 'Data imported successfully' };
    }

    async importProduct(req: Request, body: ImportProductRecommendtaionDto, locale = 'en') {
        const token = req.headers.authorization.split(' ')[1];
        const fileUrl = body.file_url;

        const worksheet = await this.commonService.getWorkSheetByHTTP(fileUrl, token);
        const rows: any[] = [];

        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber > 1) rows.push(row.values); // Skip header row
        });

        let hasMainProducts = false;
        let hasVariantProducts = false;

        rows.forEach(async (row) => {
            if (!row[8]) {
                hasMainProducts = true;
            } else {
                hasVariantProducts = true;
            }
        });

        if (hasMainProducts && hasVariantProducts) {
            await this.importProductRecommendtaion(req, body);
            return { message: 'Updated Succesfull' };
        } else {
            await this.importProductRecommendtaionGeneral(req, body);
            return { message: 'Updated Succesfull' };
        }
        // Only call `importProductRecommendation` if both types are present
    }

    // async importProductTranslations(req: Request, body: ImportTranslationsDto, locale = 'en') {
    //     try {
    //         const splitToken = req.headers.authorization.split(' ');
    //         const token = splitToken[1];

    //         const fileUrl = body.file_url;
    //         const country = body.country;

    //         const worksheet = await this.commonService.getWorkSheetByHTTP(fileUrl, token);

    //         const headers = worksheet.getRow(1);

    //         const rowCount = worksheet.rowCount + 1;

    //         // const newBranches = [];

    //         // const diorConsultant = await this.consultantRepository.getDiorConsultant();

    //         // let rows = [];
    //         const productCode: string[] = [];
    //         for (let i = 2; i < rowCount; i++) {
    //             const rows = worksheet.getRow(i);
    //             const codeValue = rows.getCell(1).value;
    //             if (codeValue !== undefined) {
    //                 productCode.push(String(codeValue));
    //             }
    //         }

    //         const products = await this.productRecommendationRepository
    //             .createQueryBuilder('product')
    //             .where('product.code IN (:...codes)', { codes: productCode.map(String) })
    //             .getMany();

    //         const translationsToUpdate = [];
    //         const translationsToCreate = [];

    //         console.log('code', productCode);
    //         for (let i = 2; i < rowCount; i++) {
    //             console.log('======>', '======>', products);

    //             const row = worksheet.getRow(i);
    //             const productCode = row.getCell(1).value as string;
    //             const translationProductName = row.getCell(2).value as string;

    //             console.log(String(productCode));
    //             const product = products.find((p) => p.code === String(productCode));
    //             console.log('product ====>', product);

    //             // const product = diorConsultant?.productRecommendations.find((pr) => pr.code === productCode);
    //             if (product) {
    //                 let translation = await this.productTranslationsRepository.findOne({
    //                     where: {
    //                         productRecommendationId: product.id,
    //                         language: country,
    //                     },
    //                 });
    //                 // let translation = product.productTranslations.find(
    //                 //     (pt) => pt.fieldName === 'product_name' && pt.language === country,
    //                 // );

    //                 console.log('product', translation);

    //                 if (translation) {
    //                     translation.value = translationProductName;
    //                     translationsToUpdate.push(translation);
    //                 } else {
    //                     translationsToCreate.push(
    //                         this.productTranslationsRepository.create({
    //                             fieldName: 'product_name',
    //                             language: country,
    //                             value: translationProductName,
    //                             productRecommendationId: product.id,
    //                         }),
    //                     );
    //                 }
    //             }
    //         }

    //         const upTranslations = await this.productTranslationsRepository.save(translationsToUpdate);
    //         const creTranslation = await this.productTranslationsRepository.save(translationsToCreate);

    //         console.log('upTranslations ===>', upTranslations, 'creTranslation ===> ', creTranslation);

    //         return {
    //             message: 'Success import data',
    //         };
    //     } catch (e) {
    //         throw e;
    //     }
    // }

    async importProductTranslations(req: Request, body: ImportTranslationsDto, locale = 'en') {
        try {
            const token = req.headers.authorization.split(' ')[1];
            const { file_url: fileUrl, country } = body;

            // Fetch worksheet
            const worksheet = await this.commonService.getWorkSheetByHTTP(fileUrl, token);
            const rowCount = worksheet.rowCount + 1;

            // Collect product codes from worksheet rows
            const productCodes = [];
            for (let i = 2; i < rowCount; i++) {
                const codeValue = worksheet.getRow(i).getCell(1).value;
                if (codeValue !== undefined) {
                    productCodes.push(String(codeValue));
                }
            }

            // Fetch all products with given codes
            const products = await this.productRecommendationRepository
                .createQueryBuilder('product')
                .where('product.code IN (:...codes)', { codes: productCodes })
                .getMany();

            // Fetch existing translations for the provided country and product IDs
            const productIds = products.map((product) => product.id);
            const existingTranslations = await this.productTranslationsRepository.find({
                where: { productRecommendationId: In(productIds), language: country },
            });
            const translationMap = new Map(
                existingTranslations.map((t) => [`${t.productRecommendationId}_${country}`, t]),
            );

            // Prepare translations to create or update
            const translationsToUpdate = [];
            const translationsToCreate = [];
            for (let i = 2; i < rowCount; i++) {
                const row = worksheet.getRow(i);
                const productCode = row.getCell(1).value as string;
                const translationProductName = row.getCell(2).value as string;

                const product = products.find((p) => p.code === String(productCode));
                if (product) {
                    const key = `${product.id}_${country}`;
                    const existingTranslation = translationMap.get(key);

                    if (existingTranslation) {
                        existingTranslation.value = translationProductName;
                        translationsToUpdate.push(existingTranslation);
                    } else {
                        translationsToCreate.push(
                            this.productTranslationsRepository.create({
                                fieldName: 'product_name',
                                language: country,
                                value: translationProductName,
                                productRecommendationId: product.id,
                                createdAt: new Date(),
                                updatedAt: new Date(),
                            }),
                        );
                    }
                }
            }

            console.log('====>', translationsToUpdate, translationsToCreate);
            // Bulk save translations
            await this.productTranslationsRepository.save([...translationsToUpdate, ...translationsToCreate]);

            return { message: 'Success import data' };
        } catch (e) {
            throw e;
        }
    }

    async importCountries(req: Request, body: ImportCountriesDto) {
        try {
            const splitToken = req.headers.authorization.split(' ');
            const token = splitToken[1];

            const fileUrl = body.file_url;
            const country = body.country;

            const worksheet = await this.commonService.getWorkSheetByHTTP(fileUrl, token);

            const headers = worksheet.getRow(1);
            const rowCount = worksheet.rowCount + 1;

            for (let i = 2; i < rowCount; i++) {
                const row = worksheet.getRow(i);

                const productCode = row.getCell(1).value as string;
                const excludeInCountry = (row.getCell(2).value as string).toLocaleLowerCase() === 'y';

                const product = await this.productRecommendationRepository.findOne({
                    where: {
                        code: productCode,
                        consultantId: Not(IsNull()),
                    },
                });

                // if (product) {
                //     let productCountries = product.countries || [];
                //     if (excludeInCountry) {
                //         productCountries = productCountries.filter((c) => c !== country);
                //     } else {
                //         if (!productCountries.includes(country)) {
                //             productCountries.push(country);
                //         }
                //     }
                //     product.countries = productCountries;
                //     await this.productRecommendationRepository.save(product);
                // }

                if (product) {
                    let productCountries = product.countries || [];

                    if (excludeInCountry) {
                        productCountries = productCountries.filter((name) => name !== country);
                    } else {
                        if (!productCountries.includes(country)) {
                            productCountries.push(country);
                        }
                    }
                    product.countries = productCountries;

                    const fianal = await this.productRecommendationRepository.save(product);
                }
            }

            return {
                message: 'Success import data',
            };
        } catch (e) {
            throw e;
        }
    }

    async imageExists(url: string) {
        try {
            const response = await lastValueFrom(this.httpService.get(url, { responseType: 'arraybuffer' }));

            const contentType = response.headers['content-type'];

            console.log('response headers ===>', response.headers['content-disposition']);
            const fileName = response.headers['content-disposition'];

            // Check if the content type starts with "image"
            return { fileName: fileName, check: contentType.startsWith('image') };
        } catch (error) {
            console.log(error);
            // Handle any errors, such as invalid URL or non-image responses
            return { fileName: '', check: false };
        }
    }

    extractCodeFromFileName(fileName: string): string | null {
        const match = fileName.match(/filename="([A-Z0-9]+)\.png"/);
        return match ? match[1] : null;
    }
    async importPictures(body: ImportPicturesDto) {
        try {
            const fileUrls = body.file_url;

            const isArray = Array.isArray(fileUrls);

            const urlList = isArray ? fileUrls : [fileUrls];
            for (const fileUrl of urlList) {
                // Check if the file URL is a valid image
                const isValidImage = await this.imageExists(fileUrl);

                if (!isValidImage['check']) {
                    throw new BadRequestException('One of the file URLs is not a valid image!');
                }

                // Extract product code
                const fileName = isValidImage.fileName; // Get file name from URL
                if (!fileName) continue;
                const productCode = this.extractCodeFromFileName(fileName); // Remove first 36 characters to get code
                // Find product recommendation by code
                const product = await this.productRecommendationRepository.findOne({
                    where: {
                        code: productCode,
                    },
                });

                if (product) {
                    product.imageUrl = fileUrl;
                    // Update image URL if product exists
                    await this.productRecommendationRepository.update(product.id, { imageUrl: fileUrl });
                }
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

    async getProductRecommandationFileFromS3(hash: string) {
        try {
            const existFile = await this.presignRepository.findOne({
                where: {
                    key: hash,
                },
            });

            if (!existFile) {
                throw new NotFoundException({
                    result_code: ErrorStatus.NOT_FOUND,
                });
            }

            const s3Key = `${existFile.prefix}/${hash}${existFile.fileExtension}`;

            const s3File = await this.awsS3Service.getImageCloudS3(s3Key);

            return {
                binary: s3File.Body,
                mimeType: existFile.mimeType,
                fileName: existFile.fileName,
            };
        } catch (e) {
            throw e;
        }
    }

    async getPresignUpload(req: Request, file: Express.Multer.File) {
        try {
            const userId = (<{ id: string }>req.user).id;
            const { originalname: fileName, mimetype, buffer } = file;

            const allowedMimeTypeList = ['image/png', 'image/jpeg'];

            if (!allowedMimeTypeList.includes(mimetype)) {
                throw new BadRequestException({
                    result_code: ErrorStatus.BAD_REQUEST,
                });
            }
            const diorConsultant = await this.consultantRepository.getDiorConsultant();

            const prefix = `uploads/images/product_recommendations/${diorConsultant.id}`;

            const hash = uuid();
            const fileExtension = path.extname(fileName);
            const keyForS3 = `${hash}${fileExtension}`;

            const limit = 8 * 1024 * 1024;

            await this.awsS3Service.uploadFileToS3(buffer, keyForS3, prefix);

            const baseUrl = this.configService.get('URL') || 'http://localhost:3100';

            const downloadUrl = `${baseUrl}/api/dior/product_recommendations/files/${hash}`;

            await this.presignRepository.saveNewPresignEntity({
                hash: hash,
                fileName: fileName,
                fileExtension: fileExtension,
                downloadUrl: downloadUrl,
                mimeType: mimetype,
                prefix: prefix,
                consultantId: Number(userId),
            });

            return {
                url: downloadUrl,
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

    async bulkSave(products: ProductRecommendations[]) {
        return await this.productRecommendationRepository.save(products); // Bulk insert
    }

    async bulkUpdate(products: ProductRecommendations[]) {
        return await this.productRecommendationRepository.save(products); // Bulk update
    }

    async findByCodes(codes: string[]) {
        return await this.productRecommendationRepository.find({ where: { code: In(codes) } });
    }

    async findByCode(codes: string) {
        return await this.productRecommendationRepository.findOne({ where: { code: codes } });
    }
}

