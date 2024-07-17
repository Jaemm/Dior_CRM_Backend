import { Injectable, NotFoundException } from '@nestjs/common';
import * as argon2 from 'argon2';

import { ConsultantsRepository } from '@/src/common/repositories/crm';

import { In } from 'typeorm';
import { CreateAdminDto, GetAdminsDto, UpdateAdminDto } from './diorAdmins.dto';
import { AdminsForDiorT } from '@/src/common/types/entities/admins.type';
import { ErrorStatus } from '@/src/common/constants/error-status';

@Injectable()
export class DiorAdminsService {
    constructor(private readonly consultantsRepository: ConsultantsRepository) {}

    async getAdmins(query: GetAdminsDto) {
        try {
            const { search, page, per, filter_by } = query;
            const diorConsultant = await this.consultantsRepository.getDiorConsultant();

            const adminsQuery = await this.consultantsRepository
                .createQueryBuilder('consultants')
                .where('consultants.consultant_position_id IN (:...positionIds)', { positionIds: [5, 6] })
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

            const searchPage = Number(page || 1);
            const searchPer = Number(per || 10);

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
                total_size: totalCount,
                current_page_size: reformatAdminList.length,
                current_page: searchPage,
                total_pages: Math.ceil(totalCount / searchPer),
            };
        } catch (e) {
            throw e;
        }
    }

    async createAdmin(body: CreateAdminDto) {
        try {
            const { email, password, name, surname, consultant_position_id, countries, is_admin } = body;

            const diorCompanyId = await this.consultantsRepository.getDiorConsultantCompanyId();

            const newAdmin = this.consultantsRepository.create({
                email: email,
                name: name,
                password_digest: await argon2.hash(password),
                surname: surname,
                consultant_company_id: diorCompanyId,
                consultant_position_id: Number(consultant_position_id),
                countries: countries,
                app_id: 88,
                email_confirmed: true,
                created_at: new Date(),
                updated_at: new Date(),
            });

            if (is_admin) {
                newAdmin.consultant_position_id = this.getPositionId(is_admin);
            }
            const savedAdmin = await this.consultantsRepository.save(newAdmin);

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
                    result_code: ErrorStatus.NOT_FOUND,
                });
            }

            admin.email = email ? email : admin.email;
            admin.password_digest = password ? await argon2.hash(password) : admin.password_digest;
            admin.name = name ? name : admin.name;
            admin.surname = surname ? surname : admin.surname;
            admin.consultant_position_id = this.getPositionId(is_admin);
            admin.countries = countries ? countries : admin.countries;

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

    getPositionId(isAdmin: string | boolean) {
        if (isAdmin === 'true' || isAdmin === 'yes' || isAdmin === true) {
            return 5;
        }

        return 6;
    }
}
