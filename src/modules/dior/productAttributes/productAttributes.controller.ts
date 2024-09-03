import { Request, Response } from 'express';

import { Controller, Res, Get, Post, Query, Delete, Param, Body, Put, Headers, Req } from '@nestjs/common';
import { DiorProductAttributesService } from './productAttributes.service';
import { ApiBearerAuth, ApiHeader, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/src/common/decorators/roles.decorator';
import { Role } from '@/src/common/enums/role.enum';
import {
    CreateProductAttributeDto,
    ExportProductAttributeDataDto,
    GetProductAttributesDto,
    ImportProductAttributeDataDto,
    ImportProductAttributeTranslationsDataDto,
    UpdateProductAttributeDto,
} from './productAttributes.dto';

@ApiTags('Dior-Product Attributes')
@Controller('dior/product_attributes')
export class DiorProductAttributesController {
    constructor(private diorProductAttributesService: DiorProductAttributesService) {}

    @Get()
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async getProductAttributes(@Res() res: Response, @Query() query: GetProductAttributesDto) {
        const attributes = await this.diorProductAttributesService.getProductAttributes(query);
        return res.status(200).send(attributes);
    }

    @Post()
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async createProductAttributes(@Res() res: Response, @Body() body: CreateProductAttributeDto) {
        const result = await this.diorProductAttributesService.createProductAttributes(body);
        return res.status(200).send(result);
    }

    @Post('import')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async importProductAttributes(
        @Req() req: Request,
        @Res() res: Response,
        @Body() body: ImportProductAttributeDataDto,
    ) {
        const result = await this.diorProductAttributesService.importProductAttributes(req, body);
        return res.status(200).send(result);
    }

    @Post('import_translations')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async importProductAttributeTranslations(
        @Req() req: Request,
        @Res() res: Response,
        @Body() body: ImportProductAttributeTranslationsDataDto,
    ) {
        const translations = await this.diorProductAttributesService.importProductAttributeTranslations(req, body);
        return res.status(200).send(translations);
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
    @ApiHeader({ name: 'X-CHOWIS-LOCALE', required: false })
    @Roles(Role.Consultant)
    async updateProductAttribute(
        @Headers('X-CHOWIS-LOCALE') locale: string,
        @Res() res: Response,
        @Body() body: UpdateProductAttributeDto,
        @Param('id') attributeId: string,
    ) {
        const attribute = await this.diorProductAttributesService.updateProductAttribute(attributeId, body, locale);
        return res.status(200).send(attribute);
    }

    @Delete('delete_multiple/:ids')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async deleteMultiplePrdouctAttributes(@Res() res: Response, @Param('ids') attributeIds: string) {
        const result = await this.diorProductAttributesService.deleteMultiplePrdouctAttributes(attributeIds);
        return res.status(200).send(result);
    }

    @Delete(':id')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async deletePrdouctAttribute(@Res() res: Response, @Param('id') attributeId: string) {
        const result = await this.diorProductAttributesService.deletePrdouctAttribute(attributeId);
        return res.status(200).send(result);
    }
}
