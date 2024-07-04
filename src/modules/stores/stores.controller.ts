import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { StoreService } from './stores.service';
import { StoreCreateDto, StoreGetDto } from './stores.dto';
import { Roles } from '@/src/common/decorators/roles.decorator';
import { Role } from '@/src/common/enums/role.enum';

@ApiTags('Stores')
@Controller()
export class StoreController {
    constructor(private readonly storeService: StoreService) {}

    @ApiBearerAuth()
    @Roles(Role.Consultant, Role.Customer)
    @Post('create_store')
    async create(@Body() body: StoreCreateDto, @Res() res: Response) {
        const response = await this.storeService.create(body);
        return res.status(HttpStatus.OK).send(response);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant, Role.Customer)
    @Get('stores')
    async getStore(@Res() res: Response, @Query() query: StoreGetDto) {
        const stores = await this.storeService.getStore(query);
        return res.status(HttpStatus.OK).send({ stores });
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant, Role.Customer)
    @Delete('delete_store/:id')
    async delete(@Res() res: Response, @Param('id') id: number) {
        const response = await this.storeService.delete(id);
        return res.status(HttpStatus.OK).send(response);
    }
}
