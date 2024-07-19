import { BadRequestException, Controller, Delete, Get, Param, Query, Headers } from '@nestjs/common';
import { ProductRecommendationGroupsService } from './productRecommendationGroups.service';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Roles } from '@/src/common/decorators/roles.decorator';
import {
    GetListProductRecommendationGroupsDto,
    SearchProductRecommendationGroupsDto,
} from './productRecommendtaionGroups.dto';
import { Role } from '@/src/common/enums/role.enum';

@Controller('dior/product_recommendation_groups')
export class ProductRecommendationGroupsController {
    constructor(private productRecommendationGroupsService: ProductRecommendationGroupsService) {}

    @ApiBearerAuth()
    @ApiOperation({ summary: 'search product_recommendation groups by name' })
    @Roles(Role.Consultant)
    @Get()
    async getProductRecommendationGroups(@Query() query: SearchProductRecommendationGroupsDto) {
        return await this.productRecommendationGroupsService.getProductRecommendationGroups(query);
    }

    @Get('lists')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async getListProductRecommendationGroups(@Query() query: GetListProductRecommendationGroupsDto) {
        return await this.productRecommendationGroupsService.getListProductRecommendationGroups(query);
    }

    @Delete('delete_multiple/:ids')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async deleteMultipleProductRecommendtionGroup(
        @Headers('X-CHOWIS-LOCALE') locale: string,
        @Param('ids') groupIds: string,
    ) {
        return await this.productRecommendationGroupsService.deleteMultipleProductRecommendtionGroup(groupIds, locale);
    }

    @Delete(':id')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async deleteProductRecommendtionGroupById(
        @Headers('X-CHOWIS-LOCALE') locale: string,
        @Param('id') groupId: string,
    ) {
        if (!groupId) {
            throw new BadRequestException();
        }
        return await this.productRecommendationGroupsService.deleteProductRecommendtionGroupById(groupId, locale);
    }
}
