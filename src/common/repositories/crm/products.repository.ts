import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Consultants, Customers, Devices, Products } from '@/src/common/entities/crmEntities';

@Injectable()
export class ProductsRepository extends Repository<Products> {
    constructor(dataSource: DataSource) {
        super(Products, dataSource.createEntityManager());
    }

    async findProductsDeviceByEntityAndAppId(entity: Customers | Consultants) {
        let device: Devices;

        if (entity instanceof Customers) {
            const products = await this.findOne({
                where: {
                    customer_id: entity.id,
                    application_id: entity.app_id,
                },
                relations: ['device'],
            });
            device = products?.device;
            return device;
        }

        const products = await this.findOne({
            where: {
                consultant_id: entity.id,
                application_id: entity.app_id,
            },
            relations: ['device'],
        });
        device = products?.device;

        return device;
    }

    async getNewOpticNumbersCountByBranch(branchId: number | string) {
        const numberId = Number(branchId);
        const count = await this.createQueryBuilder('products')
            .leftJoinAndSelect('products.consultant', 'consultants')
            .leftJoinAndSelect('consultants.consultant_branch', 'consultant_branches')
            .where((qb) => {
                const subQuery = qb
                    .subQuery()
                    .select('devices.id')
                    .from('devices', 'devices')
                    .where((qb2) => {
                        const subSubQuery = qb2
                            .subQuery()
                            .select('products.device_id')
                            .from('products', 'products')
                            .where((qb3) => {
                                const consultantSubQuery = qb3
                                    .subQuery()
                                    .select('consultants.id')
                                    .from('consultants', 'consultants')
                                    .where('consultants.consultant_company_id = :companyId', { companyId: 213 })
                                    .andWhere('consultants.id NOT IN (:...excludedIds)', { excludedIds: [11156, 9304] })
                                    .getQuery();
                                return 'products.consultant_id IN ' + consultantSubQuery;
                            })
                            .getQuery();
                        return `devices.ID IN ${subSubQuery}`;
                    })
                    .orWhere((qb2) => {
                        return qb2
                            .where('devices.consultant_company_id = :companyId', { companyId: 213 })
                            .andWhere('devices.optic_number NOT IN (:...excludedOpticNumbers)', {
                                excludedOpticNumbers: ['FAB02135', 'FAB02363', 'FAB02709', 'DVAA4496'],
                            });
                    })
                    .getQuery();
                return `products.device_id IN ${subQuery}`;
            })
            .andWhere('products.first_use_date IS NOT NULL')
            .andWhere('consultants.consultant_branch_id = :branchId', { branchId: numberId })
            .getCount();

        return count;
    }

    async getCompaniesFiles(consultant_id: number, application_id: number) {
        const imageCustomization = await this.find({
            where: {
                application_id,
                consultant_id,
            },
            select: {
                id: true,
                device: {
                    id: true,
                    optic_number: true,
                    serial_number: true,
                    docking_number: true,
                    wb: true,
                    cal: true,
                    refresh_date: true,
                    app_version: true,
                    app_update_date: true,
                    division: true,
                    use_yn: true,
                    lat: true,
                    lng: true,
                    consultant_company_id: true,
                },
                application: {
                    id: true,
                    name: true,
                    apk_url: true,
                    version: true,
                    group_name: true,
                    regist_date: true,
                    description: true,
                    ios_version: true,
                    android_version: true,
                    android_app_url: true,
                    ios_app_url: true,
                    is_old: true,
                },
                license: {
                    id: true,
                    name: true,
                },
                first_use_date: true,
                use_date: true,
                use_time: true,
                mac_address: true,
                app_use_yn: true,
                license_period: true,
                created_at: true,
                license_remaining_days: true,
            },
            relations: ['application', 'device', 'device.consultant_company', 'license'],
        });

        return imageCustomization;
    }

    async checkLicense(consultant_id: number, application_id: number, optic_number: string) {
        const deviceData = await this.findOne({
            where: {
                consultant_id,
                application_id,
                device: {
                    optic_number: optic_number,
                },
            },
            select: {
                id: true,
                first_use_date: true,
                use_date: true,
                use_time: true,
                mac_address: true,
                app_use_yn: true,
                license_period: true,
                created_at: true,
                license_remaining_days: true,
                days_remaining_updated_at: true,
                is_paid_for_license: true,
            },
            relations: ['application', 'device', 'license'],
        });

        return deviceData;
    }

    async connectReset(product: Products): Promise<boolean> {
        product.consultant_id = null;
        product.customer_id = null;
        product.use_date = null;
        product.use_time = null;
        product.mac_address = null;
        product.app_use_yn = 'N';


        try {
            const result = await this.update(
                { id: product.id },
                {
                    consultant_id: null,
                    customer_id: null,
                    use_date: null,
                    use_time: null,
                    mac_address: null,
                    app_use_yn: 'N',
                },
            );

        } catch (e) {
            console.error('Error saving product:', e);
            return false;
        }

        return true;
    }
}
