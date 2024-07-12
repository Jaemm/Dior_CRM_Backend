import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Products } from '@/src/common/entities/crmEntities';

@Injectable()
export class ProductsRepository extends Repository<Products> {
    constructor(dataSource: DataSource) {
        super(Products, dataSource.createEntityManager());
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
}
