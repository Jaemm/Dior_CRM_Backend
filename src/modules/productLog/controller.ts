import { Controller, Get, Query } from '@nestjs/common';

import { ProductLogService } from './service';
import { QueryParams } from './types';

@Controller('product-logs')
export class ProductLogController {
    constructor(private productLogService: ProductLogService) {}

    @Get()
    getProductLogs(@Query() query: QueryParams) {
        return this.productLogService.getProductLogs(query);
    }

    @Get('export')
    exportProductLogs() {
        return this.productLogService.exportProductLogs();
    }
}
