import { Body, Query, Controller, Get } from '@nestjs/common';
import { DiorAdminsService } from './diorAdmins.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '@/src/common/decorators/roles.decorator';
import { Role } from '@/src/common/enums/role.enum';
import { GetAdminsDto } from './diorAdmins.dto';

@Controller('dior/admins')
export class DiorAdminsController {
    constructor(private diorAdminsService: DiorAdminsService) {}

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Get()
    async getAdmins(@Query() qeury: GetAdminsDto) {
        return await this.diorAdminsService.getAdmins(qeury);
    }
}
