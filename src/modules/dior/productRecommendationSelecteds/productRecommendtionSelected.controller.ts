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

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Get()
    async getProductRecommendationSelecteds(@Query() query: GetRecommendationSelectedDto) {
        return await this.productRecommendationSelectedsService.getProductRecommendationSelecteds(query);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Post()
    async selectProducts(@Body() body: SelectProductsDto) {
        return await this.productRecommendationSelectedsService.selectProducts(body);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Get('lists')
    async getListOfRecommendationSelected(@Query() query: GetListOfRecommendationListDto) {
        return await this.productRecommendationSelectedsService.getListOfRecommendationSelected(query);
    }
}
