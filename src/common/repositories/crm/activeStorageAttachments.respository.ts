import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ActiveStorageAttachments } from '@/src/common/entities/crmEntities';

@Injectable()
export class ActiveStorageAttachmentsRepository extends Repository<ActiveStorageAttachments> {
    constructor(dataSource: DataSource) {
        super(ActiveStorageAttachments, dataSource.createEntityManager());
    }

    async getCompaniesFiles(recordId: string) {
        const imageCustomization = await this.find({
            where: { recordId },
            select: {
                blob: {
                    metadata: true,
                    activeStorageAttachments: true,
                    checksum: true,
                    contentType: true,
                    key: true,
                    filename: true,
                },
                name: true,
                recordType: true,
            },
            relations: ['blob'],
        });
        return imageCustomization;
    }
}
