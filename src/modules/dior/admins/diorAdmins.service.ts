import { extname } from 'path';

import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import * as argon2 from 'argon2';
import * as csv from 'csv';
import { Request } from 'express';

import { ConsultantsRepository } from '@/src/common/repositories/crm';

import { In } from 'typeorm';
import { CreateAdminDto, ExportAdminsDto, GetAdminsDto, ImportAdminsDto, UpdateAdminDto } from './diorAdmins.dto';
import { AdminsForDiorT } from '@/src/common/types/entities/admins.type';
import { ErrorStatus } from '@/src/common/constants/error-status';
import { String } from 'aws-sdk/clients/acm';
import { Consultants } from '@/src/common/entities/crmEntities';
import { CommonService } from '@/src/common/common.service';

@Injectable()
export class DiorAdminsService {
    constructor(private commonService: CommonService, private readonly consultantsRepository: ConsultantsRepository) {}

    async getAdmins(query: GetAdminsDto) {
        try {
            const { search, page, per, filter_by } = query;
            const diorConsultant = await this.consultantsRepository.getDiorConsultant();

            const adminsQuery = await this.consultantsRepository
                .createQueryBuilder('consultants')
                .where('consultants.consultant_company = :companyId', {
                    companyId: diorConsultant.consultant_company_id,
                })
                .andWhere('consultants.consultant_position_id IN (:...positionIds)', { positionIds: [5, 6] })
                .andWhere('consultants.id != :consultantId', { consultantId: diorConsultant.id });

            if (search) {
                adminsQuery.andWhere('(consultants.name LIKE :search OR consultants.surname LIKE :search)', {
                    search: `%${search}%`,
                });
            }

            if (filter_by) {
                adminsQuery.andWhere('consultants.countries && :filterBy', {
                    filterBy: `{${filter_by}}`,
                });
            }

            const searchPage = Number(page || '');
            const searchPer = Number(per || '');

            const [admins, totalCount] = await adminsQuery
                .skip((searchPage - 1) * searchPer)
                .take(searchPer)
                .getManyAndCount();

            const reformatAdminList: AdminsForDiorT[] = admins.map((admin) => {
                return {
                    id: admin.id,
                    email: admin.email,
                    name: admin.name,
                    surname: admin.surname,
                    consultant_position_id: admin.consultant_position_id,
                    countries: admin.countries,
                };
            });

            return {
                data: reformatAdminList,
                // total_size: totalCount,
                // current_page_size: reformatAdminList.length,
                // current_page: searchPage,
                // total_pages: Math.ceil(totalCount / searchPer),
            };
        } catch (e) {
            throw e;
        }
    }

    async createAdmin(body: CreateAdminDto) {
        try {
            const { email, password, name, surname, consultant_position_id, countries, is_admin } = body;

            const diorCompanyId = await this.consultantsRepository.getDiorConsultantCompanyId();

            const existConsultant = await this.consultantsRepository.findByEmail(email);

            let adminUser: Consultants;
            if (existConsultant) {
                adminUser = existConsultant;
                adminUser.consultant_position_id = consultant_position_id;

                adminUser.password_digest = password ? await argon2.hash(password) : existConsultant.password_digest;
                adminUser.name = name ? name : adminUser.name;
                adminUser.surname = surname ? surname : adminUser.surname;
                adminUser.countries = countries ? countries : adminUser.countries;
            } else {
                adminUser = this.consultantsRepository.create({
                    email: email,
                    name: name,
                    password_digest: await argon2.hash(password),
                    surname: surname,
                    consultant_company_id: diorCompanyId,
                    consultant_position_id: consultant_position_id,
                    countries: countries,
                    app_id: 88,
                    email_confirmed: true,
                    created_at: new Date(),
                    updated_at: new Date(),
                });
            }

            if (is_admin) {
                adminUser.consultant_position_id = this.getPositionId(is_admin);
            }
            const savedAdmin = await this.consultantsRepository.save(adminUser);

            const reformatAdmin: AdminsForDiorT = {
                id: savedAdmin.id,
                email: savedAdmin.email,
                name: savedAdmin.name,
                surname: savedAdmin.surname,
                consultant_position_id: savedAdmin.consultant_position_id,
                countries: savedAdmin.countries,
            };

            return reformatAdmin;
        } catch (e) {
            throw e;
        }
    }

    async updateAdminById(adminId: string, body: UpdateAdminDto, locale = 'en') {
        try {
            const { email, password, name, surname, consultant_position_id, countries, is_admin } = body;

            const diorCompanyId = await this.consultantsRepository.getDiorConsultantCompanyId();

            const admin = await this.consultantsRepository.findOne({
                where: {
                    consultant_company_id: diorCompanyId,
                    id: Number(adminId),
                },
            });

            if (!admin) {
                throw new NotFoundException({
                    result_code: ErrorStatus.RECORD_NOT_FOUND,
                    error: this.commonService.createLocaleErrorMessage(locale, 'record_not_found'),
                });
            }

            admin.email = email ? email : admin.email;
            admin.password_digest = password ? await argon2.hash(password) : admin.password_digest;
            admin.name = name ? name : admin.name;
            admin.surname = surname ? surname : admin.surname;
            admin.consultant_position_id = this.getPositionId(is_admin);
            admin.countries = countries && countries.length > 0 ? countries : admin.countries;
            admin.updated_at = new Date();

            const savedAdmin = await this.consultantsRepository.save(admin);

            const reformatAdmin: AdminsForDiorT = {
                id: savedAdmin.id,
                email: savedAdmin.email,
                name: savedAdmin.name,
                surname: savedAdmin.surname,
                consultant_position_id: savedAdmin.consultant_position_id,
                countries: savedAdmin.countries,
            };

            return reformatAdmin;
        } catch (e) {
            throw e;
        }
    }

    async deleteMutipleAdmins(adminIds: string) {
        try {
            const adminIdList = adminIds.split(',').map((id) => Number(id));

            const diorCompanyId = await this.consultantsRepository.getDiorConsultantCompanyId();

            const adminList = await this.consultantsRepository.find({
                where: {
                    consultant_company_id: diorCompanyId,
                    id: In(adminIdList),
                },
            });

            await this.consultantsRepository.remove(adminList);

            return {
                message: 'Successfully deleted multiple record of users',
            };
        } catch (e) {
            throw e;
        }
    }

    async importAdmins(req: Request, body: ImportAdminsDto) {
        try {
            const splitToken = req.headers.authorization.split(' ');

            const token = splitToken[1];

            const fileUrl = body.file_url;

            const fileExtends = extname(fileUrl);

            const worksheet = await this.commonService.getWorkSheetByHTTP(fileUrl, token);

            const headers = worksheet.getRow(1);

            const rowCount = worksheet.rowCount + 1;

            const diorCompanyId = await this.consultantsRepository.getDiorConsultantCompanyId();

            for (let i = 2; i < rowCount; i++) {
                const row = worksheet.getRow(i);

                const emailText = (<{ text: string }>row.getCell(3).value)?.text;
                const password = await argon2.hash(row.getCell(4).value as string);

                const email = emailText ? emailText : row.getCell(3).value.toString();

                const newConsultant = this.consultantsRepository.create({
                    name: row.getCell(1).value as string,
                    surname: row.getCell(2).value as string,
                    email: email,
                    password_digest: password,
                    countries: (row.getCell(5).value as string).split(','),
                    consultant_position_id: this.getPositionId((row.getCell(6).value as string).toLocaleLowerCase()),
                    app_id: 88,
                    email_confirmed: true,
                    consultant_company_id: diorCompanyId,
                    created_at: new Date(),
                    updated_at: new Date(),
                });

                try {
                    await this.consultantsRepository.save(newConsultant);
                } catch (e) {
                    throw new BadRequestException({
                        result_code: ErrorStatus.DATA_ALREADY_EXIST,
                        error: `data already exist. email: ${email}`,
                    });
                }
            }

            return {
                message: 'Success import data',
            };
        } catch (e) {
            throw e;
        }
    }

    async exportAdmins(query: ExportAdminsDto) {
        try {
            const diorConsultant = await this.consultantsRepository.getDiorConsultant();

            const adminsQuery = await this.consultantsRepository
                .createQueryBuilder('admins')
                .where('admins.consultant_position_id IN (:...positionId)', {
                    positionId: [5, 6],
                })
                .andWhere('admins.id != :diorConsultantId', { diorConsultantId: diorConsultant.id });

            if (query.search) {
                adminsQuery.andWhere('(admins.name LIKE :search OR admins.surname LIKE :search)', {
                    search: `%${query.search}%`,
                });
            }

            const admins = await adminsQuery.getMany();

            return await this.writeCSVFileForExportByConsultants(admins);
        } catch (e) {
            throw e;
        }
    }

    writeCSVFileForExportByConsultants(admins: Consultants[]) {
        const header = ['First Name', 'Last Name', 'Email', 'Countries', 'Is Admin'];

        const records = admins.map((u) => [u.name, u.surname, u.email, u.countries, u.consultant_position_id === 5]);

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

    getPositionId(isAdmin: string | boolean) {
        if (isAdmin === 'true' || isAdmin === 'yes' || isAdmin === true) {
            return 5;
        }

        return 6;
    }
}
