import { Request } from 'express';
import { In, Like } from 'typeorm';
import * as argon2 from 'argon2';
import * as csv from 'csv';

import {
    ConsultantBranchesRepository,
    ConsultantsRepository,
    CustomersRepository,
} from '@/src/common/repositories/crm';
import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CommonService } from '@/src/common/common.service';
import { ErrorStatus } from '@/src/common/constants/error-status';
import { PositionsIds } from '@/src/common/enums/position.enum';
import {
    CreateDiorCompanyConsultantsDto,
    ExportDiorCompanyConsultantsDto,
    GetDiorCompanyConsultantsDto,
    ImportDiorCompanyConsultantsDto,
} from './companyConsultants.dto';
import { ConsultantForDiorT } from '@/src/common/types/entities/consultants.type';
import { Consultants } from '@/src/common/entities/crmEntities';
import { AnalysisDataReplicationService } from '../../dataReplication/analysisDataReplication/analysisDataReplication.service';
import { ConsultantsService } from '../../consultants/consultants.service';

@Injectable()
export class DiorCompanyConsultantsService {
    private readonly saltRounds = 10;

    constructor(
        private commonService: CommonService,
        private analysisDataReplicationService: AnalysisDataReplicationService,
        // private consultant: ConsultantsService,
        // Repos
        private readonly customersRepository: CustomersRepository,
        private readonly consultantBranchesRepository: ConsultantBranchesRepository,
        private readonly consultantRepository: ConsultantsRepository,
    ) {}

    async createDiorCompanyConsultants(body: CreateDiorCompanyConsultantsDto, locale: string = 'en') {
        try {
            const diorCompanyId = await this.consultantRepository.getDiorConsultantCompanyId();

            // const hashedPassword = this.consultant.bcryptHashPassword(body.)

            const newConsultant = this.consultantRepository.create({
                name: body.name,
                code: body.code,
                // password_digest: hashedPassword,
                consultant_branch_id: body.consultant_branch_id,
                consultant_company_id: diorCompanyId,
                country: body.country,
                app_id: 88,
                status: 0,
                email: await this.generateEmailForDior(diorCompanyId),
                created_at: new Date(),
                updated_at: new Date(),
            });

            const savedConsultant = await this.consultantRepository.save(newConsultant);

            const consultantBranch = await this.consultantBranchesRepository.findOne({
                where: {
                    id: String(body.consultant_branch_id),
                },
            });

            return {
                id: savedConsultant.id,
                name: savedConsultant.name,
                code: savedConsultant.code,
                email: savedConsultant.email,
                created_at: savedConsultant.created_at,
                country: savedConsultant.country,
                status: savedConsultant.convertStatus,
                pos_code: consultantBranch ? consultantBranch.code : null,
                pos_email: consultantBranch ? consultantBranch.email : null,
            };
        } catch (e) {
            throw e;
        }
    }

    async getDiorCompanyConsultants(req: Request, query: GetDiorCompanyConsultantsDto, locale: string = 'en') {
        try {
            console.log(query);
            const { search, country, filter_by, filter_by_2, page, per } = query;

            const userId = (<{ id: string }>req.user).id;

            const currentConsultant = await this.consultantRepository.getConsultantById(Number(userId), [
                'consultant_branch',
            ]);

            // const diorConsultant = await this.consultantRepository.getDiorConsultant();
            console.log('diorConsultant', 8131);
            const diorCompanyId = 213; // diorConsultant.consultant_company_id;

            if (!currentConsultant) {
                throw new UnauthorizedException({
                    result_code: ErrorStatus.UNAUTHORIZED,
                    error: this.commonService.createLocaleErrorMessage(locale, 'unauthorized'),
                });
            }

            const consultantsQuery = await this.consultantRepository
                .createQueryBuilder('consultants')
                .leftJoinAndSelect('consultants.consultant_branch', 'consultant_branch')
                .where('consultants.consultant_company_id = :companyId', { companyId: diorCompanyId });

            if (Number(currentConsultant.consultant_position_id) === PositionsIds.SUPER_ADMIN) {
                consultantsQuery.andWhere('consultants.id != :diorConsultantId', {
                    diorConsultantId: 8131,
                });
            } else if (Number(currentConsultant.consultant_position_id) === PositionsIds.ADMIN) {
                consultantsQuery
                    .andWhere('LOWER (consultants.country) IN (:...countries)', {
                        countries: currentConsultant.countries.map((country) => country.toLocaleLowerCase()),
                    })
                    .andWhere('consultants.id != :diorConsultantId', {
                        diorConsultantId: 8131,
                    });
            } else {
                consultantsQuery
                    .andWhere('LOWER (consultants.country) = :country', {
                        country: currentConsultant.consultant_branch.country.toLocaleLowerCase(),
                    })
                    .andWhere('consultants.id != :diorConsultantId', {
                        diorConsultantId: 8131,
                    });
            }

            consultantsQuery.andWhere('consultants.hide_for_bc = false');

            consultantsQuery.andWhere('LOWER(consultants.email) NOT IN (:...excludedEmails)', {
                excludedEmails: ['ann.chowis613@gmail.com', 'ann@chowis.com'],
            });

            if (filter_by) {
                consultantsQuery.andWhere('LOWER (consultants.country) = :filterBy', {
                    filterBy: filter_by.toLocaleLowerCase(),
                });
            }

            if (filter_by_2) {
                consultantsQuery.andWhere('consultants.consultant_branch_id = :filter_by_2', {
                    filter_by_2: filter_by_2,
                });
            }

            if (country) {
                consultantsQuery.andWhere('LOWER (consultants.country) = :country', {
                    country: country.toLocaleLowerCase(),
                });
            }

            if (search) {
                consultantsQuery.andWhere(
                    '(consultants.country LIKE :search OR consultants.code LIKE :search OR consultant_branch.email LIKE :search)',
                    {
                        search: `%${search}%`,
                    },
                );
            }
            const searchPage = Number(page || 1);
            const searchPer = Number(per || 25);

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

            console.log(reformatConsultantList);
            return {
                total_size: totalCount,
                current_page_size: reformatConsultantList.length,
                current_page: searchPage,
                total_pages: Math.ceil(totalCount / searchPer),
                data: reformatConsultantList,
            };
        } catch (e) {
            throw e;
        }
    }
    
    // async getDiorCompanyConsultants(req: Request, query: GetDiorCompanyConsultantsDto, locale: string = 'en') {
    //     try {
    //         console.log(query);
    //         const { search, country, filter_by, filter_by_2, page, per } = query;
    
    //         const userId = (<{ id: string }>req.user).id;
    //         const currentConsultant = await this.consultantRepository.getConsultantById(Number(userId), ['consultant_branch']);
    
    //         const diorCompanyId = 213;
    
    //         if (!currentConsultant) {
    //             throw new UnauthorizedException({
    //                 result_code: ErrorStatus.UNAUTHORIZED,
    //                 error: this.commonService.createLocaleErrorMessage(locale, 'unauthorized'),
    //             });
    //         }
    
    //         const consultantsQuery = this.consultantRepository
    //             .createQueryBuilder('consultants')
    //             .where('consultants.consultant_company_id = :companyId', { companyId: diorCompanyId })
    //             .andWhere('consultants.hide_for_bc = false')
    //             .andWhere('LOWER(consultants.email) NOT IN (:...excludedEmails)', {
    //                 excludedEmails: ['ann.chowis613@gmail.com', 'ann@chowis.com'],
    //             });
    
    //         if (Number(currentConsultant.consultant_position_id) === PositionsIds.SUPER_ADMIN) {
    //             consultantsQuery.andWhere('consultants.id != :diorConsultantId', { diorConsultantId: 8131 });
    //         } else if (Number(currentConsultant.consultant_position_id) === PositionsIds.ADMIN) {
    //             consultantsQuery.andWhere('LOWER (consultants.country) IN (:...countries)', {
    //                 countries: currentConsultant.countries.map((country) => country.toLocaleLowerCase()),
    //             }).andWhere('consultants.id != :diorConsultantId', { diorConsultantId: 8131 });
    //         } else {
    //             consultantsQuery.andWhere('LOWER (consultants.country) = :country', {
    //                 country: currentConsultant.consultant_branch.country.toLocaleLowerCase(),
    //             }).andWhere('consultants.id != :diorConsultantId', { diorConsultantId: 8131 });
    //         }
    
    //         if (filter_by) {
    //             consultantsQuery.andWhere('LOWER (consultants.country) = :filterBy', { filterBy: filter_by.toLocaleLowerCase() });
    //         }
    
    //         if (filter_by_2) {
    //             consultantsQuery.andWhere('consultants.consultant_branch_id = :filter_by_2', { filter_by_2 });
    //         }
    
    //         if (country) {
    //             consultantsQuery.andWhere('LOWER (consultants.country) = :country', { country: country.toLocaleLowerCase() });
    //         }
    
    //         if (search) {
    //             consultantsQuery.andWhere(
    //                 '(consultants.country ILIKE :search OR consultants.code ILIKE :search OR consultant_branch.email ILIKE :search)',
    //                 { search: `%${search}%` }
    //             );
    //         }
    
    //         // 🚀 개수 먼저 가져오기
    //         const totalCount = await consultantsQuery.getCount();
    
    //         const searchPage = Number(page || 1);
    //         const searchPer = Number(per || 25);
    
    //         consultantsQuery.skip((searchPage - 1) * searchPer).take(searchPer);
    
    //         // 🚀 데이터 조회 (JOIN 최소화)
    //         const consultants = await consultantsQuery.getMany();
    
    //         const reformatConsultantList: ConsultantForDiorT[] = consultants.map((consultant) => {
    //             return {
    //                 id: consultant.id,
    //                 name: consultant.name,
    //                 code: consultant.code,
    //                 email: consultant.email,
    //                 country: consultant.country,
    //                 status: consultant.convertStatus,
    //                 created_at: consultant.created_at,
    //                 pos_code: consultant.consultant_branch?.code || null,
    //                 pos_email: consultant.consultant_branch?.email || null,
    //             };
    //         });
    
    //         return {
    //             data: reformatConsultantList,
    //             total_size: totalCount,
    //             current_page_size: reformatConsultantList.length,
    //             current_page: searchPage,
    //             total_pages: Math.ceil(totalCount / searchPer),
    //         };
    //     } catch (e) {
    //         throw e;
    //     }
    // }
    
    async getConsultantByBranchesConsultant(req: Request, locale = 'en') {
        const currentConsultantId = (<{ id: string }>req.user).id;
        const currentConsultant = await this.consultantRepository.findOne({
            where: { id: Number(currentConsultantId) },
            relations: ['consultant_branch'],
        });

        if (!currentConsultant) {
            throw new Error('Consultant not found');
        }

        const consultants = await this.consultantRepository.find({
            where: [
                {
                    consultant_branch: { id: currentConsultant?.consultant_branch?.id },
                    country: currentConsultant?.consultant_branch?.country,
                },
                { id: currentConsultant.id },
            ],
        });

        // Filter out specific emails
        const finalData = consultants
            .filter(
                (consultant) =>
                    consultant.email.toLowerCase() !== 'ann.chowis613@gmail.com' &&
                    consultant.email.toLowerCase() !== 'ann@chowis.com',
            )
            .map((consultant) => ({
                id: consultant.id,
                email: consultant.email,
                code: consultant.code,
                name: consultant.name,
                surname: consultant.surname,
                country: consultant.country,
            }));

        const data: {
            id: number;
            email: string;
            code: string;
            name: string;
            surname: string;
        }[] = finalData.map((row) => {
            return {
                id: row.id,
                email: row.email,
                code: row.code,
                name: row.name,
                surname: row.surname,
                country: row.country,
            };
        });

        return {
            data,
        };
    }

    // async getConsultantByBranchesConsultant(req: Request, locale = 'en') {
    //     try {
    //         const userId = (<{ id: string }>req.user).id;

    //         const currentConsultant = await this.consultantRepository.findOne({
    //             where: { id: Number(userId) },
    //             relations: ['consultant_branch'],
    //         });

    //         if (!currentConsultant) {
    //             throw new UnauthorizedException({
    //                 result_code: ErrorStatus.UNAUTHORIZED,
    //                 error: this.commonService.createLocaleErrorMessage(locale, 'unauthorized'),
    //             });
    //         }

    //         const branch = currentConsultant.consultant_branch;
    //         console.log('===> ', branch);

    //         if (!branch) {
    //             throw new NotFoundException({
    //                 result_code: ErrorStatus.NOT_FOUND,
    //             });
    //         }

    //         // const consultantsByBranch = await this.consultantRepository
    //         //     .createQueryBuilder('consultants')
    //         //     .where(
    //         //         'consultants.email != :email OR consultants.email != :email2 OR consultant_branch_id = :branch_id',
    //         //         {
    //         //             email: 'ann.chowis613@gmail.com', // who is this...
    //         //             email2: 'ann@chowis.com',
    //         //             branch_id: currentConsultant.consultant_branch.id, // who is this...
    //         //         },
    //         //     )
    //         //     .getMany();

    //         const consultantsByBranch = await this.consultantRepository
    //             .createQueryBuilder('consultants')
    //             .where('consultants.consultant_branch_id = :branch_id', {
    //                 branch_id: currentConsultant.consultant_branch.id, // who is this...
    //             })
    //             .getMany();

    //         const data: {
    //             id: number;
    //             email: string;
    //             code: string;
    //             name: string;
    //             surname: string;
    //         }[] = consultantsByBranch.map((row) => {
    //             return {
    //                 id: row.id,
    //                 email: row.email,
    //                 code: row.code,
    //                 name: row.name,
    //                 surname: row.surname,
    //             };
    //         });

    //         return {
    //             data,
    //         };
    //     } catch (e) {
    //         throw e;
    //     }
    // }

    async deleteDiorCompanyConsultant(consultantId: string, locale = 'en') {
        try {
            const diorCompanyId = await this.consultantRepository.getDiorConsultantCompanyId();

            const foundConsultants = await this.consultantRepository.findOne({
                where: {
                    id: Number(consultantId),
                    consultant_company_id: diorCompanyId,
                },
            });

            if (!foundConsultants) {
                throw new NotFoundException({
                    result_code: ErrorStatus.RECORD_NOT_FOUND,
                    error: this.commonService.createLocaleErrorMessage(locale, 'record_not_found'),
                });
            }

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

    async exportDiorCompanyConsultant(req: Request, query: ExportDiorCompanyConsultantsDto, locale: string = 'en') {
        try {
            const { search, filter_by, filter_by2, ids } = query;

            const userId = (<{ id: string }>req.user).id;
            const currentConsultant = await this.consultantRepository.getConsultantById(userId);

            const diorConsultant = await this.consultantRepository.getDiorConsultant();

            if (!currentConsultant) {
                throw new UnauthorizedException({
                    result_code: ErrorStatus.UNAUTHORIZED,
                    error: this.commonService.createLocaleErrorMessage(locale, 'unauthorized'),
                });
            }

            const consultantQuery = await this.consultantRepository
                .createQueryBuilder('consultants')
                .leftJoinAndSelect('consultants.consultant_branch', 'consultant_branch')
                .where('consultants.id != :diorConsultantId', {
                    diorConsultantId: 8131,
                });

            if ([5, 6].includes(currentConsultant.consultant_position_id)) {
            } else {
                const branch = currentConsultant.consultant_branch;

                const country = branch ? branch.country : null;

                consultantQuery.andWhere('LOWER (consultants.country) = :country', {
                    country: country?.toLocaleLowerCase(),
                });
            }

            if (filter_by) {
                consultantQuery.andWhere('LOWER (consultants.country) = :filterBy', {
                    filterBy: filter_by.toLocaleLowerCase(),
                });
            }

            if (filter_by2) {
                consultantQuery.andWhere('consultants.consultant_branch_id = :branchId', {
                    branchId: filter_by2,
                });
            }

            if (search) {
                consultantQuery.andWhere(
                    '(consultants.country LIKE :search OR consultants.code LIKE :search OR consultants.email LIKE :search)',
                    {
                        search: `%${search}%`,
                    },
                );
            }

            if (ids) {
                const splitIds = ids.split(',');

                consultantQuery.andWhere('consultants.id IN (:...ids)', {
                    ids: splitIds,
                });
            }

            const consultants = await consultantQuery.getMany();

            return await this.createCSVFileForExportCompanyConsultant(consultants);
        } catch (e) {
            throw e;
        }
    }

    async importDiorCompanyConsultants(req: Request, body: ImportDiorCompanyConsultantsDto, locale: string = 'en') {
        try {
            const splitToken = req.headers.authorization.split(' ');

            const token = splitToken[1];

            const fileUrl = body.file_url;
            const worksheet = await this.commonService.getWorkSheetByHTTP(fileUrl, token);

            const diorCompanyId = await this.consultantRepository.getDiorConsultantCompanyId();

            const header = worksheet.getRow(1);

            const rowCount = worksheet.rowCount + 1;

            for (let i = 2; i < rowCount; i++) {
                const row = worksheet.getRow(i);

                const bcCode = row.getCell(3).value.toLocaleString();
                const posCode = row.getCell(2).value.toLocaleString();

                // const consultant = await this.consultantRepository.findOneBy({
                //     code: bcCode,
                // });

                // if (consultant) {
                //     continue;
                // }

                console.log('----->====>', row.getCell(5).value);

                const branch = await this.consultantBranchesRepository.findOneBy({
                    code: posCode,
                });

                const status = row.getCell(6).value === 'active' ? 0 : 1;

                const newConsultant = this.consultantRepository.create({
                    country: row.getCell(1).value.toLocaleString(),
                    code: bcCode,
                    name: row.getCell(4).value.toLocaleString(),
                    status: status,
                    consultant_branch_id: Number(branch?.id || null),
                    email: row.getCell(5).value.toLocaleString(),
                    consultant_company_id: diorCompanyId,
                    created_at: new Date(),
                    updated_at: new Date(),
                });

                console.log('------>', newConsultant);

                const saved = await this.consultantRepository.save(newConsultant);
            }

            return {
                message: 'Success import data',
            };
        } catch (e) {
            throw e;
        }
    }

    /**
     * Utils
     */
    async generateEmailForDior(diorCompanyId: number) {
        const diorDummyEmailsConsultants = await this.consultantRepository.find({
            where: {
                consultant_company_id: diorCompanyId,
                email: Like(`%dior_dummy_emails%`),
            },
        });

        if (!diorDummyEmailsConsultants || diorDummyEmailsConsultants.length < 1) {
            return 'dior_dummy_emails1@chowis-test.com';
        }

        let lastEmailNumber = 0;

        for (let i = 0; i < diorDummyEmailsConsultants.length; i++) {
            const consultant = diorDummyEmailsConsultants[i];

            const email = consultant.email;
            const str1MarkerString = 'dior_dummy_emails';
            const str2MarkerString = '@chowis-test.com';

            const existEmailRegex = new RegExp(`${str1MarkerString}(.*?)${str2MarkerString}`, 'm');

            const match = email.match(existEmailRegex);

            const number = match ? parseInt(match[1], 10) : 0;

            if (lastEmailNumber < number) {
                lastEmailNumber = number;
            }
        }

        const nextEmailNumber = lastEmailNumber + 1;

        return `dior_dummy_emails${nextEmailNumber}@chowis-test.com`;
    }

    async createCSVFileForExportCompanyConsultant(consultants: Consultants[]) {
        const header = [
            'Country',
            'POS Code',
            'BC Name',
            'BC Email',
            'Is Active',
            'Total Consultations',
            'Last Consultation Date',
        ];

        const asyncRecords = consultants.map(async (u) => {
            const customers = await this.customersRepository.find({
                select: ['id'],
                where: {
                    consultant_id: u.id,
                },
            });

            const customerIds = customers.map((customer) => customer.id);

            const { count, lastConsultationTime } =
                await this.analysisDataReplicationService.getConsultationsInfoForDior(customerIds);

            return [
                u.country,
                u.consultant_branch?.code,
                u.name,
                u.email,
                u.convertStatus,
                count,
                lastConsultationTime,
            ];
        });

        const records = await Promise.all(asyncRecords);

        return await new Promise((resolve, reject) => {
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
