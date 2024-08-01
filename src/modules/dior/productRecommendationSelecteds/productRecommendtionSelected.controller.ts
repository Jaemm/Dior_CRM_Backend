import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ProductRecommendationSelectedsService } from './productRecommendtionSelected.service';
import {
    GetListOfRecommendationListDto,
    GetRecommendationSelectedDto,
    SelectProductsDto,
} from './productRecommendtionSelected.dto';
import { Roles } from '@/src/common/decorators/roles.decorator';
import { Role } from '@/src/common/enums/role.enum';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Dior-Product Recommendation Selecteds')
@Controller('dior/product_recommendation_selecteds')
export class ProductRecommendationSelectedsController {
    constructor(private readonly productRecommendationSelectedsService: ProductRecommendationSelectedsService) {}

    @Post()
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async selectProducts(@Body() body: SelectProductsDto) {
        return await this.productRecommendationSelectedsService.selectProducts(body);
    }

    @Get('lists')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async getListOfRecommendationSelected(@Query() query: GetListOfRecommendationListDto) {
        return await this.productRecommendationSelectedsService.getListOfRecommendationSelected(query);
    }

    @Get()
    @ApiBearerAuth()
    // @Roles(Role.Consultant)
    async getProductRecommendationSelecteds(@Query() query: GetRecommendationSelectedDto) {
        return await this.productRecommendationSelectedsService.getProductRecommendationSelecteds(query);
    }
}
