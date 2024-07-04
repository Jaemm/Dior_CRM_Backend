import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConsultantBranches } from '@/src/common/entities/crmEntities/ConsultantBranches.entity';
import { CommonService } from '@/src/common/common.service';

@Injectable()
export class ConsultantBranchesService {
    constructor(
        @InjectRepository(ConsultantBranches)
        private readonly consultantBranchesRepository: Repository<ConsultantBranches>,

        private readonly commonService: CommonService,
    ) {}

    async findOneconsultantBranches(id: string) {
        const consultantbranches = await this.consultantBranchesRepository.findOne({
            where: {
                id: id,
            },
        });
        if (!consultantbranches) {
            this.commonService.throwNotFoundError();
        }
        return consultantbranches;
    }
}
