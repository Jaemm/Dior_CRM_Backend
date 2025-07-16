import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ConsultantPositions } from '@/src/common/entities/crmEntities';

@Injectable()
export class ConsultantPositionsRepository extends Repository<ConsultantPositions> {
    constructor(dataSource: DataSource) {
        super(ConsultantPositions, dataSource.createEntityManager());
    }

    async findOneconsultantPositions(id: number) {
        const consultantpositions = await this.findOne({
            where: {
                id: id,
            },
        });
        return consultantpositions;
    }

    async checkConsultantPosition(id: number) {
        const position = await this.findOne({
            where: {
                id: id,
            },
            select: {
                id: true,
                name: true,
            },
        });
        return position;
    }
}
