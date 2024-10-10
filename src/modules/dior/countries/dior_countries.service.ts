import { In } from 'typeorm';
import * as csv from 'csv';
import { Request } from 'express';

import { ConsultantCountriesRepository, ConsultantsRepository } from '@/src/common/repositories/crm';
import { ConsultantCountryForDiorT, ConsultantCountryT } from '@/src/common/types/entities';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCountries, ExportCountriesDto, ImportCountriesDto, UpdateCountriesDto } from './dior_countries.dto';
import { ConsultantCountries } from '@/src/common/entities/crmEntities';
import { ErrorStatus } from '@/src/common/constants/error-status';
import { CommonService } from '@/src/common/common.service';

@Injectable()
export class DiorCountriesService {
    constructor(
        private commonSerivce: CommonService,

        // Repos
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
                countriesQuery.andWhere('(countries.code LIKE :search OR countries.name LIKE :search)', {
                    search: likeSearch,
                });
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

    async updateCountries(countryId: string, body: UpdateCountriesDto, locale = 'en') {
        try {
            const diorConsultant = await this.consultantRepository.getDiorConsultant();

            const country = await this.consultantCountriesRepository.findOne({
                where: {
                    id: countryId,
                    consultantCompanyId: diorConsultant.consultant_company_id,
                },
            });

            if (!country) {
                throw new NotFoundException({
                    result_code: ErrorStatus.RECORD_NOT_FOUND,
                    error: this.commonSerivce.createLocaleErrorMessage(locale, 'record_not_found'),
                });
            }

            country.name = body?.name ? body.name : country.name;
            country.code = body?.code ? body.code : country.code;
            country.urlAndPort = body?.url_and_port ? body.url_and_port : country.urlAndPort;
            country.defaultRecommendation = body?.default_recommendation
                ? body.default_recommendation
                : country.defaultRecommendation;
            country.updatedAt = new Date();

            const savedCountry = await this.consultantCountriesRepository.save(country);

            const reformatCountries: ConsultantCountryForDiorT = {
                id: Number(savedCountry.id),
                name: savedCountry.name,
                code: savedCountry.code,
                url_and_port: savedCountry.urlAndPort,
                default_recommendation: savedCountry.defaultRecommendation,
            };

            return reformatCountries;
        } catch (e) {
            throw e;
        }
    }

    async deleteCountryById(countryId: string) {
        try {
            const diorConsultant = await this.consultantRepository.getDiorConsultant();

            const foundCountry = await this.consultantCountriesRepository.findOne({
                where: {
                    consultantCompanyId: diorConsultant.consultant_company_id,
                    id: countryId,
                },
            });

            await this.consultantCountriesRepository.remove(foundCountry);

            return {
                message: 'Delete country successful',
            };
        } catch (e) {
            throw e;
        }
    }

    async deleteMultipleCountries(countryIds: string) {
        try {
            const splitIds = countryIds.split(',');

            const diorConsultant = await this.consultantRepository.getDiorConsultant();

            const foundCountries = await this.consultantCountriesRepository.find({
                where: {
                    consultantCompanyId: diorConsultant.consultant_company_id,
                    id: In(splitIds),
                },
            });

            await this.consultantCountriesRepository.remove(foundCountries);

            return {
                message: 'Successfully deleted multiple record',
            };
        } catch (e) {
            throw e;
        }
    }

    async exportCountries(query: ExportCountriesDto) {
        try {
            const diorConsultant = await this.consultantRepository.getDiorConsultant();

            const countriesQuery = await this.consultantCountriesRepository
                .createQueryBuilder('countries')
                .where('countries.id != :diorConsultantId', { diorConsultantId: diorConsultant.id });

            if (query.search) {
                countriesQuery.andWhere('(countries.code LIKE :search OR countries.name LIKE :search)', {
                    search: `%${query.search}%`,
                });
            }

            const countries = await countriesQuery.getMany();

            return await this.createCSVFileForExportCountries(countries);
        } catch (e) {
            throw e;
        }
    }

    async importCountries(req: Request, body: ImportCountriesDto) {
        const { file_url } = body;
        try {
            const splitToken = req.headers.authorization.split(' ');

            const token = splitToken[1];

            const worksheet = await this.commonSerivce.getWorkSheetByHTTP(file_url, token);

            const headers = worksheet.getRow(1);

            const rowCount = worksheet.rowCount + 1;

            const diorConsultant = await this.consultantRepository.getDiorConsultant();

            for (let i = 2; i < rowCount; i++) {
                const row = worksheet.getRow(i);

                const newCountries = this.consultantCountriesRepository.create({
                    code: row.getCell(1).value as string,
                    name: row.getCell(2).value as string,
                    defaultRecommendation: row.getCell(3).value as string,
                    urlAndPort: row.getCell(4).value as string,
                    consultantCompanyId: diorConsultant.consultant_company_id,
                    
                });

                await this.consultantCountriesRepository.save(newCountries);
            }

            return {
                message: 'Success import data',
            };
        } catch (e) {
            throw e;
        }
    }

    /**
     * Utils
     */
    createCSVFileForExportCountries(countries: ConsultantCountries[]) {
        const header = ['Country Code', 'Country Name', 'Default Recommendation', 'eCRM URL & PORT'];

        const records = countries.map((u) => [u.code, u.name, u.urlAndPort, u.defaultRecommendation]);

        return new Promise((resolve, reject) => {
            csv.stringify([header, ...records], (err, output) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(output);
            });
        });
    }
}
