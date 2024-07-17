import { Request } from 'express';
import * as argon2 from 'argon2';
import * as csv from 'csv';

import { In } from 'typeorm';

import { ConsultantBranchesRepository, ConsultantsRepository, ProductsRepository } from '@/src/common/repositories/crm';
import { ConsultantBranchesForDiorT } from '@/src/common/types/entities';
import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateBranchesDto, ExportBranchesDto, SearchBranchesDto, UpdateBranchesDto } from './companyBranches.dto';
import { ErrorStatus } from '@/src/common/constants/error-status';
import { CommonService } from '@/src/common/common.service';
import { ConsultantBranches } from '@/src/common/entities/crmEntities';

@Injectable()
export class DiorCompanyBranchesService {
    constructor(
        private commonService: CommonService,
        private readonly consultantRepository: ConsultantsRepository,
        private readonly consultantBranchesRepository: ConsultantBranchesRepository,
        private readonly productsRepository: ProductsRepository,
    ) {}

    async createBranch(req: Request, body: CreateBranchesDto) {
        try {
            const diorCompanyId = await this.consultantRepository.getDiorConsultantCompanyId();

            const { email, name, code, password, country } = body;

            if (!diorCompanyId) {
                throw new NotFoundException();
            }

            const newBranch = this.consultantBranchesRepository.create({
                consultantCompanyId: String(diorCompanyId),
                email,
                name,
                password,
                country,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            const savedBranch = await this.consultantBranchesRepository.save(newBranch);

            const reformatBranch: ConsultantBranchesForDiorT = {
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

            const branchQuery = this.consultantBranchesRepository.createQueryBuilder('branch');

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

            const reformatBranches: Promise<ConsultantBranchesForDiorT>[] = branches.map(async (branch) => {
                const totalDevices = await this.productsRepository.getNewOpticNumbersCountByBranch(branch.id);

                const reformatBranch: ConsultantBranchesForDiorT = {
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

    async updateBranch(branchId: string, body: UpdateBranchesDto, locale = 'en') {
        try {
            const { email, name, code, password, country } = body;

            const diorCompanyId = await this.consultantRepository.getDiorConsultantCompanyId();

            const branch = await this.consultantBranchesRepository.findOne({
                where: {
                    id: branchId,
                    consultantCompanyId: String(diorCompanyId),
                },
            });

            if (!branch) {
                throw new NotFoundException({});
            }

            const hashedPassword = password ? await argon2.hash(password) : null;

            branch.email = email ? email : branch.email;
            branch.name = name ? name : branch.name;
            branch.code = code ? code : branch.code;
            branch.country = country ? country : branch.country;
            branch.password = hashedPassword ? hashedPassword : branch.password;

            const savedBranch = await this.consultantBranchesRepository.save(branch);

            const reformatBranch: ConsultantBranchesForDiorT = {
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

    async deleteBranch(branchId: string) {
        try {
            const diorCompanyId = await this.consultantRepository.getDiorConsultantCompanyId();

            const branch = await this.consultantBranchesRepository.findOne({
                where: {
                    id: branchId,
                    consultantCompanyId: String(diorCompanyId),
                },
            });

            await this.consultantBranchesRepository.remove(branch);

            return {
                message: 'Successfully deleted record',
            };
        } catch (e) {
            throw e;
        }
    }

    async deleteMultipleBranches(branchIds: string) {
        try {
            const splitIds = branchIds.split(',').map((id) => String(id));

            const diorCompanyId = await this.consultantRepository.getDiorConsultantCompanyId();

            const branches = await this.consultantBranchesRepository.find({
                where: {
                    consultantCompanyId: String(diorCompanyId),
                    id: In(splitIds),
                },
            });

            await this.consultantBranchesRepository.remove(branches);

            return {
                message: 'Successfully deleted multiple record',
            };
        } catch (e) {
            throw e;
        }
    }

    async exportBranches(req: Request, query: ExportBranchesDto, locale: string = 'en') {
        try {
            const { filter_by, search } = query;
            const userId = (<{ id: string }>req.user).id;
            const currentConsultant = await this.consultantRepository.getConsultantById(userId, ['consultant_branch']);

            const diorCompanyId = await this.consultantRepository.getDiorConsultantCompanyId();

            if (!currentConsultant) {
                throw new UnauthorizedException({
                    result_code: ErrorStatus.UNAUTHORIZED,
                    error: this.commonService.createLocaleErrorMessage(locale, 'unauthorized'),
                });
            }

            const branchQuery = await this.consultantBranchesRepository
                .createQueryBuilder('branches')
                .where('branches.consultantCompanyId = :companyId', {
                    companyId: diorCompanyId,
                });

            if (![5, 6].includes(currentConsultant.consultant_position_id)) {
                branchQuery.andWhere('LOWER (branches.country) = :country', {
                    country: currentConsultant?.consultant_branch?.country?.toLocaleLowerCase(),
                });
            }

            if (filter_by) {
                branchQuery.andWhere('LOWER (branches.country) = :filterBy', {
                    filterBy: filter_by.toLocaleLowerCase(),
                });
            }

            if (search) {
                branchQuery.andWhere(
                    '(branches.country LIKE :search OR branches.code LIKE :search OR branches.name LIKE :search OR branches.email LIKE :search)',
                    {
                        search: `%${search}%`,
                    },
                );
            }

            const branches = await branchQuery.getMany();

            return await this.writeCSVFileForExportByBranches(branches);
        } catch (e) {
            throw e;
        }
    }

    writeCSVFileForExportByBranches(branches: ConsultantBranches[]) {
        const header = ['POS Country', 'POS Code', 'POS Name', 'Email'];

        const records = branches.map((u) => [u.country, u.code, u.name, u.email]);

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
}
