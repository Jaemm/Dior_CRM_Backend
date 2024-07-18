import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Req, Query, Post, Body, Headers } from '@nestjs/common';
import { DiorService } from './dior.service';
import { Roles } from '@/src/common/decorators/roles.decorator';
import { Role } from '@/src/common/enums/role.enum';
import { Request, query } from 'express';
import {
    CustomerByConsultantIdDto,
    GetRecommendationSelectedDto,
    SearchProductRecommendationGroupsDto,
    SelectProductsDto,
    createCustomerDto,
} from './dior.dto';

@ApiTags('Dior')
@Controller('dior')
export class DiorController {
    constructor(private readonly diorService: DiorService) {}

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Get('customers')
    async getCustomers(@Query() query: CustomerByConsultantIdDto, @Headers('X-CHOWIS-LOCALE') locale: string) {
        return await this.diorService.getCustomers(query, locale);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Post('customers')
    async createCustomers(@Body() body: createCustomerDto) {
        return await this.diorService.createCustomers(body);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'search product_recommendation groups by name' })
    @Roles(Role.Consultant)
    @Get('product_recommendation_groups')
    async getProductRecommendationGroups(@Query() query: SearchProductRecommendationGroupsDto) {
        return await this.diorService.getProductRecommendationGroups(query);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Get('product_recommendation_selecteds')
    async getProductRecommendationSelecteds(@Query() query: GetRecommendationSelectedDto) {
        return await this.diorService.getProductRecommendationSelecteds(query);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Post('product_recommendation_selecteds')
    async selectProducts(@Body() body: SelectProductsDto) {
        return await this.diorService.selectProducts(body);
    }
}
