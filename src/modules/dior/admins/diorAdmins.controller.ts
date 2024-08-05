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
    async getAdmins(@Res() res: Response, @Query() qeury: GetAdminsDto) {
        const admins = await this.diorAdminsService.getAdmins(qeury);
        return res.status(200).send(admins);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Post()
    async createAdmin(@Res() res: Response, @Body() body: CreateAdminDto) {
        const result = await this.diorAdminsService.createAdmin(body);
        return res.status(200).send(result);
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
    async deleteMutipleAdmins(@Res() res: Response, @Param('ids') adminIds: string) {
        const result = await this.diorAdminsService.deleteMutipleAdmins(adminIds);
        return res.status(200).send(result);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Post('import')
    async importAdmins(@Res() res: Response, @Body() body: ImportAdminsDto) {
        const result = await this.diorAdminsService.importAdmins(body);
        return res.status(200).send(result);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Get('export')
    async exportAdmins(@Res() res: Response, @Query() query: ExportAdminsDto) {
        const resultFile = await this.diorAdminsService.exportAdmins(query);

        res.setHeader('Content-Type', 'text/csv');
        res.attachment('users_list.csv');
        return res.send(resultFile);
    }
}
