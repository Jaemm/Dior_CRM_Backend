import { Request } from 'express';
import * as moment from 'moment';

import { CommonService } from '@/src/common/common.service';
import { ErrorStatus } from '@/src/common/constants/error-status';
import { Consultants, Devices } from '@/src/common/entities/crmEntities';
import { PositionsIds } from '@/src/common/enums/position.enum';
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
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Brackets, In, Not, Repository } from 'typeorm';
import { AnalysisDataReplicationService } from '../../dataReplication/analysisDataReplication/analysisDataReplication.service';
import {
    GetInfographStatDetails,
    GetOverAllDetailsDto,
    GetOverAllDto,
    GetStatDetailsCountryWiseDto,
    GetStatDetailsDto,
} from './statistics.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Analysis } from '@/src/common/entities/analysisEntities/Analysis.entity';

@Injectable()
export class StatisticsService {
    constructor(
        private commonService: CommonService,
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

    async getOverAll(req: Request, query: GetOverAllDto, locale = 'en') {
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
            let branches: any = diorBranches;
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
                    .select('DISTINCT (products.device_id)', 'deviceIds')
                    .where('products.consultant_id IN (:...consultantIds)', {
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
                    .select('consultants.consultant_branch_id', 'branchId') // Correct use of DISTINCT
                    .leftJoinAndSelect('consultants.consultant_branch', 'consultant_branch')
                    .where('consultants.id IN (:...consultantIds)', {
                        consultantIds: consultants.map((consultant) => consultant.id),
                    });

                // Check if start_date and end_date exist, and apply them as query parameters
                if (start_date && end_date) {
                    branchQuery.andWhere('consultant_branch.created_at BETWEEN :startDate AND :endDate', {
                        startDate: start_date,
                        endDate: end_date,
                    });
                }

                branches = await branchQuery.getMany();

                consultation = await this.analysisDataReplicationService.getConsultationByConsultant(consultants);
            } else if (PositionsIds.SUPER_ADMIN === Number(currentConsultant.consultant_position_id)) {
                if (PositionsIds.SUPER_ADMIN === Number(currentConsultant.consultant_position_id)) {
                    // Fetch consultants for the SUPER_ADMIN position
                    consultants = await this.consultantRepository
                        .createQueryBuilder('consultants')
                        .where('consultants.consultant_branch_id IN (:...branchIds)', {
                            branchIds: diorBranches.map((branch) => branch.id),
                        })
                        .andWhere('consultants.id NOT IN (:...ids)', {
                            ids: [11156, 9304],
                        })
                        .getMany();

                    // Build customer query
                    const customerQuery = this.customerRepository.createQueryBuilder('customers');
                    if (start_date && end_date) {
                        customerQuery.andWhere('customers.created_at BETWEEN :startDate AND :endDate', {
                            startDate: `${start_date} 00:00:00`,
                            endDate: `${end_date} 23:59:59`,
                        });
                    }

                    // Fetch customers, consultations, products, and devices in parallel
                    const [customerList, total, consultation_, products] = await Promise.all([
                        customerQuery.getMany(), // Fetch customers
                        customerQuery.getCount(), // Fetch customer count (could be done with `getManyAndCount`)
                        this.analysisDataReplicationService.getConsultations(), // Fetch consultation stats
                        this.productRepository.find({
                            where: {
                                consultant_id: In(consultants.map((consultant) => consultant.id)),
                            },
                        }), // Fetch products by consultant
                    ]);

                    totalClients = total;
                    customer = customerList;
                    consultation = consultation_;

                    // Fetch devices linked to the products and Dior devices
                    const productDeviceIds = products.map((product) => product.device_id);
                    const diorDeviceIds = diorDevices.map((device) => device.id);

                    devices = await this.devicesRepository
                        .createQueryBuilder('devices')
                        .where('devices.id IN (:...productDeviceIds)', { productDeviceIds })
                        .orWhere('devices.id IN (:...diorDeviceIds)', { diorDeviceIds })
                        .getMany();
                }
            }

            const deviceArray: any = devices;

            const arrayOfDevice = Array.isArray(deviceArray) ? devices?.map((d) => d.id) : [devices];

            const deviceQuery = this.devicesRepository
                .createQueryBuilder('devices')
                .where('devices.optic_number NOT IN (:...opticNumbers)', {
                    opticNumbers: ['FAB02135', 'FAB02363', 'FAB02709', 'DVAA4496'],
                })
                .andWhere('devices.id IN (:...ids)', {
                    ids: arrayOfDevice,
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
                total_offline_consultations: Number(totalSalesConnections || 0),
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
                const customerPerBranch = 0;
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
                //
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

            return await Promise.all(promiseDataList);
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

            const reformatPromise: Promise<any>[] = productRecommendations.map(async (recommendation) => {
                let refRecommendation = recommendation;
                if (recommendation.productRecommendationId) {
                    refRecommendation = await this.productRecommendationRepository.findOne({
                        where: {
                            id: String(recommendation.productRecommendationId),
                        },
                    });
                }

                // collection shades
                const recommShadeList = await this.productRecommendationRepository
                    .createQueryBuilder('recommendtaions')
                    .where('recommendtaions.collection = :collection', {
                        collection: recommendation.collection,
                    })
                    .andWhere('recommendtaions.shades IS NOT NULL')
                    .getMany();

                const collectionShades = recommShadeList.map((recomm) => recomm.shades);

                let productTranslations: any = [];
                // product translations
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

                // category
                const categoryTranslations = await this.productAttributesRepository.getTranslationsByType(
                    'Category',
                    recommendation.category,
                );

                // collection
                const collectionTranslations = await this.productAttributesRepository.getTranslationsByType(
                    'Collection',
                    recommendation.collection,
                );

                const productVariants = recommendation.productVariants
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
                    name: refRecommendation.name,
                    shades: recommendation.getShade(),
                    collection_shades: collectionShades,
                    product_translations: productTranslations,
                    category_translations: categoryTranslations,
                    collection_translations: collectionTranslations,
                    product_variants: productVariants,
                };
            });

            const data = await Promise.all(reformatPromise);

            const mostPopular = first20ProductIds.map((productId) => {
                return data.find((row) => row.id === productId);
            });

            return {
                data: mostPopular,
            };
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

            const diorCompanyId = 213; //await this.consultantRepository.getDiorConsultantCompanyId();

            let consultants;
            if (currentConsultant.consultant_position_id === PositionsIds.ADMIN) {
                consultants = await this.consultantRepository
                    .createQueryBuilder('consultants')
                    .where('LOWER (consultants.country) IN (:...countries)', {
                        countries: currentConsultant.countries.map((c) => c.toLowerCase()),
                    })
                    .andWhere('consultants.consultant_company_id = :companyId', {
                        companyId: diorCompanyId,
                    })
                    .getMany();
            } else if (currentConsultant.consultant_position_id === PositionsIds.BRAND_MANAGER) {
                consultants = await this.consultantRepository
                    .createQueryBuilder('consultants')
                    .where('LOWER (consultants.country) = :country', {
                        country: currentConsultant.consultant_branch.country.toLowerCase(),
                    })
                    .andWhere('consultants.consultant_company_id = :companyId', {
                        companyId: diorCompanyId,
                    })
                    .getMany();
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

                const countryBranchCounts: { [country: string]: any } = {};
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

                const transformedData: any = {};
                for (const country in countryBranchCounts) {
                    if (countryBranchCounts.hasOwnProperty(country)) {
                        transformedData[country] = Number(countryBranchCounts[country].count_all);
                    }
                }
                data = {
                    total_count: branches.length,
                    data: transformedData,
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
                    [PositionsIds.SUPER_ADMIN, PositionsIds.ADMIN].includes(currentConsultant.consultant_position_id)
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
                //
                jsonData['unknown_country'] = await unknownQuery
                    .where("device.country_code IS NULL OR device.country_code = ''")
                    .getCount();

                data = {
                    total_count: devices.length,
                    data: jsonData,
                };
            } else if (stat_type === 'consultations') {
                // Get countries name
                const countries = await this.consultantCountriesRepository.find({
                    where: { consultantCompanyId: diorCompanyId },
                });

                // Extract country names and convert to lowercase
                const countryNames = countries.map((c) => c.name.toLowerCase());

                // Get consultant IDs from the analysis API argument
                const consultantIdArray = await this.analysisDataReplicationService.getConsultantIds(
                    start_date,
                    end_date,
                );
                const consultantIds = [...new Set(consultantIdArray.map((c: any) => c.consultantId))];

                const jsonData: { [country: string]: number } = {};

                // Initialize jsonData with zero counts for all countries
                for (const country of countryNames) {
                    jsonData[country] = 0; // Start with zero count for each country
                }

                // Find all consultants matching the provided country names and IDs in a single query
                const consultants = await this.consultantRepository
                    .createQueryBuilder('consultants')
                    .select('consultants.id, lower(consultants.country) as country')
                    .where('consultants.id IN (:...ids)', { ids: consultantIds })
                    .andWhere(
                        new Brackets((qb) => {
                            qb.where('lower(consultants.country) IN (:...countries)', {
                                countries: countryNames,
                            }).orWhere('consultants.country IS NULL');
                        }),
                    )
                    .getRawMany();

                // Prepare a map to hold the counts per country
                const countryConsultantMap: { [key: string]: number[] } = {};

                // Organize consultant IDs by country
                for (const consultant of consultants) {
                    const country = consultant.country;
                    if (!countryConsultantMap[country]) {
                        countryConsultantMap[country] = [];
                    }
                    countryConsultantMap[country].push(consultant.id);
                }
                console.log(countryConsultantMap);

                // Use Promise.all to get counts for all countries concurrently
                const countPromises = Object.keys(countryConsultantMap).map(async (country) => {
                    const _ids = countryConsultantMap[country];
                    if (_ids.length > 0) {
                        const count = await this.analysisDataReplicationService.statististic(
                            _ids,
                            start_date,
                            end_date,
                        );
                        jsonData[country] = count; // Update count for this country
                    }
                    // No need to explicitly set jsonData[country] = 0, as it starts at 0
                });

                // Wait for all counts to be resolved
                await Promise.all(countPromises);

                // Get total consultations
                const totalConsultation = await this.analysisDataReplicationService.getConsultantCountsForStatDetails(
                    null,
                    start_date,
                    end_date,
                );

                // Sum of all consultation
                const total = Object.values(jsonData).reduce((sum, value) => sum + value, 0);

                jsonData['null'] = jsonData['null'] + (totalConsultation - total);

                // Final data structure
                data = {
                    total_count: totalConsultation,
                    data: jsonData,
                };
            } else if (stat_type === 'clients') {
                const dateRangeCondition =
                    start_date && end_date
                        ? `customers.created_at BETWEEN '${start_date} 00:00:00' AND '${end_date} 23:59:59'`
                        : '1=1';

                // Fetch consultant country counts in a single batch query
                const consultantCountryCounts = await this.customerRepository
                    .createQueryBuilder('customers')
                    .leftJoin('customers.consultant', 'consultant')
                    .select('LOWER(consultant.country)', 'country')
                    .addSelect('COUNT(customers.id)', 'count')
                    .where(dateRangeCondition)
                    .andWhere(
                        "(consultant.country IS NOT NULL AND consultant.country <> '') OR consultant.country IS NULL",
                    )
                    .groupBy('consultant.country')
                    .getRawMany();

                // Preload all countries from the diorCompany
                const countries = (
                    await this.consultantCountriesRepository.find({
                        where: {
                            consultantCompanyId: diorCompanyId,
                        },
                    })
                ).map((c) => c.name.toLowerCase());

                // Construct jsonData from the result of the query, with 0 default for missing countries
                const jsonData: { [country: string]: number } = {};
                countries.forEach((country) => {
                    jsonData[country] = 0; // Default to 0 for all countries
                });

                // Populate jsonData with actual counts from the query result
                consultantCountryCounts.forEach(({ country, count }) => {
                    jsonData[country || 'unknown_country'] = parseInt(count, 10);
                });

                // Handle total clients in one query, depending on consultant position
                let totalClients = 0;
                if (
                    [PositionsIds.ADMIN, PositionsIds.BRAND_MANAGER].includes(currentConsultant.consultant_position_id)
                ) {
                    const consultantIds = consultants.map((c) => c.id);

                    if (consultantIds.length > 0) {
                        totalClients = await this.customerRepository
                            .createQueryBuilder('customers')
                            .where('customers.consultant_id IN (:...consultantIds)', { consultantIds })
                            .andWhere(dateRangeCondition)
                            .getCount();
                    }
                } else if (currentConsultant.consultant_position_id === PositionsIds.SUPER_ADMIN) {
                    totalClients = await this.customerRepository
                        .createQueryBuilder('customers')
                        .where(dateRangeCondition)
                        .getCount();
                }

                // Handle 'unknown_country' logic (if empty string or null countries exist)
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

                delete jsonData['0'];
                // Return the final response data

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

    async getInfographStatDetails(req: Request, query: GetInfographStatDetails, locale = 'en') {
        try {
            const type = 'day';

            const { start_date, end_date, stat_type } = query;

            if (!stat_type) {
                throw new BadRequestException({
                    result_code: ErrorStatus.CUSTOM_ERROR,
                    error: this.commonService.createLocaleErrorMessage(
                        locale,
                        'custom_error',
                        'The stat_type does not exist.',
                    ),
                });
            }

            const userId = (<{ id: string }>req.user).id;
            const currentConsultant = await this.consultantRepository.getConsultantById(Number(userId), [
                'consultant_branch',
            ]);
            const diorCompanyId = await this.consultantRepository.getDiorConsultantCompanyId();

            let consultants;
            let branches;

            const consultantQuery = this.consultantRepository
                .createQueryBuilder('consultants')
                .where('consultants.consultant_company_id = :companyId', {
                    companyId: diorCompanyId,
                });

            if (PositionsIds.ADMIN === Number(currentConsultant.consultant_position_id)) {
                consultantQuery.andWhere('LOWER (consultants.country) IN (:...countries)', {
                    countries: currentConsultant.countries.map((country) => country.toLocaleLowerCase()),
                });

                consultants = await consultantQuery.getMany();

                branches = await this.consultantBranchesRepository.find({
                    where: {
                        id: In(consultants.map((c) => String(c.consultant_branch_id))),
                    },
                });
            } else if (PositionsIds.BRAND_MANAGER === Number(currentConsultant.consultant_position_id)) {
                consultantQuery.andWhere('LOWER (consultants.country) = :country', {
                    country: currentConsultant?.consultant_branch?.country,
                });

                consultants = await consultantQuery.getMany();
            }
            let data = [];
            if (stat_type === 'stores') {
                let branches = [];
                if ([6, 4].includes(currentConsultant.consultant_position_id)) {
                    branches = await this.consultantBranchesRepository
                        .createQueryBuilder('branch')
                        .where('branch.id IN (:...ids)', {
                            ids: consultants.map((c) => c.consultant_branch_id).filter((v, i, a) => a.indexOf(v) === i),
                        })
                        .getMany();
                } else if (currentConsultant.consultant_position_id === 5) {
                    branches = await this.consultantBranchesRepository
                        .createQueryBuilder('branch')
                        .where('branch.consultantCompanyId = :companyId', { companyId: diorCompanyId })
                        .getMany();
                }

                let query = `SELECT jsonb_agg(jsonb_build_object(created_date, user_counts)) AS result 
                             FROM (SELECT created_date, jsonb_object_agg(country_name, user_count) AS user_counts 
                                   FROM (SELECT DATE(consultant_branches.created_at) AS created_date, 
                                                consultant_branches.country AS country_name, 
                                                COUNT(*) AS user_count 
                                         FROM consultant_branches 
                                         WHERE consultant_branches.country IS NOT NULL`;

                if (start_date && end_date) {
                    query += ` AND consultant_branches.created_at BETWEEN '${start_date} 00:00:00' AND '${end_date} 23:59:59'`;
                }

                query += ` GROUP BY DATE(consultant_branches.created_at), consultant_branches.country) AS subquery 
                          GROUP BY created_date 
                          ORDER BY created_date DESC) AS final_sub_query`;

                const arr = await this.consultantBranchesRepository.query(query);

                // console.log(arr);

                // return;
                data = arr.length > 0 ? arr[0].result : [];
                const newArr: any = [];

                data.forEach((d: any) => {
                    const newJson = { date: Object.keys(d)[0], country_details: [] as any };
                    const cA = newJson.country_details;

                    Object.keys(d[Object.keys(d)[0]]).forEach((country) => {
                        const json = { country_name: country, value: d[Object.keys(d)[0]][country] };
                        cA.push(json);
                    });

                    newArr.push(newJson);
                });

                data = newArr;
            } else if (stat_type === 'devices') {
                data = [];
            } else if (stat_type === 'consultations') {
                let result = await this.analysisDataReplicationService.getConsultantForInfographStatDetails(
                    start_date,
                    end_date,
                );

                const consultantIds = result
                    .map((res: any) => res.consultant_id)
                    .filter((v: any, i: any, a: any) => a.indexOf(v) === i);
                const days = result.map((val: any) => val.day);

                const finalQuery = `SELECT consultant_ids.id AS consultant_id, c.country, COUNT(*) AS id_count, consultant_ids.days 
                        FROM (SELECT UNNEST($1::int[]) AS id, UNNEST($2::text[]) AS days) AS consultant_ids 
                        INNER JOIN consultants c ON c.id = consultant_ids.id 
                        GROUP BY consultant_ids.id, c.country, consultant_ids.days 
                        ORDER BY consultant_id`;

                result = await this.consultantRepository.query(finalQuery, [consultantIds, days]);

                const groupedResult: any = {};
                result.forEach((item: any) => {
                    const { days, country, id_count } = item;
                    if (!groupedResult[days]) groupedResult[days] = {};
                    if (!groupedResult[days][country]) groupedResult[days][country] = 0;
                    groupedResult[days][country] += parseInt(id_count, 10);
                });

                const formattedResult = Object.keys(groupedResult).map((date) => ({
                    date,
                    country_details: Object.keys(groupedResult[date]).map((country) => ({
                        country_name: country,
                        value: groupedResult[date][country],
                    })),
                }));

                return formattedResult.sort((a, b) => moment(b.date).diff(moment(a.date)));
            } else if (stat_type === 'clients') {
                let clientsQuery = `SELECT jsonb_agg(jsonb_build_object(created_date, user_counts)) AS result 
                          FROM (SELECT created_date, jsonb_object_agg(country_name, user_count) AS user_counts 
                                FROM (SELECT DATE(customers.createdAt) AS created_date, 
                                             consultants.country AS country_name, 
                                             COUNT(*) AS user_count 
                                      FROM customers 
                                      LEFT JOIN consultants ON customers.consultantId = consultants.id 
                                      WHERE consultants.country IS NOT NULL`;

                if (start_date && end_date) {
                    clientsQuery += ` AND customers.createdAt BETWEEN '${start_date}' AND '${end_date}'`;
                }

                clientsQuery += ` GROUP BY DATE(customers.createdAt), consultants.country) AS subquery 
                       GROUP BY created_date 
                       ORDER BY created_date DESC) AS final_sub_query`;

                const clientsArr = await this.customerRepository.query(clientsQuery);

                data = clientsArr.length > 0 ? clientsArr[0].result : [];
                const clientsNewArr: any = [];

                data.forEach((d: any) => {
                    const newJson = { date: Object.keys(d)[0], country_details: [] as any };
                    const cA = newJson.country_details;

                    Object.keys(d[Object.keys(d)[0]]).forEach((country) => {
                        const json = { country_name: country, value: d[Object.keys(d)[0]][country] };
                        cA.push(json);
                    });

                    clientsNewArr.push(newJson);
                });

                data = clientsNewArr;
            }

            return data;
        } catch (e) {
            throw e;
        }
    }

    async getStatDetailsCountryWise(req: Request, query: GetStatDetailsCountryWiseDto, locale = 'en') {
        try {
            const { stat_type, country_name, start_date, end_date } = query;

            if (!stat_type || !country_name) {
                const message = !stat_type ? 'The stat_type does not exist.' : 'The country_name missing.';
                throw new BadRequestException({
                    result_code: ErrorStatus.CUSTOM_ERROR,
                    error: this.commonService.createLocaleErrorMessage(locale, 'custom_error', message),
                });
            }

            let data: any;

            if (stat_type === 'stores') {
                let storesQuery = this.consultantBranchesRepository
                    .createQueryBuilder('consultant_branch')
                    .select([
                        'consultant_branch.name AS pos_name',
                        'consultant_branch.code AS pos_code',
                        'COUNT(*) AS total_count',
                    ])
                    .innerJoin('consultant_branch.consultants', 'consultant')
                    .where('LOWER(consultant.country) = LOWER(:country_name)', { country_name });

                if (start_date && end_date) {
                    storesQuery = storesQuery.andWhere(
                        'consultant_branch.createdAt BETWEEN :start_date AND :end_date',
                        { start_date, end_date },
                    );
                }

                storesQuery = storesQuery.groupBy('consultant_branch.name, consultant_branch.code');

                const storesResult = await storesQuery.getRawMany();
                data = storesResult.map((row) => ({
                    pos_name: row.pos_name,
                    pos_code: row.pos_code,
                    total_count: row.total_count,
                }));
            } else if (stat_type === 'devices') {
                data = [];
            } else if (stat_type === 'consultations') {
                const consultationsQuery = this.consultantRepository
                    .createQueryBuilder('consultant')
                    .select('DISTINCT(consultant.id)', 'id')
                    .where('LOWER(consultant.country) = LOWER(:country_name)', { country_name });

                const consultantIds = await consultationsQuery.getRawMany();

                const consultationsResult =
                    await this.analysisDataReplicationService.getConsultationForStatDetailsCountryWise(
                        consultantIds,
                        start_date,
                        end_date,
                    );

                const newConsultationArr = await Promise.all(
                    consultationsResult.map(async (obj: any) => {
                        const branch = await this.consultantRepository.findOne({
                            where: {
                                id: obj.consultant_id,
                            },
                            relations: ['consultant_branch'],
                        });
                        return {
                            pos_name: branch.consultant_branch.name,
                            pos_code: branch.consultant_branch.code,
                            total_count: obj.total_count,
                        };
                    }),
                );

                data = newConsultationArr;
            } else if (stat_type === 'clients') {
                let clientsQuery = this.customerRepository
                    .createQueryBuilder('customer')
                    .select([
                        'consultant_branch.name AS pos_name',
                        'consultant_branch.code AS pos_code',
                        'COUNT(*) AS total_count',
                    ])
                    .innerJoin('customer.consultant', 'consultant')
                    .innerJoin('consultant.consultantBranch', 'consultant_branch')
                    .where('LOWER(consultant.country) = LOWER(:country_name)', { country_name });

                if (start_date && end_date) {
                    clientsQuery = clientsQuery.andWhere('customer.createdAt BETWEEN :start_date AND :end_date', {
                        start_date,
                        end_date,
                    });
                }

                clientsQuery = clientsQuery.groupBy('consultant_branch.name, consultant_branch.code');

                const clientsResult = await clientsQuery.getRawMany();
                data = clientsResult.map((row: any) => ({
                    pos_name: row.pos_name,
                    pos_code: row.pos_code,
                    total_count: row.total_count,
                }));
            }

            return data;
        } catch (e) {
            throw e;
        }
    }
}
