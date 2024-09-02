import { ErrorStatus } from '@/src/common/constants/error-status';
import {
    ProudctRecommendationGroupsT,
    ProductRecommendationT,
    ProudctRecommendationGroupsForDiorT,
} from '@/src/common/types/entities';
import { Injectable, NotFoundException } from '@nestjs/common';
import {
    CreateProductRecommendationGroupsDto,
    GetListProductRecommendationGroupsDto,
    SearchProductRecommendationGroupsDto,
    UpdateProductRecommendationGroupDto,
} from './productRecommendtaionGroups.dto';
import {
    ConsultantsRepository,
    ProductRecommendationGroupsRepository,
    ProductRecommendationRepository,
    ProductRecommendationSelectedRepository,
} from '@/src/common/repositories/crm';
import { In } from 'typeorm';
import { CommonService } from '@/src/common/common.service';
import { ProductRecommendationGroups, ProductRecommendationSelecteds } from '@/src/common/entities/crmEntities';

@Injectable()
export class ProductRecommendationGroupsService {
    constructor(
        private commonService: CommonService,

        // Repos
        private readonly consultantRepository: ConsultantsRepository,
        private readonly productRecommendationsRepository: ProductRecommendationRepository,
        private readonly prSelectedRepository: ProductRecommendationSelectedRepository,
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
                .leftJoinAndSelect('prGroups.prSelecteds', 'prSelecteds')
                .leftJoinAndSelect('prSelecteds.productRecommendation', 'productRecommendation');

            if (search && search !== '') {
                prGroupsQuery.andWhere('prGroups.name ILIKE :search', {
                    search: `%${search}%`,
                });
            }

            const searchPage = Number(page || 1);
            const searchPer = Number(per || 25);

            const [prGroups, totalCount] = await prGroupsQuery
                .skip((searchPage - 1) * searchPage)
                .take(searchPer)
                .getManyAndCount();

            const reformatGroups: ProudctRecommendationGroupsT[] = prGroups.map((group) => {
                const selectedList = group?.prSelecteds || [];

                const products = selectedList
                    .sort((a, b) => a.orderNumber - b.orderNumber)
                    .map((selected) => {
                        const recommendation = selected?.productRecommendation;

                        if (!recommendation) {
                            return null;
                        }

                        const product: ProductRecommendationT = recommendation
                            ? {
                                  id: Number(recommendation.id),
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
                              }
                            : null;

                        return product;
                    })
                    .filter(Boolean);

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

            return {
                data,
            };
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

    async createProductRecommendationGroups(body: CreateProductRecommendationGroupsDto) {
        try {
            const { name, locations, products_selected, principal_product } = body;

            const diorConsultant = await this.consultantRepository.getDiorConsultant();

            const newPrGroups = this.prGroupsRepository.create({
                name: name,
                countries: locations,
                consultantId: diorConsultant.id,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            const savedPrGroups = await this.prGroupsRepository.save(newPrGroups);

            if (products_selected && products_selected.length > 0) {
                const newPrSelectedList = products_selected.map((productId, index) => {
                    return this.prSelectedRepository.create({
                        productRecommendationGroupId: Number(savedPrGroups.id),
                        productRecommendationId: productId,
                        orderNumber: index + 1,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    });
                });

                await this.prSelectedRepository.save(newPrSelectedList);
            }

            if (principal_product) {
                const prod = await this.prSelectedRepository.findOne({
                    where: {
                        productRecommendationGroupId: Number(savedPrGroups.id),
                        productRecommendationId: Number(principal_product),
                    },
                });

                if (prod) {
                    prod.isPrincipal = true;
                }

                await this.prSelectedRepository.save(prod);
            }

            const groupForResponse = await this.prGroupsRepository.findOne({
                where: {
                    id: savedPrGroups.id,
                    consultantId: diorConsultant.id,
                },
                relations: ['prSelecteds', 'prSelecteds.productRecommendation'],
            });

            return groupForResponse.getBasicInfo;
        } catch (e) {
            throw e;
        }
    }

    async updateProductRecommendationGroups(groupId: string, body: UpdateProductRecommendationGroupDto, locale = 'en') {
        const { name, locations, products_selected, principal_product } = body;
        try {
            const diorConsultant = await this.consultantRepository.getDiorConsultant();

            const group = await this.prGroupsRepository.findOne({
                where: {
                    id: groupId,
                    consultantId: diorConsultant.id,
                },
                relations: ['prSelecteds'],
            });

            if (!group) {
                throw new NotFoundException({
                    result_code: ErrorStatus.RECORD_NOT_FOUND,
                });
            }

            group.name = name ? name : group.name;
            group.countries = locations ? locations : group.countries;
            group.updatedAt = new Date();

            await this.prGroupsRepository.save(group);

            if (group.prSelecteds && group.prSelecteds.length > 0) {
                await this.prSelectedRepository.remove(group.prSelecteds);
            }

            if (products_selected && products_selected.length > 0) {
                const newPrSelectedList = products_selected.map((productId, index) => {
                    return this.prSelectedRepository.create({
                        productRecommendationGroupId: Number(group.id),
                        productRecommendationId: productId,
                        orderNumber: index + 1,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    });
                });

                await this.prSelectedRepository.save(newPrSelectedList);
            }

            if (principal_product) {
                const prod = await this.prSelectedRepository.findOne({
                    where: {
                        productRecommendationGroupId: Number(group.id),
                        productRecommendationId: principal_product,
                    },
                });

                if (prod) {
                    prod.isPrincipal = true;
                    await this.prSelectedRepository.save(prod);
                }
            }

            const groupForResponse = await this.prGroupsRepository.findOne({
                where: {
                    id: group.id,
                    consultantId: diorConsultant.id,
                },
                relations: ['prSelecteds', 'prSelecteds.productRecommendation'],
            });

            return groupForResponse.getBasicInfo;
        } catch (e) {
            throw e;
        }
    }

    async getProductById(groupId: string) {
        try {
            const diorConsultant = await this.consultantRepository.getDiorConsultant();

            const group = await this.prGroupsRepository.findOne({
                where: {
                    consultantId: diorConsultant.id,
                    id: groupId,
                },
                relations: ['prSelecteds', 'prSelecteds.productRecommendation'],
            });

            if (!group) {
                throw new NotFoundException({
                    result_code: ErrorStatus.RECORD_NOT_FOUND,
                });
            }

            const selectedList = group.prSelecteds;

            const reformatData = selectedList.map((selected) => {
                const product = selected.productRecommendation;

                if (product) {
                    return {
                        id: product.id,
                        name: product.name,
                        product_type: product.productType,
                        description: product.description,
                        link: product.link,
                        image_url: product.imageUrl,
                        category: product.category,
                        routine: product.routine,
                        is_principal: selected.isPrincipal,
                    };
                }

                return null;
            });

            return reformatData;
        } catch (e) {
            throw e;
        }
    }
}
