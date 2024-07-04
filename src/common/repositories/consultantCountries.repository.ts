import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ConsultantCountries } from '../entities/crmEntities';

@Injectable()
export class ConsultantCountriesRepository extends Repository<ConsultantCountries> {
    constructor(dataSource: DataSource) {
        super(ConsultantCountries, dataSource.createEntityManager());
    }
}
