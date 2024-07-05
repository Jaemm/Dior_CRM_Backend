import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Req, Query } from '@nestjs/common';
import { DiorService } from './dior.service';
import { Roles } from '@/src/common/decorators/roles.decorator';
import { Role } from '@/src/common/enums/role.enum';
import { Request, query } from 'express';
import {
    CustomerByConsultantIdDto,
    GetRecommendationSelectedDto,
    SearchBranchesDto,
    SearchProductRecommendationDto,
    SearchProductRecommendationGroupsDto,
} from './dior.dto';

@ApiTags('Dior')
@Controller('dior')
export class DiorController {
    constructor(private readonly diorService: DiorService) {}

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Get('customers')
    async getCustomers(@Query() query: CustomerByConsultantIdDto) {
        return await this.diorService.getCustomers(query);
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
    async searchBranches(@Req() req: Request, @Query() query: SearchBranchesDto) {
        return await this.diorService.searchBranches(req, query);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Get('company_consultants/by_consultant')
    async getBranchesByConsultantsId(@Req() req: Request) {
        return await this.diorService.getBranchesByConsultantsId(req);
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
    async getProductRecommendation(@Req() req: Request, @Query() query: SearchProductRecommendationDto) {
        return await this.diorService.getProductRecommendation(req, query);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Get('product_recommendation_selecteds')
    async getProductRecommendationSelecteds(@Query() query: GetRecommendationSelectedDto) {
        return await this.diorService.getProductRecommendationSelecteds(query);
    }
}
