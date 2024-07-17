import { Body, Query, Controller, Get, Post } from '@nestjs/common';
import { DiorAdminsService } from './diorAdmins.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '@/src/common/decorators/roles.decorator';
import { Role } from '@/src/common/enums/role.enum';
import { CreateAdminDto, GetAdminsDto } from './diorAdmins.dto';

@Controller('dior/admins')
export class DiorAdminsController {
    constructor(private diorAdminsService: DiorAdminsService) {}

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Get()
    async getAdmins(@Query() qeury: GetAdminsDto) {
        return await this.diorAdminsService.getAdmins(qeury);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Post()
    async postAdmins(@Body() body: CreateAdminDto) {
        return await this.diorAdminsService.postAdmins(body);
    }
}
