import { Injectable } from '@nestjs/common';
import { DataSource, Repository, Between } from 'typeorm';
import { Customers } from '@/src/common/entities/crmEntities';

@Injectable()
export class CustomersRepository extends Repository<Customers> {
    constructor(dataSource: DataSource) {
        super(Customers, dataSource.createEntityManager());
    }

    async getTodayCreatedCustomers() {
        const startOfToday = new Date('2022.01.01');
        startOfToday.setHours(0, 0, 0, 0);

        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);

        const customers = await this.find({
            where: {
                created_at: Between(startOfToday, endOfToday),
            },
            relations: ['prSelecteds', 'prSelecteds.productRecommendation'],
        });

        return customers;
    }
}
