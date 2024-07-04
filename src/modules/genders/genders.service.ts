import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsSelectByString, Repository } from 'typeorm';
import { Genders } from '@/src/common/entities/crmEntities/Genders.entity';
import { CommonService } from '@/src/common/common.service';

@Injectable()
export class GendersService {
    constructor(
        @InjectRepository(Genders)
        private readonly gendersRepository: Repository<Genders>,

        private readonly commonService: CommonService,
    ) {}

    async findOneGender(id: string) {
        const gender = await this.gendersRepository.findOne({
            where: {
                id: id,
            },
        });
        if (!gender) {
            this.commonService.throwNotFoundError();
        }
        return gender;
    }

    async findGender(conditions?: any, selections?: string[], includes?: string[]) {
        const genders = await this.gendersRepository.find({
            where: conditions,
            select: selections as FindOptionsSelectByString<Genders>,
            relations: includes,
        });

        if (!genders) {
            this.commonService.throwNotFoundError();
        }

        return genders.map((item) => ({
            ...item,
            id: Number(item.id),
        }));
    }
}
