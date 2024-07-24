import { Request } from 'express';
import * as moment from 'moment';

import { Module, UnauthorizedException, Injectable, BadRequestException } from '@nestjs/common';
import { GetOverAllDetailsDto, GetOverAllDto, GetStatDetailsDto } from './statistics.dto';
import {
    ConsultantBranchesRepository,
    ConsultantCountriesRepository,
    ConsultantsRepository,
    CustomersRepository,
    DevicesRepository,
    ProductAttributeTranslationsRepository,
    ProductAttributesRepository,
    ProductRecommendationRepository,
    ProductRecommendationSelectedRepository,
    ProductTranslationsRepository,
    ProductsRepository,
    SalesConnectionRepository,
} from '@/src/common/repositories/crm';
import { ErrorStatus } from '@/src/common/constants/error-status';
import { PositionsIds } from '@/src/common/enums/position.enum';
import { Equal, ILike, In, IsNull, Not, Or } from 'typeorm';
import { AnalysisDataReplicationModule } from '../../dataReplication/analysisDataReplication/analysisDataReplication.module';
import { AnalysisDataReplicationService } from '../../dataReplication/analysisDataReplication/analysisDataReplication.service';
import { ConsultantBranches, Consultants, Devices } from '@/src/common/entities/crmEntities';
import { when } from 'joi';
import { count } from 'console';
import { ProductRecommendationForDiorT, ProductRecommendationVariantForDiorT } from '@/src/common/types/entities';
import { ProductTranslationForDiorT } from '@/src/common/types/entities/product_translations.type';

@Injectable()
export class StatisticsService {
    constructor(
        private analysisDataReplicationService: AnalysisDataReplicationService,

        // Repos
        private readonly consultantCountriesRepository: ConsultantCountriesRepository,
        private readonly consultantRepository: ConsultantsRepository,
        private readonly consultantBranchesRepository: ConsultantBranchesRepository,
        private readonly customerRepository: CustomersRepository,
        private readonly salesConnRepository: SalesConnectionRepository,
        private readonly branchesRepository: ConsultantBranchesRepository,
        private readonly devicesRepository: DevicesRepository,
        private readonly productRepository: ProductsRepository,

        private readonly productAttributesRepository: ProductAttributesRepository,
        private readonly productAttributeTranslationsRepository: ProductAttributeTranslationsRepository,
        private readonly productTranslationsRepository: ProductTranslationsRepository,
        private readonly productRecommendationRepository: ProductRecommendationRepository,

        private readonly prSelectedsRepository: ProductRecommendationSelectedRepository,
    ) {}

    async getOverAll(req: Request, query: GetOverAllDto, locale: string = 'en') {
        try {
            const { start_date, end_date } = query;

            const userId = (<{ id: string }>req.user).id;
            const currentConsultant = await this.consultantRepository.getConsultantById(userId, ['consultant_branch']);
            const diorCompanyId = await this.consultantRepository.getDiorConsultantCompanyId();

            if (!currentConsultant) {
                throw new UnauthorizedException({
                    resule_code: ErrorStatus.UNAUTHORIZED,
                });
            }

            const salesConnQuery = this.salesConnRepository
                .createQueryBuilder('salesConn')
                .select('COUNT(DISTINCT salesConn.batchId)', 'count')
                .where('salesConn.batchId IS NOT NULL');

            if (start_date && end_date) {
                salesConnQuery.andWhere(`salesConn.createdAt BETWEEN ${start_date} 00:00:00 AND ${end_date} 23:59:59`);
            }

            const { count: totalSalesConnections } = await salesConnQuery.getRawOne();

            const branchQuery = await this.branchesRepository
                .createQueryBuilder('branches')
                .where('branches.consultantCompanyId = :diorCompanyId', {
                    diorCompanyId,
                });

            if (start_date && end_date) {
                branchQuery.andWhere(`branches.createdAt BETWEEN ${start_date} 00:00:00 AND ${end_date} 23:59:59`);
            }

            const diorBranches = await branchQuery.getMany();
            const diorDevices = await this.devicesRepository.findBy({ consultant_company_id: diorCompanyId });

            let consultants: Consultants[] = [];
            let devices: Devices[] = [];
            let branches: Consultants[] = [];
            let consultation;
            let customer;
            let totalClients;
            let products;
            if ([PositionsIds.BRAND_MANAGER, PositionsIds.ADMIN].includes(currentConsultant.consultant_position_id)) {
                const consultantQuery = await this.consultantRepository
                    .createQueryBuilder('consultants')
                    .where('consultants.id NOT IN (:...ids)', {
                        ids: [11156, 9304],
                    });
                if (PositionsIds.ADMIN === Number(currentConsultant.consultant_position_id)) {
                    consultantQuery.andWhere('LOWER (consultants.country) IN (:...countries)', {
                        countries: currentConsultant.countries.map((country) => country.toLocaleLowerCase()),
                    });
                } else if (PositionsIds.BRAND_MANAGER === Number(currentConsultant.consultant_position_id)) {
                    consultantQuery.andWhere('LOWER (consultants.country) = :country', {
                        country: currentConsultant.consultant_branch?.country?.toLocaleLowerCase(),
                    });
                }
                consultants = await consultantQuery.getMany();

                const deviceQuery = this.productRepository
                    .createQueryBuilder('products')
                    .select('DISTINCT (products.deviceId)', 'deviceIds')
                    .where('products.consultantId IN (:...consultantIds)', {
                        consultantIds: consultants.map((consultant) => consultant.id),
                    });

                const { deviceIds } = await deviceQuery.getRawOne();
                devices = deviceIds;

                const [cus, total] = await this.customerRepository.findAndCount({
                    where: {
                        consultant_id: In(consultants.map((consultant) => consultant.id)),
                    },
                });
                customer = cus;
                totalClients = total;

                const branchQuery = this.consultantRepository
                    .createQueryBuilder('consultants')
                    .select('DISTINCT (.consultant_branch_id)', 'branchId')
                    .leftJoinAndSelect('consultants.consultant_branch', 'consultant_branch')
                    .where('consultants.id IN (:...consultantIds)', {
                        consultantIds: consultants.map((consultant) => consultant.id),
                    });
                if (start_date && end_date) {
                    branchQuery.andWhere(`consultant_branch.created_at BETWEEN ${start_date} AND ${end_date}`);
                }

                branches = await branchQuery.getMany();
                consultation = await this.analysisDataReplicationService.getConsultationByConsultant(consultants);
            } else if (PositionsIds.SUPER_ADMIN === Number(currentConsultant.consultant_position_id)) {
                consultants = await this.consultantRepository
                    .createQueryBuilder('consultants')
                    .where('consultants.consultant_branch_id IN (:...branchIds)', {
                        branchIds: diorBranches.map((branch) => branch.id),
                    })
                    .andWhere('consultants.id NOT IN (:...ids)', {
                        ids: [11156, 9304],
                    })
                    .getMany();

                const customerQuery = this.customerRepository.createQueryBuilder('customers');

                if (start_date && end_date) {
                    customerQuery.andWhere(
                        `customers.created_at BETWEEN ${start_date} 00:00:00 AND ${end_date} 23:59:59`,
                    );
                }

                const [customerList, total] = await customerQuery.getManyAndCount();

                totalClients = total;
                customer = customerList;

                consultation = await this.analysisDataReplicationService.getConsultantions();

                products = await this.productRepository.find({
                    where: {
                        consultant_id: In(consultants.map((consultant) => consultant.id)),
                    },
                });

                devices = await this.devicesRepository.find({
                    where: {
                        id: In(products.map((product) => product.device_id)),
                    },
                });
                devices = await this.devicesRepository
                    .createQueryBuilder('devices')
                    .where('devices.id IN (:...ids)', {
                        ids: devices.map((d) => d.id),
                    })
                    .orWhere('devices.id IN (:...ids)', {
                        ids: diorDevices.map((d) => d.id),
                    })
                    .getMany();
            } else {
                totalClients = 0;
                consultation = [];
                devices = [];
                branches = [];
            }

            if (Number(currentConsultant.consultant_position_id) === 6) {
                const branchs = await this.branchesRepository.find({
                    where: {
                        consultantCompanyId: String(diorCompanyId),
                    },
                });

                const consults = await this.consultantRepository.find({
                    where: {
                        consultant_branch_id: In(branchs.map((b) => b.id)),
                    },
                });

                const prods = await this.productRepository.find({
                    where: {
                        consultant_id: In(consults.map((c) => c.id)),
                    },
                });

                const devicess = await this.devicesRepository.find({
                    where: {
                        id: In(prods.map((p) => p.id)),
                    },
                });

                devices = await this.devicesRepository
                    .createQueryBuilder('devices')
                    .where('devices.id IN (:...ids)', {
                        ids: devices.map((d) => d.id),
                    })
                    .orWhere('devices.id IN (:...ids)', {
                        ids: devicess.map((d) => d.id),
                    })
                    .getMany();
            }

            const deviceQuery = this.devicesRepository
                .createQueryBuilder('devices')
                .where('devices.optic_number NOT IN (:...opticNumbers)', {
                    opticNumbers: ['FAB02135', 'FAB02363', 'FAB02709', 'DVAA4496'],
                })
                .andWhere('devices.id IN (:...ids)', {
                    ids: devices.map((d) => d.id),
                });

            if (start_date && end_date) {
                deviceQuery.andWhere(`devices.refresh_date BETWEEN ${start_date} 00:00:00 AND ${end_date} 23:59:59`);
            }

            devices = await deviceQuery.getMany();

            return {
                total_clients: totalClients,
                total_consultations: consultation.length,
                total_analysis: consultants.length,
                consultation_time: 73.5,
                total_devices: devices.length,
                total_branches: branches.length,
                total_offline_consultations: totalSalesConnections,
            };
        } catch (e) {
            throw e;
        }
    }

    async getOverAllDetails(req: Request, query: GetOverAllDetailsDto) {
        try {
            const diorCompanyId = await this.consultantRepository.getDiorConsultantCompanyId();

            const consultantCountries = await this.consultantCountriesRepository.find({
                where: {
                    consultantCompanyId: diorCompanyId,
                },
            });

            const data: {
                name: string;
                total: number;
                branches_info: any;
            }[] = [];

            for (let i = 0; i < consultantCountries.length; i++) {
                const country = consultantCountries[i];

                const countryBranches = await this.branchesRepository.find({
                    where: {
                        country: country.name,
                    },
                });

                let perCountry = 0;
                let customerPerBranch = 0;
                const branchesInfo = [];

                for (let j = 0; j < countryBranches.length; j++) {
                    const branch = countryBranches[j];

                    const consultants = await this.consultantRepository.find({
                        where: {
                            consultant_branch_id: Number(branch.id),
                        },
                    });

                    const customers = await this.customerRepository.find({
                        where: {
                            consultant_id: In(consultants.map((c) => c.id)),
                        },
                    });

                    if (query.type === 'overall-consultations') {
                        const consultationCount =
                            await this.analysisDataReplicationService.getConsultationCountByCustomerId(customers);
                        branchesInfo.push({
                            name: branch.name,
                            total: consultationCount,
                        });
                        perCountry = perCountry + consultationCount;
                    }
                }

                data.push({
                    name: country.name,
                    total: perCountry,
                    branches_info: branchesInfo,
                });
            }

            return data;
        } catch (e) {
            throw e;
        }
    }

    async getOverAllPerCountry(req: Request) {
        try {
            const diorCompanyId = await this.consultantRepository.getDiorConsultantCompanyId();

            const countries = await this.consultantCountriesRepository.find({
                where: {
                    consultantCompanyId: diorCompanyId,
                },
            });

            const promiseDataList = countries.map(async (country) => {
                const countryBranches = await this.branchesRepository.find({
                    where: {
                        country: country.name,
                    },
                });

                const consultants = await this.consultantRepository.find({
                    where: {
                        consultant_branch_id: In(countryBranches.map((branch) => branch.id)),
                    },
                });

                const [customers, customerCount] = await this.customerRepository.findAndCount({
                    where: {
                        consultant_id: In(consultants.map((consultant) => consultant.id)),
                    },
                });

                const consultationCount = await this.analysisDataReplicationService.getConsultationCountByCustomerId(
                    customers,
                );

                return {
                    country: country.name,
                    total_customers: customerCount,
                    total_consultations: consultationCount,
                    total_qr_codes: consultationCount,
                };
            });

            return {
                data: await Promise.all(promiseDataList),
            };
        } catch (e) {
            throw e;
        }
    }

    async getOverAllByDate() {
        try {
            let currentTime = moment().startOf('year');

            const diorCompanyId = await this.consultantRepository.getDiorConsultantCompanyId();

            const data = [];

            for (let i = 0; i <= 11; i++) {
                const startDate = currentTime.clone().startOf('month').toDate();
                const endDate = currentTime.clone().endOf('month').toDate();

                const consultantIds = await this.consultantRepository
                    .createQueryBuilder('consultant')
                    .where('consultant.consultant_company_id = :companyId', { companyId: diorCompanyId })
                    .getMany()
                    .then((consultants) => consultants.map((consultant) => consultant.id));

                const customers = await this.customerRepository
                    .createQueryBuilder('customer')
                    .where('customer.consultant_id IN (:...consultantIds)', { consultantIds })
                    .andWhere('customer.created_at BETWEEN :startDate AND :endDate', { startDate, endDate })
                    .getMany();

                const consultationCount = await this.analysisDataReplicationService.getConsultationCountByCustomerId(
                    customers,
                );

                data.push({
                    month: currentTime.format('MMMM'),
                    total_customers: customers.length,
                    total_consultations: consultationCount,
                    total_qr_codes: consultationCount,
                });

                currentTime = currentTime.add(1, 'month');
            }

            return data;
        } catch (e) {
            throw e;
        }
    }

    async getMostPopularProducts() {
        try {
            const productSelectedGrouped = await this.prSelectedsRepository
                .createQueryBuilder('prs')
                .select('prs.productRecommendationId, COUNT(prs.productRecommendationId) as count')
                .groupBy('prs.productRecommendationId')
                .orderBy('count', 'DESC')
                .limit(20)
                .getRawMany();

            const first20ProductIds = productSelectedGrouped.map((prs) => prs.product_recommendation_id);

            const productRecommendations = await this.productRecommendationRepository.find({
                where: {
                    id: In(first20ProductIds),
                },
                relations: ['productVariants'],
            });

            console.log(productRecommendations);

            const reformatPromise: Promise<any>[] = productRecommendations.map(async (recommendations) => {
                const shades = recommendations.getShade();

                let refRecommendation;
                let name: string | null = null;
                let collectionShades: string[] | null = [];
                let productTranslations: ProductTranslationForDiorT[] = [];
                let categoryTranslations: any[] = [];
                let collectionTranslations: any[] = [];
                let productVariants: ProductRecommendationVariantForDiorT[] = [];
                if (recommendations.productRecommendationId) {
                    refRecommendation = await this.productRecommendationRepository.findOne({
                        where: {
                            id: String(recommendations.productRecommendationId),
                        },
                    });

                    name = refRecommendation.name;
                }

                // collection shades
                const recommShadeList = await this.productRecommendationRepository.find({
                    select: ['shades'],
                    where: {
                        collection: recommendations.collection,
                        shades: Not(null),
                    },
                });
                collectionShades = recommShadeList.map((recomm) => recomm.shades);
                // collection_shades END

                // product translations START
                if (refRecommendation || recommendations) {
                    const oneOfRecomm = refRecommendation || recommendations;

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
                            value: recommendations.category,
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
                            value: recommendations.category,
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

                productVariants = recommendations.productVariants
                    ? recommendations.productVariants.map((variants) => {
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
                    id: recommendations.id,
                    product_type: recommendations.productType,
                    description: recommendations.description,
                    link: recommendations.link,
                    image_url: recommendations.imageUrl,
                    code: recommendations.code,
                    routine: recommendations.routine,
                    collection: recommendations.collection,
                    category: recommendations.category,
                    countries: recommendations.countries,
                    product_recommendation_id: recommendations.productRecommendationId,
                    name: name,
                    shades: shades,
                    collection_shades: collectionShades,
                    product_translations: productTranslations,
                    category_translations: categoryTranslations,
                    collection_translations: collectionTranslations,
                    product_variants: productVariants,
                };
            });

            return await Promise.all(reformatPromise);
        } catch (e) {
            throw e;
        }
    }

    async getStatDetails(req: Request, query: GetStatDetailsDto, locale = 'en') {
        try {
            const userId = (<{ id: string }>req.user).id;
            const { start_date, end_date, stat_type } = query;

            if (!stat_type) {
                throw new BadRequestException({
                    result_code: ErrorStatus.CUSTOM_ERROR,
                    error: 'The stat_type does not exist.',
                });
            }

            const currentConsultant = await this.consultantRepository.getConsultantById(userId, ['consultant_branch']);

            const diorCompanyId = await this.consultantRepository.getDiorConsultantCompanyId();

            let consultants;
            if (currentConsultant.consultant_position_id === PositionsIds.ADMIN) {
                consultants = await this.consultantRepository.find({
                    where: {
                        country: In(currentConsultant.countries.map((c) => c.toLowerCase())),
                        consultant_company_id: diorCompanyId,
                    },
                });
            } else if (currentConsultant.consultant_position_id === PositionsIds.BRAND_MANAGER) {
                consultants = await this.consultantRepository.find({
                    where: {
                        country: currentConsultant.consultant_branch.country.toLowerCase(),
                        consultant_company_id: diorCompanyId,
                    },
                });
            }

            let data: any = {};

            if (stat_type === 'stores') {
                const branchQuery = await this.consultantBranchesRepository.createQueryBuilder('branch');
                if (
                    [PositionsIds.ADMIN, PositionsIds.BRAND_MANAGER].includes(
                        Number(currentConsultant.consultant_position_id),
                    )
                ) {
                    const consultantsCaseStore = await this.consultantRepository.find({
                        where: { id: currentConsultant.id },
                    });
                    branchQuery.where('branch.id IN (:...ids)', {
                        ids: consultantsCaseStore.map((consultant) => consultant.consultant_branch_id),
                    });
                } else if (Number(currentConsultant.consultant_position_id) === PositionsIds.SUPER_ADMIN) {
                    branchQuery.where('branch.consultant_company_id = :companyId', {
                        companyId: diorCompanyId,
                    });
                }

                if (start_date && end_date) {
                    branchQuery.andWhere(`branch.created_at BETWEEN ${start_date} 00:00:00 AND ${end_date} 23:59:59`);
                }

                const branches = await branchQuery.getMany();

                const countries = (
                    await this.consultantCountriesRepository.find({
                        select: ['name'],
                        where: {
                            consultantCompanyId: diorCompanyId,
                        },
                    })
                ).map((c) => c.name);

                const countryBranchCounts: { [country: string]: number } = {};
                for (const country of countries) {
                    const branchQuery = this.consultantBranchesRepository
                        .createQueryBuilder('branch')
                        .select('COUNT(*) AS count_all')
                        .where('branch.country = :country', { country });

                    if (start_date && end_date) {
                        branchQuery.andWhere(
                            `branch.createdAt BETWEEN ${start_date} 00:00:00 AND ${end_date} 23:59:59`,
                        );
                    }

                    const count = await branchQuery.getRawOne();
                    countryBranchCounts[country] = count;
                }

                if (countryBranchCounts['']) {
                    countryBranchCounts['unknown_country'] = countryBranchCounts[''];
                    delete countryBranchCounts[''];
                }

                if (countryBranchCounts['null']) {
                    countryBranchCounts['unknown_country'] =
                        (countryBranchCounts['unknown_country'] || 0) + countryBranchCounts['null'];
                    delete countryBranchCounts['null'];
                }

                data = {
                    total_count: branches.length,
                    data: countryBranchCounts,
                };
            } else if (stat_type === 'devices') {
                let devices: Devices[] = [];

                const deviceQuery = await this.devicesRepository.createQueryBuilder('devices');
                if (currentConsultant.consultant_position_id === PositionsIds.BRAND_MANAGER) {
                    const consultants = await this.consultantRepository.find({
                        where: { id: Not(In([11156, 9304])) },
                    });

                    if (consultants.length > 0) {
                        const productDevices = await this.productRepository.find({
                            where: {
                                consultant_id: In(consultants.map((c) => c.id)),
                            },
                        });

                        deviceQuery
                            .andWhere('devices.consultant_company_id = :companyId', {
                                companyId: diorCompanyId,
                            })
                            .andWhere('devices.id IN (:...ids)', {
                                ids: productDevices.map((p) => p.id),
                            });
                    }
                } else if (
                    [PositionsIds.BRAND_MANAGER, PositionsIds.ADMIN].includes(currentConsultant.consultant_position_id)
                ) {
                    deviceQuery.andWhere('devices.consultant_company_id = :companyId', {
                        companyId: diorCompanyId,
                    });
                }

                deviceQuery.andWhere('devices.optic_number NOT IN (:...excludeList)', {
                    excludeList: ['FAB02135', 'FAB02363', 'FAB02709', 'DVAA4496'],
                });

                if (start_date && end_date) {
                    deviceQuery.andWhere(
                        `devices.refresh_date BETWEEN ${start_date} 00:00:00 AND ${end_date} 23:59:59`,
                    );
                }

                devices = await deviceQuery.getMany();

                const countryList = (
                    await this.consultantCountriesRepository.find({
                        where: {
                            consultantCompanyId: diorCompanyId,
                        },
                    })
                ).map((c) => c.code);

                const jsonData: { [country: string]: number } = {};
                for (const country of countryList) {
                    const countQuery = this.devicesRepository
                        .createQueryBuilder('devices')
                        .where('devices.consultant_company_id = :companyId', {
                            companyId: diorCompanyId,
                        });
                    if (!country || country === '') {
                        countQuery.andWhere("(devices.country_code IS NULL OR devices.country_code = '' )");
                    } else {
                        countQuery.andWhere('LOWER(devices.country_code) = :country', {
                            country: country.toLocaleLowerCase(),
                        });
                    }

                    const count = await countQuery.getCount();

                    jsonData[country] = count;
                }
                const unknownQuery = this.devicesRepository.createQueryBuilder('device');

                if (start_date && end_date) {
                    unknownQuery.andWhere(
                        `device.refresh_date BETWEEN ${start_date} 00:00:00 AND ${end_date} 23:59:59`,
                    );
                }

                jsonData['unknown_country'] = await unknownQuery
                    .where("device.country_code IS NULL OR device.country_code = ''")
                    .getCount();

                data = {
                    total_count: devices.length,
                    data: jsonData,
                };
            } else if (stat_type === 'consultations') {
                const countries = (
                    await this.consultantCountriesRepository.find({
                        where: {
                            consultantCompanyId: diorCompanyId,
                        },
                    })
                ).map((c) => c.name);

                const consultantIdArray = (
                    await this.analysisDataReplicationService.getConsultantIds(start_date, end_date)
                ).map((c: any) => c.consultantId);

                const consultantIds = [...new Set(consultantIdArray)];

                const jsonData: { [country: string]: number } = {};
                for (const country of countries) {
                    const consultants = await this.consultantRepository
                        .createQueryBuilder('consultants')
                        .where('(LOWER (consultants.country) = :country)', {
                            country: country.toLocaleLowerCase(),
                        })
                        .andWhere('(consultants.id IN (:...ids))', {
                            ids: consultantIds,
                        })
                        .getMany();

                    const consultantIdList = consultants.map((c) =>
                        String(c.id).startsWith('%') ? `${c.id}` : `%${c.id}`,
                    );

                    const count = await this.analysisDataReplicationService.getConsultantCounts(consultantIdList);

                    console.log(count);

                    jsonData[country] = count;
                }
                const totalConusltation = await this.analysisDataReplicationService.getConsultantCounts();

                data = {
                    total_count: totalConusltation,
                    data: jsonData,
                };
            } else if (stat_type === 'clients') {
                const countries = (
                    await this.consultantCountriesRepository.find({
                        where: {
                            consultantCompanyId: diorCompanyId,
                        },
                    })
                ).map((c) => c.name);

                let branches;
                let totalClients;
                const jsonData: { [country: string]: number } = {};

                if (
                    [PositionsIds.ADMIN, PositionsIds.BRAND_MANAGER].includes(currentConsultant.consultant_position_id)
                ) {
                    branches = await this.consultantBranchesRepository.find({
                        where: {
                            id: In(consultants.map((consultant) => consultant.consultant_branch_id)),
                        },
                    });

                    for (const country of countries) {
                        const countQuery = this.customerRepository
                            .createQueryBuilder('customers')
                            .leftJoinAndSelect('customers.consultant', 'consultant');

                        if (country === null || country === '') {
                            countQuery
                                .andWhere('(consultant.country IS NULL AND customers.email IS NULL)')
                                .orWhere('(consultant.country IS NULL AND customers.email IS NOT NULL)');
                        } else {
                            countQuery
                                .andWhere('(LOWER(consultant.country) = :country AND customers.email IS NULL)', {
                                    country: country.toLowerCase(),
                                })
                                .orWhere('(LOWER(consultant.country) = :country AND customers.email IS NOT NULL)', {
                                    country: country.toLowerCase(),
                                });
                        }

                        if (start_date && end_date) {
                            countQuery.andWhere(
                                `customers.created_at BETWEEN ${start_date} 00:00:00 AND ${end_date} 23:59:59 `,
                            );
                        }
                        const count = await countQuery.getCount();

                        jsonData[country] = count;
                    }

                    const consultantIds = consultants.map((c) => c.id);

                    const totalClientQuery = this.customerRepository.createQueryBuilder('customers');
                    if (consultantIds && consultantIds.length > 0) {
                        totalClientQuery
                            .andWhere('(customers.consultant_id IN (:...consultantIds) AND customers.email IS NULL)', {
                                consultantIds: consultantIds,
                            })
                            .orWhere(
                                '(customers.consultant_id IN (:...consultantIds) AND customers.email IS NOT NULL)',
                                {
                                    consultantIds: consultantIds,
                                },
                            );
                        if (start_date && end_date) {
                            totalClientQuery.andWhere(
                                `customers.created_at BETWEEN ${start_date} 00:00:00 AND ${end_date} 23:59:59`,
                            );
                        }

                        totalClients = await totalClientQuery.getCount();
                    }
                } else if (currentConsultant.consultant_position_id === PositionsIds.SUPER_ADMIN) {
                    branches = await this.branchesRepository.find({
                        where: {
                            consultantCompanyId: String(diorCompanyId),
                        },
                    });

                    const totalClientQuery = this.customerRepository.createQueryBuilder('customers');

                    if (start_date && end_date) {
                        totalClientQuery.where(`customers.created_at BETWEEN ${start_date} AND ${end_date}`);
                    }

                    totalClients = await totalClientQuery.getCount();

                    for (const country of countries) {
                        const count = await this.customerRepository.countValidCustomersPerCountry(
                            country,
                            start_date,
                            end_date,
                        );

                        jsonData[country] = count;
                    }
                }

                jsonData['unknown_country'] = await this.customerRepository.countValidCustomersPerCountry(
                    null,
                    start_date,
                    end_date,
                );

                if (jsonData['']) {
                    jsonData['unknown_country'] = jsonData[''];
                    delete jsonData[''];
                }

                if (jsonData['null']) {
                    jsonData['unknown_country'] = (jsonData['unknown_country'] || 0) + jsonData['null'];
                    delete jsonData['null'];
                }

                data = {
                    total_count: totalClients,
                    data: jsonData,
                };
            }

            return data;
        } catch (e) {
            throw e;
        }
    }
}
