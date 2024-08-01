import { Request, Response } from 'express';
import { ApiBearerAuth, ApiHeader, ApiQuery, ApiTags } from '@nestjs/swagger';
import {
    Controller,
    Get,
    Req,
    Res,
    Query,
    Headers,
    Post,
    Body,
    Param,
    Delete,
    Put,
    BadRequestException,
} from '@nestjs/common';
import { ProductRecommendationService } from './productRecommendations.service';

import { Roles } from '@/src/common/decorators/roles.decorator';
import { Role } from '@/src/common/enums/role.enum';
import { AttributeRoutine, AutomaticProductByBatchIdDto, SearchProductRecommendationDto } from '../dior.dto';
import {
    CreateProductRecommendationDto,
    ExportRecommendtaionsDto,
    GetPresignUploadDto,
    ImportCountriesDto,
    ImportPicturesDto,
    ImportProductRecommendtaionDto,
    ImportTranslationsDto,
    UpdateProductRecommendationDto,
} from './productRecommendation.dto';

@ApiTags('Dior-Product Recommendtaions')
@Controller('/dior/product_recommendations')
export class ProductRecommendationController {
    constructor(private productRecommendationsService: ProductRecommendationService) {}

    @Get()
    @ApiBearerAuth()
    @ApiHeader({ name: 'X-CHOWIS-LOCALE', required: false })
    @Roles(Role.Consultant)
    async getProductRecommendation(
        @Req() req: Request,
        @Query() query: SearchProductRecommendationDto,
        @Headers('X-CHOWIS-LOCALE') locale: string,
    ) {
        return await this.productRecommendationsService.getProductRecommendation(req, query, locale);
    }

    @Post()
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async createProductRecommendation(@Body() body: CreateProductRecommendationDto) {
        return await this.productRecommendationsService.createProductRecommendation(body);
    }

    @Get('get_automatic_product_by_batch_id')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async getAutomaticProductByBatchId(@Query() query: AutomaticProductByBatchIdDto) {
        return await this.productRecommendationsService.getAutomaticProductByBatchId(query);
    }

    @Get('get_new_automatic_product_by_batch_id')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async getNewAutomaticProductByBatchId(@Query() query: AutomaticProductByBatchIdDto) {
        return await this.productRecommendationsService.getNewAutomaticProductByBatchId(query);
    }

    @Get('get_collection')
    @ApiBearerAuth()
    @ApiQuery({ name: 'routine', enum: ['Makeup', 'Skincare'] })
    @Roles(Role.Consultant)
    async getRecommendationsCollection(@Query('routine') routine?: AttributeRoutine) {
        return await this.productRecommendationsService.getRecommendationsCollection(routine);
    }

    @Get('get_category')
    @ApiBearerAuth()
    @ApiQuery({ name: 'routine', enum: ['Makeup', 'Skincare'] })
    @Roles(Role.Consultant)
    async getRecommendationsCategories(@Query('routine') routine?: AttributeRoutine) {
        return await this.productRecommendationsService.getRecommendationsCategories(routine);
    }

    @Post('import')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async importProductRecommendtaion(@Body() body: ImportProductRecommendtaionDto) {
        return await this.productRecommendationsService.importProductRecommendtaion(body);
    }

    @Post('import_translations')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async importProductTranslations(@Body() body: ImportTranslationsDto) {
        return await this.productRecommendationsService.importProductTranslations(body);
    }

    @Post('import_countries')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async importCountries(@Body() body: ImportCountriesDto) {
        return await this.productRecommendationsService.importCountries(body);
    }

    @Post('import_pictures')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async importPictures(@Body() body: ImportPicturesDto) {
        return await this.productRecommendationsService.importPictures(body);
    }

    @Get('export')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async exportRecommendation(@Req() req: Request, @Res() res: Response, @Query() query: ExportRecommendtaionsDto) {
        const resultFile = await this.productRecommendationsService.exportRecommendation(req, query);

        res.header('Content-Type', 'text/csv');
        res.attachment('list_of_products.csv');
        return res.send(resultFile);
    }

    @Get('get_axis')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async getAxis() {
        return await this.productRecommendationsService.getAxis();
    }

    @Get('presign_upload')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async getPresignUpload(@Query() query: GetPresignUploadDto) {
        if (!query.filename) {
            throw new BadRequestException({
                result_code: 400,
                error: 'Filename is missing',
            });
        }
        return await this.productRecommendationsService.getPresignUpload(query);
    }

    @Get(':id')
    @ApiBearerAuth()
    @ApiHeader({ name: 'X-CHOWIS-LOCALE', required: false })
    @Roles(Role.Consultant)
    async getProductRecommendationById(
        @Req() req: Request,
        @Param('id') recommendandationId: string,
        @Headers('X-CHOWIS-LOCALE') locale: string,
    ) {
        return await this.productRecommendationsService.getProductRecommendationById(recommendandationId, locale);
    }

    @Put(':id')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async updateProductRecommendationById(
        @Param('id') recommendandationId: string,
        @Body() body: UpdateProductRecommendationDto,
    ) {
        return await this.productRecommendationsService.updateProductRecommendationById(body, recommendandationId);
    }

    @Delete('delete_multiple/:ids')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async deleteMultipleProductRecommendationByIds(@Req() req: Request, @Param('ids') recommendandationIds: string) {
        return await this.productRecommendationsService.deleteMultipleProductRecommendationByIds(recommendandationIds);
    }

    @Delete(':id')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async deleteProductRecommendationById(@Req() req: Request, @Param('id') recommendandationId: string) {
        return await this.productRecommendationsService.deleteProductRecommendationById(recommendandationId);
    }
}
