import { Injectable, StreamableFile } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ILike, Repository } from 'typeorm';

import { ProductLogDTO, PaginationDTO, CreateDTO } from './dto';
import { ProductLogEntity } from '@/src/common/entities/crmEntities';
import { formatExportData } from './helpers';
import { QueryParams } from './types';

@Injectable()
export class ProductLogService {
    constructor(
        @InjectRepository(ProductLogEntity)
        private productLogRepository: Repository<ProductLogEntity>,
    ) {}

    async getProductLogs(query: QueryParams): Promise<PaginationDTO<ProductLogDTO>> {
        const page = query.page ? Number(query.page) : 1;
        const take = query.take ? Number(query.take) : 10;
        const search = query.search ? ILike(`%${query.search.toLowerCase()}%`) : undefined;

        const skip = take ? (page - 1) * take : 0;

        const [entities, count] = await this.productLogRepository.findAndCount({
            take,
            skip,
            order: { id: 'DESC' },
            where: search
                ? [
                      { productEntity: { device: { optic_number: search } } },
                      { consultantEntity: { email: search } },
                      { message: search },
                  ]
                : undefined,
            relations: { productEntity: { device: true }, consultantEntity: true },
            select: {
                id: true,
                productEntity: { id: true, device: { id: true, optic_number: true } },
                consultantEntity: { id: true, email: true },
                message: true,
                createdAt: true,
            },
        });

        const data = entities.map((entity) => new ProductLogDTO(entity));

        return new PaginationDTO({ data, count, take });
    }

    async exportProductLogs() {
        const entities = await this.productLogRepository.find({
            order: { id: 'DESC' },
            relations: { productEntity: { device: true }, consultantEntity: true },
            select: {
                id: true,
                productEntity: { id: true, device: { id: true, optic_number: true } },
                consultantEntity: { id: true, email: true },
                message: true,
                createdAt: true,
            },
        });

        const logs = entities.map((entity) => new ProductLogDTO(entity));

        const headers = ['Device ID', 'BC Email', 'Message', 'Date'];

        const data = logs.map((log) => [log.opticNumber, log.consultantEmail, log.message, log.createdAt]);

        const buffer = formatExportData({ headers, data });

        return new StreamableFile(buffer as any, {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            disposition: 'attachment; filename=device_logs.xlsx',
        });
    }

    async createProductLog(body: CreateDTO) {
        const record = this.productLogRepository.create(body);

        await this.productLogRepository.save(record);

        return { message: 'Product log successfully created' };
    }
}
