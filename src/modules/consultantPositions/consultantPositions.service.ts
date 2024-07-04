import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConsultantPositions } from '@/src/common/entities/crmEntities/ConsultantPositions.entity';
import { CommonService } from '@/src/common/common.service';

@Injectable()
export class ConsultantPositionsService {
    constructor(
        @InjectRepository(ConsultantPositions)
        private readonly consultantPositionsRepository: Repository<ConsultantPositions>,

        private readonly commonService: CommonService,
    ) {}

    async findOneconsultantPositions(id: number) {
        const consultantpositions = await this.consultantPositionsRepository.findOne({
            where: {
                id: id,
            },
        });
        if (!consultantpositions) {
            this.commonService.throwNotFoundError();
        }
        return consultantpositions;
    }
}
