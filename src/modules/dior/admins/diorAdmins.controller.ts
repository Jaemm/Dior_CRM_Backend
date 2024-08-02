import { Body, Query, Param, Controller, Get, Post, Put, Delete, Res } from '@nestjs/common';
import { Response } from 'express';
import { DiorAdminsService } from './diorAdmins.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/src/common/decorators/roles.decorator';
import { Role } from '@/src/common/enums/role.enum';
import { CreateAdminDto, ExportAdminsDto, GetAdminsDto, ImportAdminsDto, UpdateAdminDto } from './diorAdmins.dto';

@ApiTags('Dior-Admins')
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
    async createAdmin(@Body() body: CreateAdminDto) {
        return await this.diorAdminsService.createAdmin(body);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Put(':id')
    async updateAdminById(@Res() res: Response, @Param('id') adminId: string, @Body() body: UpdateAdminDto) {
        const updatedAdmin = await this.diorAdminsService.updateAdminById(adminId, body);
        return res.status(200).send(updatedAdmin);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Delete('delete_multiple/:ids')
    async deleteMutipleAdmins(@Param('ids') adminIds: string) {
        return await this.diorAdminsService.deleteMutipleAdmins(adminIds);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Post('import')
    async importAdmins(@Body() body: ImportAdminsDto) {
        return await this.diorAdminsService.importAdmins(body);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Get('export')
    async exportAdmins(@Query() query: ExportAdminsDto, @Res() res: Response) {
        const resultFile = await this.diorAdminsService.exportAdmins(query);

        res.setHeader('Content-Type', 'text/csv');
        res.attachment('users_list.csv');
        return res.send(resultFile);
    }
}
