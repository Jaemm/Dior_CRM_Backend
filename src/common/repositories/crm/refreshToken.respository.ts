import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { RefreshTokens } from '@/src/common/entities/crmEntities';

@Injectable()
export class RefreshTokensRepository extends Repository<RefreshTokens> {
    constructor(dataSource: DataSource) {
        super(RefreshTokens, dataSource.createEntityManager());
    }
}
