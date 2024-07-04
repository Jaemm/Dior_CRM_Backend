import { Injectable } from '@nestjs/common';

import { NotFoundException, BadRequestException } from '@nestjs/common/exceptions';

import {
    ConsultantsRepository,
    ConsultantCountriesRepository,
    ConsultnatBranchesRepository,
    CustomersRepository,
    ProductRecommendationGroupsRepository,
} from '@/src/common/repositories';

import { Request } from 'express';

import { CustomerByConsultantIdDto, SearchBranchesDto, SearchProductRecommendationGroups } from './dior.dto';
import { ErrorStatus } from '@/src/common/constants/error-status';
import { ResponseMessages } from '@/src/common/constants/response-messages';

@Injectable()
export class DiorService {
    constructor(
        private consultantRepository: ConsultantsRepository,
        private consultantCountriesRepository: ConsultantCountriesRepository,
        private consultnatBranchesRepository: ConsultnatBranchesRepository,
        private customersRepository: CustomersRepository,
        private prGroupsRepository: ProductRecommendationGroupsRepository,
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

            return {
                data: countries,
            };
        } catch (e) {
            throw e;
        }
    }

    /** Branches */
    async getBranchesByConsultantsId(req: Request) {
        try {
            const userId = (<{ id: string }>req.user).id;

            const currentConsultant = await this.consultantRepository.findOne({
                where: { id: Number(userId) },
                relations: ['consultant_branch'],
            });

            if (!currentConsultant) {
                throw new NotFoundException({
                    result_code: ErrorStatus.NOT_FOUND,
                    error: `Cannot Found consultant userId:${currentConsultant.email}`,
                });
            }

            const branch = currentConsultant.consultant_branch;

            if (!branch) {
                throw new NotFoundException({
                    result_code: ErrorStatus.NOT_FOUND,
                    error: `Cannot Found consultant branch by userId:${currentConsultant.email}`,
                });
            }

            const consultantsByBranch = await this.consultantRepository
                .createQueryBuilder('consultants')
                .where('consultants.email != :email OR consultants.email != :email2', {
                    email: 'ann.chowis613@gmail.com', // who is this...
                    email2: 'ann@chowis.com', // who is this...
                })
                .getMany();

            const data = consultantsByBranch.map((row) => {
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

    async searchBranches(req: Request, query: SearchBranchesDto) {
        try {
            const { filter_by: filterBy, search, country, page, per } = query;

            const userId = (<{ id: string }>req.user).id;
            const currentConsultant = await this.consultantRepository.findOneBy({ id: Number(userId) });

            if (!currentConsultant) {
                throw new NotFoundException({
                    result_code: ErrorStatus.NOT_FOUND,
                    error: `Cannot Found consultant userId:${currentConsultant.email}`,
                });
            }

            const consultantsPositionId = currentConsultant.consultant_position_id;

            const branchQuery = this.consultnatBranchesRepository.createQueryBuilder('branch');

            if (consultantsPositionId === 5) {
                branchQuery.andWhere('branch.company_id = :companyId', {
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

            return {
                data: branches,
                total,
                currentPage: page,
                pageSize: branches.length,
                totalPages: Math.ceil(total / perCondition),
            };
        } catch (e) {
            throw e;
        }
    }

    /** Customers */
    async getCustomers(query: CustomerByConsultantIdDto) {
        try {
            const { consultant_id: consultantId, email } = query;

            const foundConsultant = await this.consultantRepository.getConsultantById(Number(consultantId));

            if (!foundConsultant) {
                throw new NotFoundException({
                    result_code: ErrorStatus.NOT_FOUND,
                    error: `Cannot Found consultant userId: ${consultantId}`,
                });
            }

            const customerByConsultantIdQuery = this.customersRepository
                .createQueryBuilder('customers')
                .where('customers.consultant_id = :consultantId', { consultantId });

            if (email) {
                customerByConsultantIdQuery.andWhere('customers.email LIKE :email', { email: `%${email}%` });
            }

            const customersByConsultant = await customerByConsultantIdQuery.getMany();

            return {
                data: customersByConsultant,
            };
        } catch (e) {
            throw e;
        }
    }

    async getProductRecommendationGroups(query: SearchProductRecommendationGroups) {
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
                .leftJoinAndSelect('prSelecteds.productRecommendations', 'productRecommendations');

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
                        const product = selected.productRecommendations;
                        return product && product.length > 0
                            ? selected.productRecommendations.map((p) => {
                                  return {
                                      id: p.id,
                                      name: p.name,
                                      product_type: p.productType,
                                      description: p.description,
                                      link: p.link,
                                      image_url: p.imageUrl,
                                      category: p.category,
                                      routine: p.routine,
                                      code: p.code,
                                      collection: p.collection,
                                      is_principal: selected.isPrincipal,
                                  };
                              })
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
}
