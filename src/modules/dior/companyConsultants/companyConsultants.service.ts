import { Request } from 'express';
import { In } from 'typeorm';

import { ConsultantsRepository } from '@/src/common/repositories/crm';
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CommonService } from '@/src/common/common.service';
import { ErrorStatus } from '@/src/common/constants/error-status';
import { PositionsIds } from '@/src/common/enums/position.enum';
import { GetDiorCompanyConsultantsDto } from './companyConsultants.dto';
import { ConsultantForDiorT } from '@/src/common/types/entities/consultants.type';

@Injectable()
export class DiorCompanyConsultantsService {
    constructor(private commonService: CommonService, private readonly consultantRepository: ConsultantsRepository) {}

    async getDiorCompanyConsultants(req: Request, query: GetDiorCompanyConsultantsDto, locale: string = 'en') {
        try {
            const { search, country, filter_by, filter_by2, page, per } = query;

            const userId = (<{ id: string }>req.user).id;

            const currentConsultant = await this.consultantRepository.getConsultantById(Number(userId), [
                'consultant_branch',
            ]);

            const diorConsultant = await this.consultantRepository.getDiorConsultant();
            const diorCompanyId = diorConsultant.consultant_company_id;

            if (!currentConsultant) {
                throw new UnauthorizedException({
                    result_code: ErrorStatus.UNAUTHORIZED,
                    error: this.commonService.createLocaleErrorMessage(locale, 'unauthorized'),
                });
            }

            const consultantsQuery = await this.consultantRepository
                .createQueryBuilder('consultants')
                .where('consultants.consultant_company_id = :companyId', { companyId: diorCompanyId });

            if (Number(currentConsultant.consultant_position_id) === PositionsIds.SUPER_ADMIN) {
                consultantsQuery.andWhere('consultants.id != :diorConsultantId', {
                    diorConsultantId: diorConsultant.id,
                });
            } else if (Number(currentConsultant.consultant_position_id) === PositionsIds.ADMIN) {
                consultantsQuery
                    .andWhere('LOWER (consultants.country) IN (:...countries)', {
                        countries: currentConsultant.countries.map((country) => country.toLocaleLowerCase()),
                    })
                    .andWhere('consultants.id != :diorConsultantId', {
                        diorConsultantId: diorConsultant.id,
                    });
            } else {
                consultantsQuery
                    .andWhere('LOWER (consultants.country) = :country', {
                        country: currentConsultant.consultant_branch.country.toLocaleLowerCase(),
                    })
                    .andWhere('consultants.id != :diorConsultantId', {
                        diorConsultantId: diorConsultant.id,
                    });
            }

            consultantsQuery
                .andWhere('consultants.hide_for_bc = false')
                .andWhere('(LOWER (consultants.email) != :email OR LOWER (consultants.email) != :email2)', {
                    email: 'ann.chowis613@gmail.com',
                    email2: 'ann@chowis.com',
                });

            if (filter_by) {
                consultantsQuery.andWhere('LOWER (consultants.country) = :filterBy', {
                    filterBy: filter_by.toLocaleLowerCase(),
                });
            }

            if (filter_by2) {
                consultantsQuery.andWhere('consultants.consultant_branch_id = :filterBy2', {
                    filterBy2: filter_by2,
                });
            }

            if (country) {
                consultantsQuery.andWhere('LOWER (consultants.country) = :country', {
                    country: country.toLocaleLowerCase(),
                });
            }

            if (search) {
                consultantsQuery.andWhere(
                    '(consultants.country LIKE :search OR consultants.code LIKE :search OR consultants.email LIKE :search)',
                    {
                        search: `%${search}%`,
                    },
                );
            }

            const searchPage = Number(page || 1);
            const searchPer = Number(per || 10);

            const [consultants, totalCount] = await consultantsQuery
                .skip((searchPage - 1) * searchPer)
                .take(searchPer)
                .getManyAndCount();

            const reformatConsultantList: ConsultantForDiorT[] = consultants.map((consultant) => {
                const branch = consultant.consultant_branch;

                const posCode = branch ? branch.code : null;
                const posEmail = branch ? branch.email : null;

                return {
                    id: consultant.id,
                    name: consultant.name,
                    code: consultant.code,
                    email: consultant.email,
                    country: consultant.country,
                    status: consultant.convertStatus,
                    created_at: consultant.created_at,
                    pos_code: posCode,
                    pos_email: posEmail,
                };
            });

            return {
                data: reformatConsultantList,
                total_size: totalCount,
                current_page_size: reformatConsultantList.length,
                current_page: searchPage,
                total_pages: Math.ceil(totalCount / searchPer),
            };
        } catch (e) {
            throw e;
        }
    }

    async getConsultantByBranchesConsultant(req: Request, locale = 'en') {
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

    async deleteDiorCompanyConsultant(consultantId: string, locale = 'en') {
        try {
            const diorCompanyId = await this.consultantRepository.getDiorConsultantCompanyId();

            const foundConsultants = await this.consultantRepository.findOne({
                where: {
                    id: Number(consultantId),
                    consultant_company_id: diorCompanyId,
                },
            });

            await this.consultantRepository.remove(foundConsultants);

            return {
                message: 'Successfully deleted record',
            };
        } catch (e) {
            throw e;
        }
    }

    async deleteMultipleCompanyConsultants(consultantIds: string, locale = 'en') {
        try {
            const diorCompanyId = await this.consultantRepository.getDiorConsultantCompanyId();

            const removeIds = consultantIds.split(',').map((id) => Number(id));

            const foundConsultants = await this.consultantRepository.findOne({
                where: {
                    id: In(removeIds),
                    consultant_company_id: diorCompanyId,
                },
            });

            await this.consultantRepository.remove(foundConsultants);

            return {
                message: 'Successfully deleted multiple record',
            };
        } catch (e) {
            throw e;
        }
    }
}
