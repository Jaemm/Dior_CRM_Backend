import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Notifications } from '@/src/common/entities/crmEntities';

@Injectable()
export class NotificationsRepository extends Repository<Notifications> {
    constructor(dataSource: DataSource) {
        super(Notifications, dataSource.createEntityManager());
    }
}
