import { Controller, Get, Query } from '@nestjs/common';
import { ProductRecommendationGroupsService } from './productRecommendationGroups.service';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Roles } from '@/src/common/decorators/roles.decorator';
import { SearchProductRecommendationGroupsDto } from './productRecommendtaionGroups.dto';
import { Role } from '@/src/common/enums/role.enum';

@Controller('dior/product_recommendtaion_groups')
export class ProductRecommendationGroupsController {
    constructor(private productRecommendationGroupsService: ProductRecommendationGroupsService) {}

    @ApiBearerAuth()
    @ApiOperation({ summary: 'search product_recommendation groups by name' })
    @Roles(Role.Consultant)
    @Get()
    async getProductRecommendationGroups(@Query() query: SearchProductRecommendationGroupsDto) {
        return await this.productRecommendationGroupsService.getProductRecommendationGroups(query);
    }
}
