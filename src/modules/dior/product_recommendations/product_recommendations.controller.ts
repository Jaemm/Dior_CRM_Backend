import { Request } from 'express';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Controller, Get, Req, Query, Headers, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { ProductRecommendationService } from './product_recommendations.service';

import { Roles } from '@/src/common/decorators/roles.decorator';
import { Role } from '@/src/common/enums/role.enum';
import { AttributeRoutine, AutomaticProductByBatchIdDto, SearchProductRecommendationDto } from '../dior.dto';
import { CreateProductRecommendationDto } from './product_recommendation.dto';

@Controller('/dior/product_recommendations')
export class ProductRecommendationController {
    constructor(private productRecommendationsService: ProductRecommendationService) {}

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Get()
    async getProductRecommendation(
        @Req() req: Request,
        @Query() query: SearchProductRecommendationDto,
        @Headers('X-CHOWIS-LOCALE') locale: string,
    ) {
        return await this.productRecommendationsService.getProductRecommendation(req, query, locale);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Get(':id')
    async getProductRecommendationById(
        @Req() req: Request,
        @Param('id') recommendandationId: string,
        @Headers('X-CHOWIS-LOCALE') locale: string,
    ) {
        return await this.productRecommendationsService.getProductRecommendationById(recommendandationId, locale);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Put(':id')
    async updateProductRecommendationById(
        @Req() req: Request,
        @Param('id') recommendandationId: string,
        @Body() body: CreateProductRecommendationDto,
        @Headers('X-CHOWIS-LOCALE') locale: string,
    ) {
        return await this.productRecommendationsService.updateProductRecommendationById(
            body,
            recommendandationId,
            locale,
        );
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Delete(':id')
    async deleteProductRecommendationById(
        @Req() req: Request,
        @Param('id') recommendandationId: string,
        @Headers('X-CHOWIS-LOCALE') locale: string,
    ) {
        return await this.productRecommendationsService.deleteProductRecommendationById(recommendandationId, locale);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Get('get_automatic_product_by_batch_id')
    async getAutomaticProductByBatchId(@Query() query: AutomaticProductByBatchIdDto) {
        return await this.productRecommendationsService.getAutomaticProductByBatchId(query);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Post()
    async createProductRecommendation(
        @Body() body: CreateProductRecommendationDto,
        @Headers('X-CHOWIS-LOCALE')
        locale: string,
    ) {
        return await this.productRecommendationsService.createProductRecommendation(body);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Get('get_collection')
    async getRecommendationsCollection(@Query('routine') routine?: AttributeRoutine) {
        return await this.productRecommendationsService.getRecommendationsCollection(routine);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Get('get_category')
    async getRecommendationsCategories(@Query('routine') routine?: AttributeRoutine) {
        return await this.productRecommendationsService.getRecommendationsCategories(routine);
    }
}
