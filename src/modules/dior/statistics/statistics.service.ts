import { Request } from 'express';

import { Module, UnauthorizedException, Injectable } from '@nestjs/common';
import { GetOverAllDto } from './statistics.dto';
import {
    ConsultantBranchesRepository,
    ConsultantsRepository,
    CustomersRepository,
    DevicesRepository,
    ProductsRepository,
    SalesConnectionRepository,
} from '@/src/common/repositories/crm';
import { ErrorStatus } from '@/src/common/constants/error-status';
import { PositionsIds } from '@/src/common/enums/position.enum';
import { In } from 'typeorm';
import { AnalysisDataReplicationModule } from '../../dataReplication/analysisDataReplication/analysisDataReplication.module';
import { AnalysisDataReplicationService } from '../../dataReplication/analysisDataReplication/analysisDataReplication.service';
import { ConsultantBranches, Consultants, Devices } from '@/src/common/entities/crmEntities';

@Injectable()
export class StatisticsService {
    constructor(
        private analysisDataReplicationService: AnalysisDataReplicationService,

        // Repos
        private readonly consultantRepository: ConsultantsRepository,
        private readonly customerRepository: CustomersRepository,
        private readonly salesConnRepository: SalesConnectionRepository,
        private readonly branchesRepository: ConsultantBranchesRepository,
        private readonly devicesRepository: DevicesRepository,
        private readonly productRepository: ProductsRepository,
    ) {}

    async getOverAll(req: Request, query: GetOverAllDto, locale: string = 'en') {
        try {
            const { start_date, end_date } = query;

            const userId = (<{ id: string }>req.user).id;
            const currentConsultant = await this.consultantRepository.getConsultantById(userId, ['consultant_branch']);
            const diorCompanyId = await this.consultantRepository.getDiorConsultantCompanyId();

            if (!currentConsultant) {
                throw new UnauthorizedException({
                    resule_code: ErrorStatus.UNAUTHORIZED,
                });
            }

            const salesConnQuery = this.salesConnRepository
                .createQueryBuilder('salesConn')
                .select('COUNT(DISTINCT salesConn.batchId)', 'count')
                .where('salesConn.batchId IS NOT NULL');

            if (start_date && end_date) {
                salesConnQuery.andWhere(`salesConn.createdAt BETWEEN ${start_date} 00:00:00 AND ${end_date} 23:59:59`);
            }

            const { count: totalSalesConnections } = await salesConnQuery.getRawOne();

            const branchQuery = await this.branchesRepository
                .createQueryBuilder('branches')
                .where('branches.consultantCompanyId = :diorCompanyId', {
                    diorCompanyId,
                });

            if (start_date && end_date) {
                branchQuery.andWhere(`branches.createdAt BETWEEN ${start_date} 00:00:00 AND ${end_date} 23:59:59`);
            }

            const diorBranches = await branchQuery.getMany();
            const diorDevices = await this.devicesRepository.findBy({ consultant_company_id: diorCompanyId });

            let consultants: Consultants[] = [];
            let devices: Devices[] = [];
            let branches: Consultants[] = [];
            let consultation;
            let customer;
            let totalClients;
            let products;
            if ([PositionsIds.BRAND_MANAGER, PositionsIds.ADMIN].includes(currentConsultant.consultant_position_id)) {
                const consultantQuery = await this.consultantRepository
                    .createQueryBuilder('consultants')
                    .where('consultants.id NOT IN (:...ids)', {
                        ids: [11156, 9304],
                    });
                if (PositionsIds.ADMIN === Number(currentConsultant.consultant_position_id)) {
                    consultantQuery.andWhere('LOWER (consultants.country) IN (:...countries)', {
                        countries: currentConsultant.countries.map((country) => country.toLocaleLowerCase()),
                    });
                } else if (PositionsIds.BRAND_MANAGER === Number(currentConsultant.consultant_position_id)) {
                    consultantQuery.andWhere('LOWER (consultants.country) = :country', {
                        country: currentConsultant.consultant_branch?.country?.toLocaleLowerCase(),
                    });
                }
                consultants = await consultantQuery.getMany();

                const deviceQuery = this.productRepository
                    .createQueryBuilder('products')
                    .select('DISTINCT (products.deviceId)', 'deviceIds')
                    .where('products.consultantId IN (:...consultantIds)', {
                        consultantIds: consultants.map((consultant) => consultant.id),
                    });

                const { deviceIds } = await deviceQuery.getRawOne();
                devices = deviceIds;

                const [cus, total] = await this.customerRepository.findAndCount({
                    where: {
                        consultant_id: In(consultants.map((consultant) => consultant.id)),
                    },
                });
                customer = cus;
                totalClients = total;

                const branchQuery = this.consultantRepository
                    .createQueryBuilder('consultants')
                    .select('DISTINCT (.consultant_branch_id)', 'branchId')
                    .leftJoinAndSelect('consultants.consultant_branch', 'consultant_branch')
                    .where('consultants.id IN (:...consultantIds)', {
                        consultantIds: consultants.map((consultant) => consultant.id),
                    });
                if (start_date && end_date) {
                    branchQuery.andWhere(`consultant_branch.created_at BETWEEN ${start_date} AND ${end_date}`);
                }

                branches = await branchQuery.getMany();
                consultation = await this.analysisDataReplicationService.getConsultationByConsultant(consultants);
            } else if (PositionsIds.SUPER_ADMIN === Number(currentConsultant.consultant_position_id)) {
                consultants = await this.consultantRepository
                    .createQueryBuilder('consultants')
                    .where('consultants.consultant_branch_id IN (:...branchIds)', {
                        branchIds: diorBranches.map((branch) => branch.id),
                    })
                    .andWhere('consultants.id NOT IN (:...ids)', {
                        ids: [11156, 9304],
                    })
                    .getMany();

                const customerQuery = this.customerRepository.createQueryBuilder('customers');

                if (start_date && end_date) {
                    customerQuery.andWhere(
                        `customers.created_at BETWEEN ${start_date} 00:00:00 AND ${end_date} 23:59:59`,
                    );
                }

                const [customerList, total] = await customerQuery.getManyAndCount();

                totalClients = total;
                customer = customerList;

                consultation = await this.analysisDataReplicationService.getConsultantions();

                products = await this.productRepository.find({
                    where: {
                        consultant_id: In(consultants.map((consultant) => consultant.id)),
                    },
                });

                devices = await this.devicesRepository.find({
                    where: {
                        id: In(products.map((product) => product.device_id)),
                    },
                });
                devices = await this.devicesRepository
                    .createQueryBuilder('devices')
                    .where('devices.id IN (:...ids)', {
                        ids: devices.map((d) => d.id),
                    })
                    .orWhere('devices.id IN (:...ids)', {
                        ids: diorDevices.map((d) => d.id),
                    })
                    .getMany();
            } else {
                totalClients = 0;
                consultation = [];
                devices = [];
                branches = [];
            }

            if (Number(currentConsultant.consultant_position_id) === 6) {
                const branchs = await this.branchesRepository.find({
                    where: {
                        consultantCompanyId: String(diorCompanyId),
                    },
                });

                const consults = await this.consultantRepository.find({
                    where: {
                        consultant_branch_id: In(branchs.map((b) => b.id)),
                    },
                });

                const prods = await this.productRepository.find({
                    where: {
                        consultant_id: In(consults.map((c) => c.id)),
                    },
                });

                const devicess = await this.devicesRepository.find({
                    where: {
                        id: In(prods.map((p) => p.id)),
                    },
                });

                devices = await this.devicesRepository
                    .createQueryBuilder('devices')
                    .where('devices.id IN (:...ids)', {
                        ids: devices.map((d) => d.id),
                    })
                    .orWhere('devices.id IN (:...ids)', {
                        ids: devicess.map((d) => d.id),
                    })
                    .getMany();
            }

            const deviceQuery = this.devicesRepository
                .createQueryBuilder('devices')
                .where('devices.optic_number NOT IN (:...opticNumbers)', {
                    opticNumbers: ['FAB02135', 'FAB02363', 'FAB02709', 'DVAA4496'],
                })
                .andWhere('devices.id IN (:...ids)', {
                    ids: devices.map((d) => d.id),
                });

            if (start_date && end_date) {
                deviceQuery.andWhere(`devices.refresh_date BETWEEN ${start_date} 00:00:00 AND ${end_date} 23:59:59`);
            }

            devices = await deviceQuery.getMany();

            return {
                total_clients: totalClients,
                total_consultations: consultation.length,
                total_analysis: consultants.length,
                consultation_time: 73.5,
                total_devices: devices.length,
                total_branches: branches.length,
                total_offline_consultations: totalSalesConnections,
            };
        } catch (e) {
            throw e;
        }
    }
}
