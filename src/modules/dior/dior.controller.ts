import { ApiBearerAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
    Controller,
    Get,
    Req,
    Query,
    Post,
    Body,
    Headers,
    Header,
    Res,
    UseInterceptors,
    UploadedFile,
} from '@nestjs/common';
import { DiorService } from './dior.service';
import { Roles } from '@/src/common/decorators/roles.decorator';
import { Role } from '@/src/common/enums/role.enum';
import { Request, Response } from 'express';
import { CustomerByConsultantIdDto, CreateCustomerDto, SendWebResultDto } from './dior.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Dior')
@Controller('dior')
export class DiorController {
    constructor(private readonly diorService: DiorService) {}

    @Get('customers')
    @ApiBearerAuth()
    @ApiHeader({ name: 'X-CHOWIS-LOCALE', required: false })
    @Roles(Role.Consultant)
    async getCustomers(@Query() query: CustomerByConsultantIdDto, @Headers('X-CHOWIS-LOCALE') locale: string) {
        return await this.diorService.getCustomers(query, locale);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Post('customers')
    async createCustomers(@Body() body: CreateCustomerDto) {
        return await this.diorService.createCustomers(body);
    }

    @Post('send-web-result')
    @ApiBearerAuth()
    @ApiHeader({ name: 'X-CHOWIS-LOCALE', required: false })
    @Roles(Role.Consultant)
    async sendWebResult(@Body() body: SendWebResultDto, @Headers('X-CHOWIS-LOCALE') locale?: string) {
        return await this.diorService.sendWebResult(body, locale);
    }

    @Post('file')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @UseInterceptors(FileInterceptor('file'))
    async fileUpload(@Req() req: Request, @Res() res: Response, @UploadedFile() file: Express.Multer.File) {
        const result = await this.diorService.fileUpload(file);

        return res.status(200).send(result);
    }
}
