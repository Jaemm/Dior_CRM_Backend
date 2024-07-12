import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Req, Query, Post, Body, Headers } from '@nestjs/common';
import { DiorService } from './dior.service';
import { Roles } from '@/src/common/decorators/roles.decorator';
import { Role } from '@/src/common/enums/role.enum';
import { Request, query } from 'express';
import {
    AttributeRoutine,
    AutomaticProductByBatchIdDto,
    CreateBranchesDto,
    CustomerByConsultantIdDto,
    GetRecommendationSelectedDto,
    SearchBranchesDto,
    SearchProductRecommendationDto,
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
    @Roles(Role.Consultant)
    @Get('countries')
    async getCountries(@Req() req: Request, @Query('search') search?: string) {
        return await this.diorService.getCountries(search);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Get('company_branches')
    async searchBranches(
        @Req() req: Request,
        @Query() query: SearchBranchesDto,
        @Headers('X-CHOWIS-LOCALE') locale: string,
    ) {
        return await this.diorService.searchBranches(req, query, locale);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Post('company_branches')
    async createBranches(@Req() req: Request, @Body() body: CreateBranchesDto) {
        return await this.diorService.createBranches(req, body);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Get('company_consultants/by_consultant')
    async getBranchesByConsultantsId(@Req() req: Request, @Headers('X-CHOWIS-LOCALE') locale: string) {
        return await this.diorService.getBranchesByConsultantsId(req, locale);
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
    @Get('product_recommendations')
    async getProductRecommendation(
        @Req() req: Request,
        @Query() query: SearchProductRecommendationDto,
        @Headers('X-CHOWIS-LOCALE') locale: string,
    ) {
        return await this.diorService.getProductRecommendation(req, query, locale);
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

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Get('product_recommendations/get_collection')
    async getRecommendationsCollection(@Query('routine') routine?: AttributeRoutine) {
        return await this.diorService.getRecommendationsCollection(routine);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Get('product_recommendations/get_category')
    async getRecommendationsCategories(@Query('routine') routine?: AttributeRoutine) {
        return await this.diorService.getRecommendationsCategories(routine);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Get('product_recommendations/get_automatic_product_by_batch_id')
    async getAutomaticProductByBatchId(@Query() query: AutomaticProductByBatchIdDto) {
        return await this.diorService.getAutomaticProductByBatchId(query);
    }
}
