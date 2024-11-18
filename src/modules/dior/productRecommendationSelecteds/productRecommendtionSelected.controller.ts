import { Body, Controller, Get, Post, Query, Res, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response, Request } from 'express';

import { ProductRecommendationSelectedsService } from './productRecommendtionSelected.service';
import {
    GetListOfRecommendationListDto,
    GetRecommendationSelectedDto,
    SelectProductsDto,
} from './productRecommendtionSelected.dto';
import { Roles } from '@/src/common/decorators/roles.decorator';
import { Role } from '@/src/common/enums/role.enum';

@ApiTags('Dior-Product Recommendation Selecteds')
@Controller('dior/product_recommendation_selecteds')
export class ProductRecommendationSelectedsController {
    constructor(private readonly productRecommendationSelectedsService: ProductRecommendationSelectedsService) {}

    @Post()
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async selectProducts(@Req() req: Request, @Res() res: Response, @Body() body: SelectProductsDto) {
        const userId = Number((<{ id: string }>req['user']).id);

        const selecteds = await this.productRecommendationSelectedsService.selectProducts(body, userId);
        return res.status(200).send(selecteds);
    }

    @Get('lists')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async getListOfRecommendationSelected(@Res() res: Response, @Query() query: GetListOfRecommendationListDto) {
        const list = await this.productRecommendationSelectedsService.getListOfRecommendationSelected(query);
        return res.status(200).send(list);
    }

    @Get()
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async getProductRecommendationSelecteds(@Res() res: Response, @Query() query: GetRecommendationSelectedDto) {
        const selecteds = await this.productRecommendationSelectedsService.getProductRecommendationSelecteds(query);
        return res.status(200).send(selecteds);
    }
}
