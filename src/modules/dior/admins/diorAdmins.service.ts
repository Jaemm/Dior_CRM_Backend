import { ConsultantsRepository } from '@/src/common/repositories/crm';
import { Injectable } from '@nestjs/common';
import { In } from 'typeorm';
import { GetAdminsDto } from './diorAdmins.dto';
import { AdminsForDiorT } from '@/src/common/types/entities/admins.type';

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
}
