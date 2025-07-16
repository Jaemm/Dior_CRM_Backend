import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Consultants, RefreshTokens } from '@/src/common/entities/crmEntities';
import * as bcrypt from 'bcrypt';

@Injectable()
export class RefreshTokensRepository extends Repository<RefreshTokens> {
    constructor(dataSource: DataSource) {
        super(RefreshTokens, dataSource.createEntityManager());
    }

    async saveNewRefreshToken(accessToken: string, refreshToken: string, consultant: Consultants) {
        const newRefreshToken = this.create({
            tokenableId: String(consultant.id),
            tokenableType: 'Consultant',
            refreshToken: refreshToken,
            refreshTokenExpiredAt: new Date(Date.now() + 7776000000), // 90 Days
            accessToken: accessToken,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        await this.save(newRefreshToken);
    }
}
