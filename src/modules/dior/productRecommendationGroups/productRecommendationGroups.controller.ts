import {
    BadRequestException,
    Controller,
    Delete,
    Get,
    Param,
    Query,
    Headers,
    Post,
    Body,
    Put,
    Res,
} from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { ProductRecommendationGroupsService } from './productRecommendationGroups.service';
import { Roles } from '@/src/common/decorators/roles.decorator';
import {
    CreateProductRecommendationGroupsDto,
    GetListProductRecommendationGroupsDto,
    SearchProductRecommendationGroupsDto,
    UpdateProductRecommendationGroupDto,
} from './productRecommendtaionGroups.dto';
import { Role } from '@/src/common/enums/role.enum';

@ApiTags('Dior-Product Recommendation Groups')
@Controller('dior/product_recommendation_groups')
export class ProductRecommendationGroupsController {
    constructor(private productRecommendationGroupsService: ProductRecommendationGroupsService) {}

    @ApiBearerAuth()
    @ApiOperation({ summary: 'search product_recommendation groups by name' })
    @Roles(Role.Consultant)
    @Get()
    async getProductRecommendationGroups(@Res() res: Response, @Query() query: SearchProductRecommendationGroupsDto) {
        return await this.productRecommendationGroupsService.getProductRecommendationGroups(query);
    }

    @Get('get_products/:id')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async getProductById(@Res() res: Response, @Param('id') groupId: string) {
        if (!groupId) {
            throw new BadRequestException('missing id');
        }

        const group = await this.productRecommendationGroupsService.getProductById(groupId);

        return res.status(200).send(group);
    }

    @Get('list')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async getListProductRecommendationGroups(
        @Res() res: Response,
        @Query() query: GetListProductRecommendationGroupsDto,
    ) {
        const list = await this.productRecommendationGroupsService.getListProductRecommendationGroups(query);
        return res.status(200).send(list);
    }

    @Post()
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async createProductRecommendationGroups(@Res() res: Response, @Body() body: CreateProductRecommendationGroupsDto) {
        const result = await this.productRecommendationGroupsService.createProductRecommendationGroups(body);
        return res.status(200).send(result);
    }

    @Put(':id')
    @ApiBearerAuth()
    @ApiHeader({ name: 'X-CHOWIS-LOCALE', required: false })
    @Roles(Role.Consultant)
    async updateProductRecommendationGroups(
        @Headers('X-CHOWIS-LOCALE') locale: string,
        @Res() res: Response,
        @Param('id') groupId: string,
        @Body() body: UpdateProductRecommendationGroupDto,
    ) {
        const result = await this.productRecommendationGroupsService.updateProductRecommendationGroups(
            groupId,
            body,
            locale,
        );
        return res.status(200).send(result);
    }

    @Delete('delete_multiple/:ids')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async deleteMultipleProductRecommendtionGroup(
        @Headers('X-CHOWIS-LOCALE') locale: string,
        @Res() res: Response,
        @Param('ids') groupIds: string,
    ) {
        const result = await this.productRecommendationGroupsService.deleteMultipleProductRecommendtionGroup(
            groupIds,
            locale,
        );
        return res.status(200).send(result);
    }

    @Delete(':id')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async deleteProductRecommendtionGroupById(
        @Headers('X-CHOWIS-LOCALE') locale: string,
        @Res() res: Response,
        @Param('id') groupId: string,
    ) {
        if (!groupId) {
            throw new BadRequestException();
        }
        const result = await this.productRecommendationGroupsService.deleteProductRecommendtionGroupById(
            groupId,
            locale,
        );
        return res.status(200).send(result);
    }
}
