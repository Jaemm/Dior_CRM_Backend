import { ErrorStatus } from '@/src/common/constants/error-status';
import { ProudctRecommendationGroupsT, ProductRecommendationT } from '@/src/common/types/entities';
import { Injectable, NotFoundException } from '@nestjs/common';
import {
    GetListProductRecommendationGroupsDto,
    SearchProductRecommendationGroupsDto,
} from './productRecommendtaionGroups.dto';
import { ConsultantsRepository, ProductRecommendationGroupsRepository } from '@/src/common/repositories/crm';
import { In } from 'typeorm';
import { CommonService } from '@/src/common/common.service';

@Injectable()
export class ProductRecommendationGroupsService {
    constructor(
        private commonService: CommonService,

        // Repos
        private readonly consultantRepository: ConsultantsRepository,
        private readonly prGroupsRepository: ProductRecommendationGroupsRepository,
    ) {}

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

            const reformatGroups: ProudctRecommendationGroupsT[] = prGroups.map((group) => {
                const products = group?.prSelecteds
                    .sort((a, b) => a.orderNumber - b.orderNumber)
                    .map((selected) => {
                        const recommendation = selected?.productRecommendation;

                        if (!recommendation) {
                            return null;
                        }

                        const product: ProductRecommendationT = {
                            id: recommendation.id,
                            name: recommendation.name,
                            product_type: recommendation.productType,
                            description: recommendation.description,
                            link: recommendation.link,
                            image_url: recommendation.imageUrl,
                            category: recommendation.category,
                            routine: recommendation.routine,
                            code: recommendation.code,
                            collection: recommendation.collection,
                            is_principal: selected.isPrincipal,
                        };

                        return product;
                    })
                    .filter((product) => product !== null);

                const reformatGroup: ProudctRecommendationGroupsT = {
                    id: Number(group.id),
                    name: group.name,
                    countries: group.countries,
                    products: products || [],
                };

                return reformatGroup;
            });

            return {
                data: reformatGroups,
                total_size: totalCount,
                current_page_size: prGroups.length,
                current_page: searchPage,
                total_pages: Math.ceil(totalCount / searchPer),
            };
        } catch (e) {
            throw e;
        }
    }

    async getListProductRecommendationGroups(query: GetListProductRecommendationGroupsDto) {
        try {
            const { list_type, search } = query;

            const listType = list_type || 'skincare';

            const diorConsultant = await this.consultantRepository.getDiorConsultant();

            const groupsQuery = await this.prGroupsRepository.createQueryBuilder('groups');

            groupsQuery
                .where('LOWER (groups.name) ILIKE :listType', {
                    listType: `%${listType}%`,
                })
                .andWhere('groups.consultantId = :consultantId', {
                    consultantId: Number(diorConsultant.id),
                });

            if (search) {
                groupsQuery.andWhere('groups.name ILIKE :search', {
                    search: `%${search}%`,
                });
            }

            const groups = await groupsQuery.getMany();

            const data = groups.map((group) => {
                return {
                    id: group.id,
                    name: group.name,
                    countries: group.countries,
                    routine: group?.name.toLocaleLowerCase().includes('makeup') ? 'makeup' : 'skincare',
                };
            });

            return data;
        } catch (e) {
            throw e;
        }
    }

    async deleteProductRecommendtionGroupById(groupId: string, locale = 'en') {
        try {
            const diorConsultant = await this.consultantRepository.getDiorConsultant();

            const groups = await this.prGroupsRepository.findOne({
                where: {
                    id: groupId,
                    consultantId: diorConsultant.id,
                },
            });

            if (!groups) {
                throw new NotFoundException({
                    result_code: ErrorStatus.RECORD_NOT_FOUND,
                    error: this.commonService.createLocaleErrorMessage(locale, 'record_not_found'),
                });
            }

            await this.prGroupsRepository.remove(groups);

            return {
                message: 'Delete product group successful',
            };
        } catch (e) {
            throw e;
        }
    }

    async deleteMultipleProductRecommendtionGroup(groupIds: string, locale = 'en') {
        try {
            const diorConsultant = await this.consultantRepository.getDiorConsultant();

            const splitIds = groupIds.split(',').map(Number);

            const groups = await this.prGroupsRepository.find({
                where: {
                    consultantId: diorConsultant.id,
                    id: In(splitIds),
                },
            });

            if (!groups || groups.length < 1) {
                throw new NotFoundException({
                    result_code: ErrorStatus.RECORD_NOT_FOUND,
                    error: this.commonService.createLocaleErrorMessage(locale, 'record_not_found'),
                });
            }

            await this.prGroupsRepository.remove(groups);

            return {
                message: 'Successfully deleted multiple record',
            };
        } catch (e) {
            throw e;
        }
    }
}
