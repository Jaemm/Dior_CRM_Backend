import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsSelectByString, Like, Repository } from 'typeorm';
import { Countries } from '@/src/common/entities/crmEntities/Countries.entity';
import { CountriesDto } from './countries.dto';
import { CommonService } from '@/src/common/common.service';

@Injectable()
export class CountriesService {
    constructor(
        @InjectRepository(Countries)
        private readonly countriesRepository: Repository<Countries>,

        private readonly commonService: CommonService,
    ) {}

    async findOneCountryById(id: number) {
        const country = await this.countriesRepository.findOne({
            where: {
                id: id,
            },
        });
        if (!country) {
            this.commonService.throwNotFoundError();
        }
        return country;
    }

    async findOneCountry(conditions?: any, selections?: string[], includes?: string[]) {
        const country = await this.countriesRepository.findOne({
            where: conditions,
            select: selections ? (selections as FindOptionsSelectByString<Countries>) : ['id', 'name'],
            relations: includes,
        });
        if (!country) {
            this.commonService.throwNotFoundError();
        }
        return country;
    }

    async findCountry(conditions?: any, selections?: string[], includes?: string[]) {
        const country = await this.countriesRepository.find({
            where: conditions,
            select: selections as FindOptionsSelectByString<Countries>,
            relations: includes,
        });
        if (!country) {
            this.commonService.throwNotFoundError();
        }
        return country;
    }

    async countries(params: CountriesDto) {
        const { search } = params;
        const conditions = search ? { name: Like(`%${search}%`) } : {};
        const countries = await this.findCountry(conditions, ['id', 'name', 'phone_code', 'country_code']);
        return { countries };
    }

    async findCountriesByName(search: CountriesDto) {
        let query = this.countriesRepository
            .createQueryBuilder('Countries')
            .select(['Countries.id', 'Countries.name', 'Countries.phone_code', 'Countries.country_code']);

        if (search) {
            const research = search?.search ? search?.search.toLowerCase() : '';
            query = query.where('LOWER(Countries.name) LIKE :search', { search: `%${research}%` });
        }

        return await query.getMany();
    }
}
