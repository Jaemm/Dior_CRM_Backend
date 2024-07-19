import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ProductRecommendationSelectedsService } from './productRecommendtionSelected.service';
import { GetRecommendationSelectedDto, SelectProductsDto } from './productRecommendtionSelected.dto';
import { Roles } from '@/src/common/decorators/roles.decorator';
import { Role } from '@/src/common/enums/role.enum';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller()
export class ProductRecommendationSelectedsController {
    constructor(private readonly productRecommendationSelectedsService: ProductRecommendationSelectedsService) {}

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Get('product_recommendation_selecteds')
    async getProductRecommendationSelecteds(@Query() query: GetRecommendationSelectedDto) {
        return await this.productRecommendationSelectedsService.getProductRecommendationSelecteds(query);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Post('product_recommendation_selecteds')
    async selectProducts(@Body() body: SelectProductsDto) {
        return await this.productRecommendationSelectedsService.selectProducts(body);
    }
}
