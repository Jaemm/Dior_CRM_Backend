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
    UseInterceptors,
    UploadedFile,
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
import { FileInterceptor } from '@nestjs/platform-express';

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
        @Res() res: Response,
        @Query() query: SearchProductRecommendationDto,
        @Headers('X-CHOWIS-LOCALE') locale: string,
    ) {
        const productRecommendations = await this.productRecommendationsService.getProductRecommendation(
            req,
            query,
            locale,
        );
        return res.status(200).send(productRecommendations);
    }

    @Post()
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async createProductRecommendation(@Res() res: Response, @Body() body: CreateProductRecommendationDto) {
        const result = await this.productRecommendationsService.createProductRecommendation(body);
        return res.status(200).send(result);
    }

    @Get('get_automatic_product_by_batch_id')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async getAutomaticProductByBatchId(@Res() res: Response, @Query() query: AutomaticProductByBatchIdDto) {
        const recommendation = await this.productRecommendationsService.getAutomaticProductByBatchId(query);
        return res.status(200).send(recommendation);
    }

    @Get('get_new_automatic_product_by_batch_id')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async getNewAutomaticProductByBatchId(@Res() res: Response, @Query() query: AutomaticProductByBatchIdDto) {
        const recommendation = await this.productRecommendationsService.getNewAutomaticProductByBatchId(query);
        return res.status(200).send(recommendation);
    }

    @Get('get_collection')
    @ApiBearerAuth()
    @ApiQuery({ name: 'routine', enum: ['Makeup', 'Skincare'] })
    @Roles(Role.Consultant)
    async getRecommendationsCollection(@Res() res: Response, @Query('routine') routine?: AttributeRoutine) {
        const collection = await this.productRecommendationsService.getRecommendationsCollection(routine);
        return res.status(200).send(collection);
    }

    @Get('get_category')
    @ApiBearerAuth()
    @ApiQuery({ name: 'routine', enum: ['Makeup', 'Skincare'] })
    @Roles(Role.Consultant)
    async getRecommendationsCategories(@Res() res: Response, @Query('routine') routine?: AttributeRoutine) {
        const category = await this.productRecommendationsService.getRecommendationsCategories(routine);
        return res.status(200).send(category);
    }

    @Post('import')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async importProductRecommendtaion(
        @Req() req: Request,
        @Res() res: Response,
        @Body() body: ImportProductRecommendtaionDto,
    ) {
        const result = await this.productRecommendationsService.importProductRecommendtaion(req, body);
        return res.status(200).send(result);
    }

    @Post('import_translations')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async importProductTranslations(@Req() req: Request, @Res() res: Response, @Body() body: ImportTranslationsDto) {
        const result = await this.productRecommendationsService.importProductTranslations(req, body);
        return res.status(200).send(result);
    }

    @Post('import_countries')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async importCountries(@Req() req: Request, @Res() res: Response, @Body() body: ImportCountriesDto) {
        const result = await this.productRecommendationsService.importCountries(req, body);
        return res.status(200).send(result);
    }

    @Post('import_pictures')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async importPictures(@Res() res: Response, @Body() body: ImportPicturesDto) {
        const result = await this.productRecommendationsService.importPictures(body);
        return res.status(200).send(result);
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
    async getAxis(@Res() res: Response) {
        const result = await this.productRecommendationsService.getAxis();
        return res.status(200).send(result);
    }

    @Get('files/:hash')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async getProductRecommandationFileFromS3(@Res() res: Response, @Param('hash') hash: string) {
        const fileData = await this.productRecommendationsService.getProductRecommandationFileFromS3(hash);

        const { binary, fileName, mimeType } = fileData;

        res.status(200);
        res.set('Content-Type', `${mimeType}`);
        res.attachment(fileName);
        res.write(binary, 'binary');
        return res.end(null, 'binary');
    }

    @Get('presign_upload')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    @UseInterceptors(FileInterceptor('file'))
    async getPresignUpload(@Req() req: Request, @Res() res: Response, @UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException({
                result_code: 400,
                error: 'File is missing',
            });
        }
        const result = await this.productRecommendationsService.getPresignUpload(req, file);
        return res.status(200).send(result);
    }

    @Get(':id')
    @ApiBearerAuth()
    @ApiHeader({ name: 'X-CHOWIS-LOCALE', required: false })
    @Roles(Role.Consultant)
    async getProductRecommendationById(
        @Res() res: Response,
        @Param('id') recommendandationId: string,
        @Headers('X-CHOWIS-LOCALE') locale: string,
    ) {
        const recommendation = await this.productRecommendationsService.getProductRecommendationById(
            recommendandationId,
            locale,
        );
        return res.status(200).send(recommendation);
    }

    @Put(':id')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async updateProductRecommendationById(
        @Res() res: Response,
        @Param('id') recommendandationId: string,
        @Body() body: UpdateProductRecommendationDto,
    ) {
        const result = await this.productRecommendationsService.updateProductRecommendationById(
            body,
            recommendandationId,
        );
        return res.status(200).send(result);
    }

    @Delete('delete_multiple/:ids')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async deleteMultipleProductRecommendationByIds(@Res() res: Response, @Param('ids') recommendandationIds: string) {
        const result = await this.productRecommendationsService.deleteMultipleProductRecommendationByIds(
            recommendandationIds,
        );
        return res.status(200).send(result);
    }

    @Delete(':id')
    @ApiBearerAuth()
    @Roles(Role.Consultant)
    async deleteProductRecommendationById(@Res() res: Response, @Param('id') recommendandationId: string) {
        const result = await this.productRecommendationsService.deleteProductRecommendationById(recommendandationId);
        return res.status(200).send(result);
    }
}
