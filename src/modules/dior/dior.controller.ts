import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Req, Query } from '@nestjs/common';
import { DiorService } from './dior.service';
import { Roles } from '@/src/common/decorators/roles.decorator';
import { Role } from '@/src/common/enums/role.enum';
import { Request, query } from 'express';
import { CustomerByConsultantIdDto, SearchBranchesDto, SearchDto } from './dior.dto';

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
    async getCountries(@Req() req: Request, @Query() query: SearchDto) {
        return await this.diorService.getCountries(query);
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
}
