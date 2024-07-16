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
import { ProductAttributes } from '@/src/common/entities/crmEntities';
import { Not } from 'typeorm';
import { AutomaticProductDiorGenerator } from '../automatic-product-dior-generator';
import { CreateProductRecommendationDto, ImportProductRecommendtaionDto } from './product_recommendation.dto';
import { ProductRecommendationT, ProductTranslationT } from '@/src/common/types/entities';

@Injectable()
export class ProductRecommendationService {
    constructor(
        private readonly commonService: CommonService,

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
                    id: variant.id,
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
                id: foundRecommendtaion.id,
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
        body: CreateProductRecommendationDto,
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
                    id: variant.id,
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
                id: foundRecommendtaion.id,
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
                    id: variant.id,
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
                id: savedProductRecommendation.id,
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

            const market = await this.consultantCountriesRepository
                .createQueryBuilder('contries')
                .where('Lower(contries.name) = :name', { name: query.market.toLocaleLowerCase() })
                .getOne();

            if (!market) {
                throw new NotFoundException();
            }

            const recommended = market.defaultRecommendation.toLocaleLowerCase();

            const generatorCreateParameter = {
                dior_consultant: diorConsultant,
                skin_tone: query.skin_tone,
                routine_recommendation: query.routine_recommendation,
                market: query.market,
                recommended: recommended,
                answers: query.answers,
                old: true,
            };

            const automaticProductDiorGenerator = new AutomaticProductDiorGenerator(
                generatorCreateParameter,
                this.prGroupsRepository,
            );

            const psSelecteds = await automaticProductDiorGenerator.questionAnswers();

            const data = psSelecteds
                .sort((a, b) => a.orderNumber - b.orderNumber)
                .map(async (productRecommendationSelected) => {
                    let productRecommendation = productRecommendationSelected.productRecommendation;

                    const productTranslations = await this.productTranslationsRepository.find({
                        where: {
                            productRecommendationId: productRecommendation.id,
                        },
                    });

                    for (let i = 0; i < productTranslations.length; i++) {
                        const translation = productTranslations[i];
                        const productRecomm = await this.productRecommendationRepository.findOneBy({
                            id: translation.productRecommendationId,
                        });

                        translation.productRecommendations = productRecomm;
                    }

                    productRecommendation.productTranslations = productTranslations;

                    if (productRecommendation) {
                        if (productRecommendation.routine === 'Makeup') {
                            productRecommendation = productRecommendation.getSkinToneFromProduct(query.skin_tone);
                        }

                        const jsonProductRecommendation = {
                            id: productRecommendation.id,
                            product_type: productRecommendation.productType,
                            description: productRecommendation.description,
                            link: productRecommendation.link,
                            image_url: productRecommendation.imageUrl,
                            code: productRecommendation.code,
                            routine: productRecommendation.routine,
                            collection: productRecommendation.collection,
                            category: productRecommendation.category,
                            countries: productRecommendation.countries,
                            product_recommendation_id: productRecommendation.productRecommendationId,
                            name: null as string,
                            is_principal: null as boolean,
                            shades: null as string,
                            collection_shades: null as any,
                            product_translations: [] as any[],
                            category_translations: [] as any[],
                            collection_translations: [] as any[],
                            product_variants: [] as any[],
                        };

                        if (productRecommendation.productRecommendationId) {
                            const _productRecommendation = await this.productRecommendationRepository.findOneBy({
                                id: String(productRecommendation.productRecommendationId),
                            });
                            jsonProductRecommendation.name = _productRecommendation.name;
                        } else {
                            jsonProductRecommendation.name = productRecommendation.name;
                        }

                        jsonProductRecommendation.is_principal = productRecommendationSelected.isPrincipal;

                        if (productRecommendation.productVariants.length > 0) {
                            jsonProductRecommendation.shades = 'Select Shade';
                        } else {
                            jsonProductRecommendation.shades = productRecommendation.shades;
                        }

                        jsonProductRecommendation.collection_shades =
                            await this.productRecommendationRepository.findOne({
                                where: {
                                    collection: productRecommendation.collection,
                                    shades: Not(null),
                                },
                            });

                        jsonProductRecommendation.product_translations = await Promise.all(
                            productRecommendation.productTranslations.map(async (translation) => {
                                const productRecomm = translation.productRecommendations;

                                const category = productRecomm?.category;
                                const collection = productRecomm?.collection;

                                let attributeName;
                                let collectionName;

                                if (category) {
                                    const attribute = await this.productAttributesRepository.findOneBy({
                                        value: category,
                                    });

                                    if (attribute) {
                                        attributeName = await this.paTranslationsRepository.findOneBy({
                                            productAttributeId: Number(attribute.id),
                                            language: translation.language,
                                        });
                                    }
                                }

                                if (collection) {
                                    const attribute = await this.productAttributesRepository.findOneBy({
                                        value: collection,
                                    });

                                    if (attribute) {
                                        collectionName = await this.paTranslationsRepository.findOneBy({
                                            productAttributeId: Number(attribute.id),
                                            language: translation.language,
                                        });
                                    }
                                }

                                return {
                                    id: translation.id,
                                    field_name: translation.fieldName,
                                    language: translation.language,
                                    value: translation.value,
                                    attribute_name: attributeName,
                                    collection_name: collectionName,
                                };
                            }),
                        );

                        jsonProductRecommendation.category_translations = await Promise.all(
                            (
                                (
                                    await this.productAttributesRepository.findOne({
                                        where: { typ: 'Category', value: productRecommendation.category },
                                        relations: ['productAttributeTranslations'],
                                    })
                                ).productAttributeTranslations || []
                            ).map((translation: any) => ({
                                id: translation.id,
                                field_name: translation.fieldName,
                                language: translation.language,
                                value: translation.value,
                            })),
                        );

                        jsonProductRecommendation.collection_translations = await Promise.all(
                            (
                                (
                                    await this.productAttributesRepository.findOne({
                                        where: {
                                            typ: 'Collection',
                                            value: productRecommendation.collection,
                                        },
                                        relations: ['productAttributeTranslations'],
                                    })
                                )?.productAttributeTranslations || []
                            ).map((translation: any) => ({
                                id: translation.id,
                                field_name: translation.fieldName,
                                language: translation.language,
                                value: translation.value,
                            })),
                        );

                        jsonProductRecommendation.product_variants = productRecommendation.productVariants.map(
                            (productVariant) => ({
                                id: productVariant.id,
                                name: productVariant.name,
                                product_type: productVariant.productType,
                                description: productVariant.description,
                                link: productVariant.link,
                                image_url: productVariant.imageUrl,
                                code: productVariant.code,
                                routine: productVariant.routine,
                                collection: productVariant.collection,
                                category: productVariant.category,
                                countries: productVariant.countries,
                                product_recommendation_id: productVariant.productRecommendationId,
                                shades: productVariant.shades,
                            }),
                        );

                        return jsonProductRecommendation;
                    }
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
        //  0 - Product Code
        //  1 - Product Name
        //  2 - Product Link
        //  3 - Category
        //  4 - Collection
        //  5 - Axis
        //  6 - Image URL
        //  7 - Product Variant Code
        //  8 - Shades

        try {
            const diorConsultant = await this.consultantRepository.getDiorConsultant();

            const fileUrl = body.file_url;

            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.readFile(fileUrl);
            const worksheet = workbook.getWorksheet(1);

            const rowCount = worksheet.rowCount;

            for (let i = 2; i < rowCount; i++) {
                const row = worksheet.getRow(i);

                const productCode = row.getCell(8).value as string;
                const productVariant = productCode
                    ? await this.productRecommendationRepository.findOne({ where: { code: productCode } })
                    : null;

                const newProduct = this.productRecommendationRepository.create({
                    code: row.getCell(1).value as string,
                    name: (row.getCell(2).value as string).trim(),
                    link: row.getCell(3).value as string,
                    category: row.getCell(4).value as string,
                    collection: row.getCell(5).value as string,
                    routine: row.getCell(6).value as string,
                    imageUrl: row.getCell(7).value as string,
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
