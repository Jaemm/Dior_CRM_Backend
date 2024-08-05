import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Presign } from '@/src/common/entities/crmEntities';

@Injectable()
export class PresignRepository extends Repository<Presign> {
    constructor(dataSource: DataSource) {
        super(Presign, dataSource.createEntityManager());
    }

    async saveNewPresignEntity(data: {
        hash: string;
        fileName: string;
        fileExtension: string;
        downloadUrl: string;
        mimeType: string;
        prefix?: string;
        consultantId?: number;
    }) {
        const newPresign = this.create({
            key: data.hash,
            fileName: data.fileName,
            fileExtension: data.fileExtension,
            url: data.downloadUrl,
            mimeType: data.mimeType,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        if (data.prefix) {
            newPresign.prefix = data.prefix;
        }

        if (data.consultantId) {
            newPresign.consultantId = data.consultantId;
        }

        return await this.save(newPresign);
    }
}
