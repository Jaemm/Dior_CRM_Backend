import { Injectable } from '@nestjs/common';

import {
    NotFoundException,
    BadRequestException,
    ConflictException,
    UnauthorizedException,
} from '@nestjs/common/exceptions';

import {
    ConsultantsRepository,
    ConsultantCountriesRepository,
    ConsultnatBranchesRepository,
    CustomersRepository,
    ProductAttributesRepository,
    ProductRecommendationRepository,
    ProductRecommendationSelectedRepository,
    ProductRecommendationGroupsRepository,
    ProductAttributeTranslationsRepository,
    ProductTranslationsRepository,
    ProductsRepository,
} from '@/src/common/repositories/crm';

import { Request } from 'express';

import {
    AttributeRoutine,
    AutomaticProductByBatchIdDto,
    CreateBranchesDto,
    CustomerByConsultantIdDto,
    GetRecommendationSelectedDto,
    SearchBranchesDto,
    SearchProductRecommendationDto,
    SearchProductRecommendationGroupsDto,
    SelectProductsDto,
    createCustomerDto,
} from './dior.dto';
import { ErrorStatus } from '@/src/common/constants/error-status';
import { ResponseMessages } from '@/src/common/constants/response-messages';
import {
    Consultants,
    ProductAttributes,
    ProductRecommendations,
    ProductTranslations,
} from '@/src/common/entities/crmEntities';
import { ErrorMessages } from '@/src/common/middleWare/exceptions/exceptionHandling/eum/errorMessages.enum';
import { AutomaticProductDiorGenerator } from './automatic-product-dior-generator';
import { Not } from 'typeorm';
import { CommonService } from '@/src/common/common.service';
import { ConsultantBranchesT, CountriesT } from '@/src/common/types/entities';
import { CustomersT } from '@/src/common/types/entities/customers.type';

@Injectable()
export class DiorService {
    constructor(
        private commonService: CommonService,

        // Repos
        private productsRepository: ProductsRepository,
        private consultantRepository: ConsultantsRepository,
        private consultantCountriesRepository: ConsultantCountriesRepository,
        private consultnatBranchesRepository: ConsultnatBranchesRepository,
        private customersRepository: CustomersRepository,
        private productAttributesRepository: ProductAttributesRepository,
        private paTranslationsRepository: ProductAttributeTranslationsRepository,
        private productRecommendationRepository: ProductRecommendationRepository,
        private prSelectedRepository: ProductRecommendationSelectedRepository,
        private prGroupsRepository: ProductRecommendationGroupsRepository,
        private productTranslationsRepository: ProductTranslationsRepository,
    ) {}

    async getCountries(search?: string) {
        try {
            const diorConsultantCompanyId = await this.consultantRepository.getDiorConsultantCompanyId();

            if (!diorConsultantCompanyId) {
                throw new NotFoundException({});
            }

            const countriesQuery = this.consultantCountriesRepository
                .createQueryBuilder('countries')
                .where('countries.consultant_company_id = :diorConsultantCompanyId', { diorConsultantCompanyId });

            if (search) {
                const likeSearch = `%${search}%`;
                countriesQuery.andWhere('(countries.code LIKE :search OR countries.name LIKE :search)', { likeSearch });
            }

            const countries = await countriesQuery.getMany();

            const reformatCountries: CountriesT[] = countries.map((country) => {
                const reformatData: CountriesT = {
                    id: Number(country.id),
                    name: country.name,
                    code: country.code,
                    url_and_port: country.urlAndPort,
                    default_recommendation: country.defaultRecommendation,
                };
                return reformatData;
            });

            return {
                data: reformatCountries,
            };
        } catch (e) {
            throw e;
        }
    }

    /** Branches */
    async getBranchesByConsultantsId(req: Request, locale = 'en') {
        try {
            const userId = (<{ id: string }>req.user).id;

            const currentConsultant = await this.consultantRepository.findOne({
                where: { id: Number(userId) },
                relations: ['consultant_branch'],
            });

            if (!currentConsultant) {
                throw new UnauthorizedException({
                    result_code: ErrorStatus.UNAUTHORIZED,
                    error: this.commonService.createLocaleErrorMessage(locale, 'unauthorized'),
                });
            }

            const branch = currentConsultant.consultant_branch;

            if (!branch) {
                throw new NotFoundException({
                    result_code: ErrorStatus.NOT_FOUND,
                });
            }

            const consultantsByBranch = await this.consultantRepository
                .createQueryBuilder('consultants')
                .where('consultants.email != :email OR consultants.email != :email2', {
                    email: 'ann.chowis613@gmail.com', // who is this...
                    email2: 'ann@chowis.com', // who is this...
                })
                .getMany();

            const data: {
                id: number;
                email: string;
                code: string;
                name: string;
                surname: string;
            }[] = consultantsByBranch.map((row) => {
                return {
                    id: row.id,
                    email: row.email,
                    code: row.code,
                    name: row.name,
                    surname: row.surname,
                };
            });

            return {
                data,
            };
        } catch (e) {
            throw e;
        }
    }

    async searchBranches(req: Request, query: SearchBranchesDto, locale = 'en') {
        try {
            const { filter_by: filterBy, search, country, page, per } = query;

            const userId = (<{ id: string }>req.user).id;
            // const userId = 8131;
            const currentConsultant = await this.consultantRepository.findOneBy({ id: Number(userId) });

            if (!currentConsultant) {
                throw new NotFoundException({
                    result_code: ErrorStatus.UNAUTHORIZED,
                    error: this.commonService.createLocaleErrorMessage(locale, 'unauthorized'),
                });
            }

            const consultantsPositionId = currentConsultant.consultant_position_id;

            const branchQuery = this.consultnatBranchesRepository.createQueryBuilder('branch');

            if (consultantsPositionId === 5) {
                branchQuery.andWhere('branch.consultant_company_id = :companyId', {
                    companyId: currentConsultant.consultant_company_id,
                });
            } else if ([4, 6].includes(consultantsPositionId)) {
                if (currentConsultant.countries.length < 1) {
                    throw new BadRequestException({
                        result_code: ErrorStatus.BAD_REQUEST,
                        error: `Cannot found your countires data. Please contact Admin`,
                    });
                }

                branchQuery.andWhere('LOWER(branch.country) IN (:...countries)', {
                    countries: currentConsultant?.countries.map((c) => c.toLowerCase()) || [0],
                });
            } else {
                if (!currentConsultant.consultant_branch || !currentConsultant.consultant_branch.country) {
                    throw new BadRequestException({
                        result_code: ErrorStatus.BAD_REQUEST,
                        error: `Cannot found your coutry data. Please contact Admin`,
                    });
                }
                branchQuery.andWhere('LOWER(branch.country) = :country', {
                    country: currentConsultant.consultant_branch?.country.toLowerCase(),
                });
            }

            if (filterBy) {
                branchQuery.andWhere('LOWER(branch.country) = :filterBy', { filterBy: filterBy.toLowerCase() });
            }

            if (country) {
                branchQuery.andWhere('LOWER(branch.country) = :country', { country: country.toLowerCase() });
            }

            if (search) {
                const searchLower = `%${search.toLowerCase()}%`;
                branchQuery.andWhere(
                    '(branch.country LIKE :search OR branch.code LIKE :search OR branch.name LIKE :search OR branch.email LIKE :search)',
                    { search: searchLower },
                );
            }

            const pageCondition = Number(page || 1);
            const perCondition = Number(per || 10);

            const [branches, total] = await branchQuery
                .skip((pageCondition - 1) * perCondition)
                .take(perCondition)
                .getManyAndCount();

            const reformatBranches: Promise<ConsultantBranchesT>[] = branches.map(async (branch) => {
                const totalDevices = await this.productsRepository.getNewOpticNumbersCountByBranch(branch.id);

                const reformatBranch: ConsultantBranchesT = {
                    id: Number(branch.id),
                    name: branch.name,
                    code: branch.code,
                    email: branch.email,
                    created_at: branch.createdAt,
                    country: branch.country,
                    password: branch.password,
                    total_devices: totalDevices,
                    last_consultation_date: null,
                };

                return reformatBranch;
            });

            return {
                data: await Promise.all(reformatBranches),
                total,
                currentPage: page,
                pageSize: branches.length,
                totalPages: Math.ceil(total / perCondition),
            };
        } catch (e) {
            throw e;
        }
    }

    async createBranches(req: Request, body: CreateBranchesDto) {
        try {
            const diorCompanyId = await this.consultantRepository.getDiorConsultantCompanyId();

            const { email, name, code, password, country } = body;

            if (!diorCompanyId) {
                throw new NotFoundException();
            }

            const newBranch = this.consultnatBranchesRepository.create({
                consultantCompanyId: String(diorCompanyId),
                email,
                name,
                password,
                country,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            const savedBranch = await this.consultnatBranchesRepository.save(newBranch);

            const reformatBranch: ConsultantBranchesT = {
                id: Number(savedBranch.id),
                name: savedBranch.name,
                code: savedBranch.code,
                email: savedBranch.email,
                created_at: savedBranch.createdAt,
                country: savedBranch.country,
                password: savedBranch.password,
                total_devices: 0,
                last_consultation_date: null,
            };

            return reformatBranch;
        } catch (e) {
            throw e;
        }
    }

    /** Customers */
    async getCustomers(query: CustomerByConsultantIdDto, locale = 'en') {
        try {
            const { consultant_id: consultantId, email } = query;

            const foundConsultant = await this.consultantRepository.getConsultantById(Number(consultantId));

            if (!foundConsultant) {
                throw new NotFoundException({
                    result_code: ErrorStatus.RECORD_NOT_FOUND,
                    errors: this.commonService.createLocaleErrorMessage(locale, 'record_not_found'),
                });
            }

            const customerByConsultantIdQuery = this.customersRepository
                .createQueryBuilder('customers')
                .where('customers.consultant_id = :consultantId', { consultantId });

            if (email) {
                customerByConsultantIdQuery.andWhere('customers.email LIKE :email', { email: `%${email}%` });
            }

            const customersByConsultant = await customerByConsultantIdQuery.getMany();

            const reformatCustomerList: CustomersT[] = customersByConsultant.map((customer) => {
                const reformatCustomer: CustomersT = {
                    id: customer.id,
                    email: customer.email,
                    name: customer.name,
                    surname: customer.surname,
                    os: customer.os,
                    language: customer.language,
                    phone: customer.phone,
                    birth: customer.birth,
                    address: customer.address,
                    city: customer.city,
                    state: customer.state,
                    zip_code: customer.zip_code,
                    country: customer.country,
                    notes: customer.notes,
                    push_token: customer.push_token,
                    app_id: customer.app_id,
                    company_id: customer.company_id,
                    consultant_id: customer.consultant_id,
                    skin_color_group_id: customer.skin_color_group_id,
                    ethnicity_id: customer.ethnicity_id,
                    gender: customer.gender,
                    sign_in_count: customer.sign_in_count,
                    image_url: customer.image_url,
                    external_id: customer.external_id,
                };

                return reformatCustomer;
            });

            return {
                data: reformatCustomerList,
            };
        } catch (e) {
            throw e;
        }
    }

    async createCustomers(body: createCustomerDto) {
        try {
            const { email, consultant_id, name, external_id, surname } = body;

            const existCustomer = await this.customersRepository.find({
                where: {
                    email: email,
                    consultant_id: Number(consultant_id),
                    external_id: external_id,
                },
            });

            if (existCustomer.length > 0) {
                throw new ConflictException({
                    result_code: 409,
                    error: `Data already Exists.`,
                });
            }

            const newCustomer = this.customersRepository.create({
                email: email,
                consultant_id: Number(consultant_id),
                name: name,
                external_id: external_id,
                surname: surname,
                created_at: new Date(),
                updated_at: new Date(),
            });

            const savedCustomer = await this.customersRepository.save(newCustomer);

            const reformatCustomer: CustomersT = {
                id: savedCustomer.id,
                email: savedCustomer.email,
                name: savedCustomer.name,
                surname: savedCustomer.surname,
                os: savedCustomer.os,
                language: savedCustomer.language,
                phone: savedCustomer.phone,
                birth: savedCustomer.birth,
                address: savedCustomer.address,
                city: savedCustomer.city,
                state: savedCustomer.state,
                zip_code: savedCustomer.zip_code,
                country: savedCustomer.country,
                notes: savedCustomer.notes,
                push_token: savedCustomer.push_token,
                app_id: savedCustomer.app_id,
                company_id: savedCustomer.company_id,
                consultant_id: savedCustomer.consultant_id,
                skin_color_group_id: savedCustomer.skin_color_group_id,
                ethnicity_id: savedCustomer.ethnicity_id,
                gender: savedCustomer.gender,
                sign_in_count: savedCustomer.sign_in_count,
                image_url: savedCustomer.image_url,
                external_id: savedCustomer.external_id,
            };

            return reformatCustomer;
        } catch (e) {
            throw e;
        }
    }

    async getProductRecommendationGroups(query: SearchProductRecommendationGroupsDto) {
        try {
            const { search, page, per } = query;

            const diorConsultant = await this.consultantRepository.getDiorConsultantCompanyId();

            if (!diorConsultant) {
                throw new NotFoundException({
                    result_code: ErrorStatus.NOT_FOUND,
                    error: `Cannot Found Dior Consultant`,
                });
            }

            const prGroupsQuery = this.prGroupsRepository
                .createQueryBuilder('prGroups')
                .where('prGroups.name ILIKE :search', {
                    search: `%${search}%`,
                })
                .leftJoinAndSelect('prGroups.prSelecteds', 'prSelecteds')
                .leftJoinAndSelect('prSelecteds.productRecommendation', 'productRecommendation');

            const searchPage = Number(page || 1);
            const searchPer = Number(per || 10);

            const [prGroups, totalCount] = await prGroupsQuery
                .skip((searchPage - 1) * searchPage)
                .take(searchPer)
                .getManyAndCount();

            const data = prGroups.map((group) => ({
                id: group.id,
                name: group.name,
                countries: group.countries,
                products: group.prSelecteds
                    .sort((a, b) => a.orderNumber - b.orderNumber)
                    .map((selected) => {
                        const product = selected.productRecommendation;
                        return product
                            ? {
                                  id: product.id,
                                  name: product.name,
                                  product_type: product.productType,
                                  description: product.description,
                                  link: product.link,
                                  image_url: product.imageUrl,
                                  category: product.category,
                                  routine: product.routine,
                                  code: product.code,
                                  collection: product.collection,
                                  is_principal: selected.isPrincipal,
                              }
                            : null;
                    })
                    .filter((product) => product !== null),
            }));

            return {
                data: data,
                total_size: totalCount,
                current_page_size: prGroups.length,
                current_page: searchPage,
                total_pages: Math.ceil(totalCount / searchPer),
            };
        } catch (e) {
            throw e;
        }
    }

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
