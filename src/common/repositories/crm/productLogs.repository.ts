import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Consultants, ProductLogs, Products } from '@/src/common/entities/crmEntities';

@Injectable()
export class ProductLogsRepository extends Repository<ProductLogs> {
    constructor(dataSource: DataSource) {
        super(ProductLogs, dataSource.createEntityManager());
    }

    async saveLogs(product: Products, message: string, consultant?: Consultants) {
        const newLog = this.create({
            productId: String(product.id),
            message: message,
            consultantId: String(consultant.id),
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        try {
            await this.save(newLog);
        } catch (e) {
            return false;
        }

        return true;
    }
}
