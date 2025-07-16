import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { PasswordEmailDetails } from '@/src/common/entities/crmEntities';

@Injectable()
export class PasswordEmailDetailsRepository extends Repository<PasswordEmailDetails> {
    constructor(dataSource: DataSource) {
        super(PasswordEmailDetails, dataSource.createEntityManager());
    }

    async countingPassingOneHourTry(email: string) {
        const oneHourAgo = new Date(Date.now() - 3600000);

        const oneHourCount = await this.createQueryBuilder('pwdetail')
            .where('LOWER(pwdetail.email) = LOWER(:email)', { email })
            .andWhere('pwdetail.created_at >= :oneHourAgo', { oneHourAgo })
            .getCount();

        return oneHourCount;
    }
}
