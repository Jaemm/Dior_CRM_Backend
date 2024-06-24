import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsSelectByString, ILike, Like, Repository } from 'typeorm';
import { ConsultantShops } from '@/src/common/entities/crmEntities/ConsultantShops.entity';
import { StoreCreateDto, StoreGetDto } from './stores.dto';
import { ConsultantCompanyService } from '../consultantCompany/consultantCompany.service';
import { CountriesService } from '../countries/countries.service';
import { CommonService } from '@/src/common/common.service';
import { ErrorStatus } from '@/src/common/constants/error-status';
import { ResponseMessages } from '@/src/common/constants/response-messages';

@Injectable()
export class StoreService {
    constructor(
        @InjectRepository(ConsultantShops)
        private readonly storeRepository: Repository<ConsultantShops>,

        private readonly companyService: ConsultantCompanyService,
        private readonly countryService: CountriesService,
        private readonly commonService: CommonService,
    ) {}

    async findOneStoreById(id: number) {
        const store = await this.storeRepository.findOne({
            where: {
                id: id,
            },
        });
        if (!store) {
            this.commonService.throwNotFoundError();
        }
        return store;
    }

    async findOneStore(conditions?: any, selections?: string[], includes?: string[]) {
        const store = await this.storeRepository.findOne({
            where: conditions,
            select: selections ? (selections as FindOptionsSelectByString<ConsultantShops>) : [],
            relations: includes ? includes : [],
        });
        if (!store) {
            this.commonService.throwNotFoundError();
        }
        return store;
    }

    async findStores(conditions?: any, selections?: string[], includes?: string[]) {
        const store: any = await this.storeRepository.find({
            where: conditions,
            select: selections ? (selections as FindOptionsSelectByString<ConsultantShops>) : [],
            relations: includes,
        });
        return store;
    }

    async insertStore(storeInput: ConsultantShops) {
        const newStore = this.storeRepository.create(storeInput);
        const result = await this.storeRepository.save(newStore);
        return result;
    }

    async create(body: StoreCreateDto) {
        const { name, postal_code, consultant_company_id, country_id } = body;

        const [consultantCompony, country] = await Promise.all([
            this.companyService.getOneCompany(Number(consultant_company_id)),
            this.countryService.findOneCountryById(Number(country_id)),
        ]);

        if (!consultantCompony || !country) {
            this.commonService.throwNotFoundError();
        }

        const storeInput: any = {
            name,
            postal_code: postal_code,
            country_id,
            consultant_company_id,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const store = await this.insertStore(storeInput);

        if (!store) {
            return this.commonService.generateMessage('Something went wrong!');
        }
        return this.commonService.generateMessage('Success!');
    }

    async getStore(query: StoreGetDto) {
        const { search, consultant_company_id } = query;

        const conditions = {
            name: search ? ILike(`%${search}%`) : null,
            consultant_company_id,
        };

        const stores = await this.findStores(conditions, [
            'id',
            'name',
            'country_id',
            'consultant_company_id',
            'createdAt',
            'updatedAt',
        ]);
        if (!stores) {
            this.commonService.throwNotFoundError();
        }

        stores.map((item: any) => {
            item.country_name = item.getContryName;
        });
        return stores;
    }

    async delete(id: number) {
        const store = await this.findOneStoreById(id);
        if (!store) {
            this.commonService.throwNotFoundError();
        }

        const storeResult = await this.storeRepository.delete(id);

        if (storeResult.affected === 0) {
            throw new BadRequestException({
                result_code: ErrorStatus.CUSTOM_ERROR,
                error: ResponseMessages.StoreNotDeleted,
            });
        }

        if (!storeResult.affected) {
            return this.commonService.generateMessage('Store not deleted');
        }
        return this.commonService.generateMessage('Success!');
    }
}
