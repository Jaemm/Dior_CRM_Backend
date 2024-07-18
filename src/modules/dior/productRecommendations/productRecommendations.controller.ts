import { Request, Response } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
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
} from './productRecommendation.dto';

@ApiTags('Dior-Product Recommendtaions')
@Controller('/dior/product_recommendations')
export class ProductRecommendationController {
    constructor(private productRecommendationsService: ProductRecommendationService) {}

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Get()
    async getProductRecommendation(
        @Req() req: Request,
        @Query() query: SearchProductRecommendationDto,
        @Headers('X-CHOWIS-LOCALE') locale: string,
    ) {
        return await this.productRecommendationsService.getProductRecommendation(req, query, locale);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Get('get_automatic_product_by_batch_id')
    async getAutomaticProductByBatchId(@Query() query: AutomaticProductByBatchIdDto) {
        return await this.productRecommendationsService.getAutomaticProductByBatchId(query);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Post()
    async createProductRecommendation(
        @Body() body: CreateProductRecommendationDto,
        @Headers('X-CHOWIS-LOCALE')
        locale: string,
    ) {
        return await this.productRecommendationsService.createProductRecommendation(body);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Get('get_collection')
    async getRecommendationsCollection(@Query('routine') routine?: AttributeRoutine) {
        return await this.productRecommendationsService.getRecommendationsCollection(routine);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Get('get_category')
    async getRecommendationsCategories(@Query('routine') routine?: AttributeRoutine) {
        return await this.productRecommendationsService.getRecommendationsCategories(routine);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Post('import')
    async importProductRecommendtaion(@Body() body: ImportProductRecommendtaionDto) {
        return await this.productRecommendationsService.importProductRecommendtaion(body);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Post('import_translations ')
    async importProductTranslations(@Body() body: ImportTranslationsDto) {
        return await this.productRecommendationsService.importProductTranslations(body);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Post('import_countries ')
    async importCountries(@Body() body: ImportCountriesDto) {
        return await this.productRecommendationsService.importCountries(body);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Post('import_pictures ')
    async importPictures(@Body() body: ImportPicturesDto) {
        return await this.productRecommendationsService.importPictures(body);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Get('export')
    async exportRecommendation(@Req() req: Request, @Res() res: Response, @Query() query: ExportRecommendtaionsDto) {
        const resultFile = await this.productRecommendationsService.exportRecommendation(req, query);

        res.header('Content-Type', 'text/csv');
        res.attachment('list_of_products.csv');
        return res.send(resultFile);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Get('get_axis')
    async getAxis() {
        return await this.productRecommendationsService.getAxis();
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Get('presign_upload')
    async getPresignUpload(@Query() query: GetPresignUploadDto) {
        if (!query.filename) {
            throw new BadRequestException({
                result_code: 400,
                error: 'Filename is missing',
            });
        }
        return await this.productRecommendationsService.getPresignUpload(query);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Get(':id')
    async getProductRecommendationById(
        @Req() req: Request,
        @Param('id') recommendandationId: string,
        @Headers('X-CHOWIS-LOCALE') locale: string,
    ) {
        return await this.productRecommendationsService.getProductRecommendationById(recommendandationId, locale);
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Put(':id')
    async updateProductRecommendationById(
        @Req() req: Request,
        @Param('id') recommendandationId: string,
        @Body() body: CreateProductRecommendationDto,
        @Headers('X-CHOWIS-LOCALE') locale: string,
    ) {
        return await this.productRecommendationsService.updateProductRecommendationById(
            body,
            recommendandationId,
            locale,
        );
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Delete('delete_multiple/:ids')
    async deleteMultipleProductRecommendationByIds(
        @Req() req: Request,
        @Param('ids') recommendandationIds: string,
        @Headers('X-CHOWIS-LOCALE') locale: string,
    ) {
        return await this.productRecommendationsService.deleteMultipleProductRecommendationByIds(
            recommendandationIds,
            locale,
        );
    }

    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @Delete(':id')
    async deleteProductRecommendationById(
        @Req() req: Request,
        @Param('id') recommendandationId: string,
        @Headers('X-CHOWIS-LOCALE') locale: string,
    ) {
        return await this.productRecommendationsService.deleteProductRecommendationById(recommendandationId, locale);
    }
}
