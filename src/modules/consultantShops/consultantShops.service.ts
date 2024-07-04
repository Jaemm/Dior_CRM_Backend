import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsSelectByString, Repository } from 'typeorm';
import { ConsultantShops } from '@/src/common/entities/crmEntities/ConsultantShops.entity';
import { CommonService } from '@/src/common/common.service';

@Injectable()
export class ConsultantShopsService {
    constructor(
        @InjectRepository(ConsultantShops)
        private readonly consultantShopsRepository: Repository<ConsultantShops>,

        private readonly commonService: CommonService,
    ) {}

    async findOneConsultantShops(id: any) {
        const consultantshops = await this.consultantShopsRepository.findOne({
            where: {
                id: id,
            },
        });
        return consultantshops;
    }

    //
    async findConsultantShops(conditions?: any, selections?: string[], includes?: string[]) {
        const shops = await this.consultantShopsRepository.find({
            where: conditions,
            select: selections ? (selections as FindOptionsSelectByString<ConsultantShops>) : [],
            relations: includes,
        });
        if (!shops) {
            this.commonService.throwNotFoundError();
        }

        return shops;
    }
}
