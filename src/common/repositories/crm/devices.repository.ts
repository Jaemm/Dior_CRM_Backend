import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Devices } from '@/src/common/entities/crmEntities';

@Injectable()
export class DevicesRepository extends Repository<Devices> {
    constructor(dataSource: DataSource) {
        super(Devices, dataSource.createEntityManager());
    }
}
