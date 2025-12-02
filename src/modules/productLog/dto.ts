import { formatDate } from './helpers';
import { ProductLogEntity } from '@/src/common/entities/crmEntities';

interface PaginationProps<T> {
    data: T[];
    count: number;
    take: number | undefined;
}

export class PaginationDTO<T> {
    readonly data: T[] = [];
    readonly pages: number = 1;
    readonly count: number;

    constructor({ data, count, take }: PaginationProps<T>) {
        this.data = data || [];
        this.pages = take ? Math.ceil(count / take) || 1 : 1;
        this.count = count || 0;
    }
}

export class ProductLogDTO {
    id: string = '';
    createdAt: string = '';
    opticNumber: string = '';
    consultantEmail: string = '';
    message: string = '';

    constructor(entity: ProductLogEntity) {
        const { productEntity, consultantEntity } = entity;

        this.id = entity.id || '';
        this.createdAt = formatDate(entity.createdAt);
        this.opticNumber = productEntity?.device?.optic_number || '';
        this.consultantEmail = consultantEntity?.email || '';
        this.message = entity.message;
    }
}

export class CreateDTO {
    productId: string;
    message: string;
    consultantId: string;
}
