import { Controller, Get, Query } from '@nestjs/common';
import { DiorProductAttributesService } from './productAttributes.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/src/common/decorators/roles.decorator';
import { Role } from '@/src/common/enums/role.enum';
import { GetProductAttributesDto } from './productAttributes.dto';

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
}
