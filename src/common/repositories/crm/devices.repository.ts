import { Injectable } from '@nestjs/common';
import { DataSource, Repository, FindOptionsSelectByString } from 'typeorm';
import { Devices } from '@/src/common/entities/crmEntities';

@Injectable()
export class DevicesRepository extends Repository<Devices> {
    constructor(dataSource: DataSource) {
        super(Devices, dataSource.createEntityManager());
    }

    async findDevices(conditions?: any, selections?: string[], includes?: string[]) {
        const devices: any = await this.find({
            where: conditions,
            select: selections ? (selections as FindOptionsSelectByString<Devices>) : [],
            relations: includes ? includes : [],
        });

        return devices;
    }

    async findOneDevices(conditions: any, selections?: string[], includes?: string[]) {
        const device: any = await this.findOne({
            where: conditions,
            select: selections ? (selections as FindOptionsSelectByString<Devices>) : [],
            relations: includes ? includes : [],
        });

        return device;
    }

    async insertDevice(device: Devices) {
        const newDevice = this.create(device);
        const result = await this.save(newDevice);
        return result;
    }

    async updateDevice(id: string, device: any) {
        const updatedDevice = await this.update(id, device);
        return updatedDevice;
    }
}
