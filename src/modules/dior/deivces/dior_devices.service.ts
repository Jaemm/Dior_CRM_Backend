import { Request } from 'express';

import { Injectable } from '@nestjs/common';
import { GetDevicesDto } from './dior_devices.dto';
import {
    ConsultantCompaniesRepository,
    ConsultantsRepository,
    DevicesRepository,
    ProductsRepository,
} from '@/src/common/repositories/crm';
import { Consultants } from '@/src/common/entities/crmEntities';

import { In } from 'typeorm';

@Injectable()
export class DiorDevicesService {
    constructor(
        private readonly consultantsRespository: ConsultantsRepository,
        private readonly productsRepository: ProductsRepository,
        private readonly devicesRepository: DevicesRepository,
    ) {}

    async getDevices(req: Request, query: GetDevicesDto, locale = 'en') {
        try {
            const userId = (<{ id: string }>req.user).id;

            const currentConsultant = await this.consultantsRespository.getConsultantById(userId, [
                'consultant_branch',
            ]);

            const positionId = currentConsultant.consultant_position_id;

            const diorConsultant = await this.consultantsRespository.getDiorConsultant();

            const consultantsQuery = await this.consultantsRespository.createQueryBuilder('consultants');
            if ([5, 6].includes(Number(positionId))) {
                consultantsQuery.where('consultants.consultant_company_id = :diorCompany', {
                    diorCompany: diorConsultant.consultant_company_id,
                });
            } else if ([6].includes(positionId)) {
                consultantsQuery.andWhere('LOWER (consultants.country) IN (:...countries)', {
                    countries: currentConsultant.countries.map((country) => country.toLocaleLowerCase()),
                });
            } else {
                consultantsQuery.andWhere('LOWER (consultants.country) = :country', {
                    country: currentConsultant.consultant_branch.country.toLocaleLowerCase(),
                });
            }

            consultantsQuery.andWhere('consultants.id NOT IN (:...consultantIds)', { consultantIds: [11156, 9304] });

            const consultants = await consultantsQuery.getMany();

            const products = await this.productsRepository.find({
                where: {
                    consultant_id: In(consultants.map((row) => row.id)),
                },
            });

            const deviceQuery = await this.devicesRepository
                .createQueryBuilder('devices')
                .where('devices.consultant_id IN (:...deviceIds)', {
                    deviceIds: products.map((row) => row.device_id),
                })
                .orWhere('devices.consultant_company_id IN (:...companyId)', {
                    companyId: diorConsultant.consultant_company_id,
                })
                .andWhere('devices.optic_numer NOT IN (:...opticNumbers)', {
                    opticNumbers: ['FAB02135', 'FAB02363', 'FAB02709', 'DVAA4496'],
                });

            if (query.search) {
                deviceQuery.andWhere('devices.optic_number LIKE :search', {
                    search: `%${query.search}%`,
                });
            }

            const searchPage = Number(query?.page || 1);
            const searchPer = Number(query?.limit || 10);

            const [devices, totalCount] = await deviceQuery
                .skip((searchPage - 1) * searchPer)
                .take(searchPer)
                .getManyAndCount();

            return {
                data: devices,
                total_size: totalCount,
                current_page_size: devices.length,
                current_page: searchPage,
                total_pages: Math.ceil(totalCount / searchPer),
            };
        } catch (e) {
            throw e;
        }
    }
}
