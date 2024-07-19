import { Controller, Get, Post, Query, Delete, Param, Body, Put, Headers } from '@nestjs/common';
import { DiorProductAttributesService } from './productAttributes.service';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/src/common/decorators/roles.decorator';
import { Role } from '@/src/common/enums/role.enum';
import { CreateProductAttributeDto, GetProductAttributesDto, UpdateProductAttributeDto } from './productAttributes.dto';

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
