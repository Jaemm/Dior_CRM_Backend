import { Injectable } from '@nestjs/common';
import { DataSource, Repository, Between, In } from 'typeorm';
import { Customers } from '@/src/common/entities/crmEntities';

@Injectable()
export class CustomersRepository extends Repository<Customers> {
    constructor(dataSource: DataSource) {
        super(Customers, dataSource.createEntityManager());
    }

    async getTodayCreatedCustomers(ids: number[]) {
        const startOfToday = new Date('2024-09-17');
        startOfToday.setHours(0, 0, 0, 0);

        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);

        const customers = await this.find({
            where: {
                // created_at: Between(startOfToday, endOfToday),
                id: In(ids),
            },
            relations: [
                'prSelecteds',
                'prSelecteds.productRecommendation',
                'consultant',
                'consultant.consultant_branch',
            ],
        });

        return customers;
    }

    async countValidCustomersPerCountry(country?: string, startDate?: string, endDate?: string) {
        const countQuery = await this.createQueryBuilder('customers').leftJoinAndSelect(
            'customers.consultant',
            'consultant',
        );

        if (!country || country === 'null') {
            countQuery
                .andWhere('(consultant.country IS NULL AND customers.email IS NULL)')
                .orWhere('(consultant.country IS NULL AND customers.email IS NOT NULL)');
        } else {
            countQuery
                .andWhere(`(LOWER(consultant.country) = '${country.toLocaleLowerCase()}' AND customers.email IS NULL)`)
                .orWhere(
                    `(LOWER(consultant.country) = '${country.toLocaleLowerCase()}' AND customers.email IS NOT NULL)`,
                );
        }

        if (startDate && endDate) {
            countQuery.andWhere(`customers.created_at BETWEEN ${startDate} AND ${endDate}`);
        }

        return await countQuery.getCount();
    }
}
