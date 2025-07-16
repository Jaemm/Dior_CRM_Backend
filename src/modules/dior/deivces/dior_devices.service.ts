import { Request } from 'express';

import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { GetDevicesDto, ResetConnectDto } from './dior_devices.dto';
import {
    ConsultantCompaniesRepository,
    ConsultantsRepository,
    DevicesRepository,
    ProductLogsRepository,
    ProductsRepository,
} from '@/src/common/repositories/crm';
import { Consultants, Devices } from '@/src/common/entities/crmEntities';

import { In } from 'typeorm';
import { DeviceForDiorT } from '@/src/common/types/entities';
import { ErrorStatus } from '@/src/common/constants/error-status';
import { CommonService } from '@/src/common/common.service';

@Injectable()
export class DiorDevicesService {
    constructor(
        private commonService: CommonService,

        private readonly consultantsRespository: ConsultantsRepository,
        private readonly productsRepository: ProductsRepository,
        private readonly devicesRepository: DevicesRepository,
        private readonly productLogsRepository: ProductLogsRepository,
    ) {}

    async getDevices(req: Request, query: GetDevicesDto, locale = 'en') {
        try {
            const userId = (<{ id: string }>req.user).id;

            // Step 1: Get the current consultant
            const currentConsultant = await this.consultantsRespository.getConsultantById(userId, [
                'consultant_branch',
            ]);
            const positionId = currentConsultant.consultant_position_id;

            // Step 2: Build consultants query based on positionId
            const consultantsQuery = this.consultantsRespository.createQueryBuilder('consultants');

            if ([5, 6].includes(Number(positionId))) {
                consultantsQuery.where('consultants.consultant_company_id = :diorCompany', {
                    diorCompany: 213,
                });
            } else if (positionId === 6) {
                consultantsQuery.andWhere('LOWER(consultants.country) IN (:...countries)', {
                    countries: currentConsultant?.countries.map((country) => country.toLocaleLowerCase()),
                });
            } else {
                consultantsQuery.andWhere('LOWER(consultants.country) = :country', {
                    country: currentConsultant?.consultant_branch?.country.toLocaleLowerCase(),
                });
            }

            // Step 3: Exclude specific consultant IDs
            consultantsQuery.andWhere('consultants.id NOT IN (:...consultantIds)', {
                consultantIds: [11156, 9304],
            });

            const consultants = await consultantsQuery.getMany();

            // Step 4: Fetch products associated with consultants
            const products = await this.productsRepository.find({
                where: {
                    consultant_id: In(consultants.map((row) => row.id)),
                },
            });

            // Step 5: Fetch devices based on product IDs
            const productDeviceIds = products.map((product) => product.device_id);

            // getConsultant
            // consultant_branch
            let devicesQuery = this.devicesRepository
                .createQueryBuilder('device')
                .leftJoinAndSelect('device.products', 'products')
                .leftJoinAndSelect('products.consultant', 'consultant')
                .leftJoinAndSelect('consultant.consultant_branch', 'consultant_branch')
                .where('device.id IN (:...productDeviceIds)', { productDeviceIds });

            devicesQuery = devicesQuery.orWhere('device.consultant_company_id = :diorCompanyId', {
                diorCompanyId: 213,
            });

            // Step 6: Exclude specific optic numbers
            devicesQuery = devicesQuery.andWhere('device.optic_number NOT IN (:...excludedOptics)', {
                excludedOptics: ['FAB02135', 'FAB02363', 'FAB02709', 'DVAA4496'],
            });

            // Step 7: Apply exact search filter if present

            // Step 8: Pagination
            const searchPage = Number(query?.page || 1);
            const searchPer = Number(query?.limit || 25);

            // Fetch devices and count
            let [devices, totalCount] = await devicesQuery
                .skip((searchPage - 1) * searchPer)
                .take(searchPer)
                .getManyAndCount();

            if (query.search) {
                let searchQuery = this.devicesRepository
                    .createQueryBuilder('device')
                    .leftJoinAndSelect('device.products', 'products')
                    .leftJoinAndSelect('products.consultant', 'consultant')
                    .leftJoinAndSelect('consultant.consultant_branch', 'consultant_branch');

                searchQuery.andWhere('device.consultant_company_id = :diorCompanyId', { diorCompanyId: 213 });

                searchQuery = searchQuery.andWhere('device.optic_number NOT IN (:...excludedOptics)', {
                    excludedOptics: ['FAB02135', 'FAB02363', 'FAB02709', 'DVAA4496'],
                });
                searchQuery = searchQuery.andWhere('device.optic_number LIKE :search', { search: `%${query.search}%` });

                const [devices_, count] = await searchQuery
                    .skip((searchPage - 1) * searchPer)
                    .take(searchPer)
                    .getManyAndCount();
                devices = devices_;
                totalCount = count;
            }

            // Step 9: Reformat devices for output
            const reformatDevices: DeviceForDiorT[] = devices.map((device) => {
                const consultant = device.getConsultant();
                const pos = device.getConsultantShop();

                return {
                    id: device.id,
                    optic_number: device.optic_number,
                    serial_number: device.serial_number,
                    docking_number: device.docking_number,
                    wb: device.wb,
                    cal: device.cal,
                    refresh_date: device.refresh_date,
                    app_version: device.app_version,
                    app_update_date: device.app_update_date,
                    division: device.division,
                    use_yn: device.use_yn,
                    lat: device.lat,
                    lng: device.lng,
                    created_at: new Date(device.enter_at),
                    license_period: String(device.getLicensePeriod()),
                    consultant: consultant
                        ? {
                              id: consultant.id,
                              email: consultant.email,
                              code: consultant.code,
                          }
                        : {
                              id: null,
                              email: null,
                              code: null,
                          },
                    bc_code: consultant?.code ?? null,
                    pos_code: pos?.code ?? null,
                    country: consultant?.country ?? null,
                };
            });

            // Return the result with pagination info
            return {
                data: reformatDevices,
                total_size: totalCount,
                current_page_size: devices.length,
                current_page: searchPage,
                total_pages: Math.ceil(totalCount / searchPer),
            };
        } catch (e) {
            console.error('Error fetching devices:', e);
            throw new Error('An error occurred while fetching devices.');
        }
    }

    // 1971
    async resetConnect(req: Request, body: ResetConnectDto, locale = 'en') {
        try {
            const userId = (<{ id: string }>req.user).id;
            const { device_id } = body;

            const currentConsultant = await this.consultantsRespository.getConsultantById(userId);

            if (!currentConsultant) {
                throw new UnauthorizedException({
                    result_code: ErrorStatus.UNAUTHORIZED,
                    error: this.commonService.createLocaleErrorMessage(locale, 'unauthorized'),
                });
            }

            const productCount = await this.productsRepository.count({
                where: {
                    device_id: String(device_id),
                },
            });

            console.log('===>', productCount);

            let product;
            if (productCount > 1) {
                product = await this.productsRepository.findOne({
                    where: {
                        device_id: String(device_id),
                        application_id: 88,
                    },
                });
            } else {
                product = await this.productsRepository.findOne({
                    where: {
                        device_id: String(device_id),
                    },
                });
            }

            if (!product) {
                throw new NotFoundException({
                    result_code: ErrorStatus.RECORD_NOT_FOUND,
                    error: this.commonService.createLocaleErrorMessage(locale, 'record_not_found'),
                });
            }

            const result = await this.productsRepository.connectReset(product);

            const logResult = await this.productLogsRepository.saveLogs(
                product,
                `done by ${currentConsultant.email}(BM) - connect reset`,
                currentConsultant,
            );

            if (result && logResult) {
                return {
                    message: 'Success',
                };
            } else {
                throw new BadRequestException({
                    result_code: ErrorStatus.CUSTOM_ERROR,
                    error: this.commonService.createLocaleErrorMessage(locale, 'custom_error', 'connect reset failed!'),
                });
            }
        } catch (e) {
            throw e;
        }
    }
}
