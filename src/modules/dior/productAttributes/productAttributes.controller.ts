import { Response } from 'express';

import { Controller, Res, Get, Post, Query, Delete, Param, Body, Put, Headers } from '@nestjs/common';
import { DiorProductAttributesService } from './productAttributes.service';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/src/common/decorators/roles.decorator';
import { Role } from '@/src/common/enums/role.enum';
import {
    CreateProductAttributeDto,
    ExportProductAttributeDataDto,
    GetProductAttributesDto,
    ImportProductAttributeDataDto,
    UpdateProductAttributeDto,
} from './productAttributes.dto';

@ApiTags('Dior-Product Attributes')
@Controller('dior/product_attributes')
export class DiorProductAttributesController {
    constructor(private diorProductAttributesService: DiorProductAttributesService) {}

    @Get()
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async getProductAttributes(@Query() query: GetProductAttributesDto) {
        return await this.diorProductAttributesService.getProductAttributes(query);
    }

    @Post()
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async createProductAttributes(@Body() body: CreateProductAttributeDto) {
        return await this.diorProductAttributesService.createProductAttributes(body);
    }

    @Post('import')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async importProductAttributes(@Body() body: ImportProductAttributeDataDto) {
        return await this.diorProductAttributesService.importProductAttributes(body);
    }

    @Get('export')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async exportProductAttributes(@Res() res: Response, @Query() query: ExportProductAttributeDataDto) {
        const resultFile = await this.diorProductAttributesService.exportProductAttributes(query);

        res.header('Content-Type', 'text/csv');
        res.attachment('product_attributes_list.csv');
        return res.send(resultFile);
    }

    @Put(':id')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async updateProductAttribute(
        @Headers('X-CHOWIS-LOCALE') locale: string,
        @Body() body: UpdateProductAttributeDto,
        @Param('id') attributeId: string,
    ) {
        return await this.diorProductAttributesService.updateProductAttribute(attributeId, body, locale);
    }

    @Delete('delete_multiple/:ids')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async deleteMultiplePrdouctAttributes(@Param('ids') attributeIds: string) {
        return await this.diorProductAttributesService.deleteMultiplePrdouctAttributes(attributeIds);
    }

    @Delete(':id')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async deletePrdouctAttribute(@Param('id') attributeId: string) {
        return await this.diorProductAttributesService.deletePrdouctAttribute(attributeId);
    }
}
