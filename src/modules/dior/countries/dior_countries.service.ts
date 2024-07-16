import { ConsultantCountriesRepository, ConsultantsRepository } from '@/src/common/repositories/crm';
import { ConsultantCountryForDiorT } from '@/src/common/types/entities';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCountries } from './dior_countries.dto';

@Injectable()
export class DiorCountriesService {
    constructor(
        private readonly consultantRepository: ConsultantsRepository,
        private readonly consultantCountriesRepository: ConsultantCountriesRepository,
    ) {}

    async getCountries(search?: string) {
        try {
            const diorConsultantCompanyId = await this.consultantRepository.getDiorConsultantCompanyId();

            if (!diorConsultantCompanyId) {
                throw new NotFoundException({});
            }

            const countriesQuery = this.consultantCountriesRepository
                .createQueryBuilder('countries')
                .where('countries.consultant_company_id = :diorConsultantCompanyId', { diorConsultantCompanyId });

            if (search) {
                const likeSearch = `%${search}%`;
                countriesQuery.andWhere('(countries.code LIKE :search OR countries.name LIKE :search)', { likeSearch });
            }

            const countries = await countriesQuery.getMany();

            const reformatCountries: ConsultantCountryForDiorT[] = countries.map((country) => {
                const reformatData: ConsultantCountryForDiorT = {
                    id: Number(country.id),
                    name: country.name,
                    code: country.code,
                    url_and_port: country.urlAndPort,
                    default_recommendation: country.defaultRecommendation,
                };
                return reformatData;
            });

            return {
                data: reformatCountries,
            };
        } catch (e) {
            throw e;
        }
    }

    async createCountries(body: CreateCountries) {
        try {
            const { name, code, url_and_port, default_recommendation } = body;
            const diorConsultant = await this.consultantRepository.getDiorConsultant();

            const newCountries = this.consultantCountriesRepository.create({
                consultantCompanyId: diorConsultant.consultant_company_id,
                name: name,
                code: code,
                urlAndPort: url_and_port,
                defaultRecommendation: default_recommendation,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            const savedCountries = await this.consultantCountriesRepository.save(newCountries);

            const reformatCountries: ConsultantCountryForDiorT = {
                id: Number(savedCountries.id),
                name: savedCountries.name,
                code: savedCountries.code,
                url_and_port: savedCountries.urlAndPort,
                default_recommendation: savedCountries.defaultRecommendation,
            };

            return reformatCountries;
        } catch (e) {
            throw e;
        }
    }
}
