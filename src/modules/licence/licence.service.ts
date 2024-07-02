import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsSelect, FindOptionsSelectByString, Repository } from 'typeorm';
import { Licenses } from '@/src/common/entities/crmEntities/Licenses.entity';
import { LicenseHistories } from '@/src/common/entities/crmEntities/LicenseHistories.entity';
import { CommonService } from '@/src/common/common.service';

@Injectable()
export class LicenceService {
    constructor(
        @InjectRepository(Licenses)
        private readonly licenceRepository: Repository<Licenses>,
        @InjectRepository(LicenseHistories)
        private readonly licenseHistoryRepository: Repository<LicenseHistories>,

        private readonly commonService: CommonService,
    ) {}

    async findOneLicence(id: number) {
        const licence = await this.licenceRepository.findOne({
            where: {
                id: id,
            },
        });
        if (!licence) {
            this.commonService.throwNotFoundError();
        }
        return licence;
    }

    async findLicence(conditions?: any, selections?: string[], includes?: string[]) {
        const country = await this.licenceRepository.find({
            where: conditions,
            select: selections as FindOptionsSelectByString<Licenses>,
            relations: includes,
        });
        if (!country) {
            this.commonService.throwNotFoundError();
        }
        return country;
    }

    async findApplicationLicence(conditions?: any, selections?: string[], includes?: string[]) {
        //     const application = await this.applicationLicenseRepository.findOne({
        //         where: conditions,
        //         select: selections ? (selections as FindOptionsSelect<ApplicationLicenses>) : [],
        //         relations: includes,
        //     });
        //     return application;
    }

    async findLicenceHistories(conditions?: any, order?: any, selections?: string[], includes?: string[]) {
        const licence = await this.licenseHistoryRepository.find({
            where: conditions,
            select: selections as FindOptionsSelect<LicenseHistories>,
            relations: includes,
            order: order,
        });
        if (!licence) {
            this.commonService.throwNotFoundError();
        }
        return licence;
    }

    async findLicenceHistory(conditions?: any, order?: any, selections?: string[], includes?: string[]) {
        const licence = await this.licenseHistoryRepository.findOne({
            where: conditions,
            select: selections as FindOptionsSelect<LicenseHistories>,
            relations: includes,
            order: order,
        });
        if (!licence) {
            this.commonService.throwNotFoundError();
        }
        return licence;
    }
}
