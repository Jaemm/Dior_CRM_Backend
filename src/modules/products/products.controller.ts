import { BadRequestException, Body, Controller, Get, Headers, HttpStatus, Post, Query, Req, Res } from '@nestjs/common';
import { Response, Request } from 'express';
import { ApiBearerAuth, ApiExcludeController, ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { ProductsEnterDto, ProductsFetchDto } from './products.dto';
import { ResponseMessages } from '@/src/common/constants/response-messages';
import { ErrorStatus } from '@/src/common/constants/error-status';

@ApiExcludeController()
@ApiTags('Products')
@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}

    @Get('info')
    async getProducts(@Res() res: Response, @Query() query: ProductsFetchDto) {
        const products = await this.productsService.fetchProduct(query);
        return res.status(HttpStatus.OK).send({ products });
    }

    @ApiBearerAuth()
    @Post('enter')
    async enterProducts(
        @Req() req: Request,
        @Res() res: Response,
        @Body() body: ProductsEnterDto,
        @Headers('X-CHOWIS-LOCALE') locale: string,
    ) {
        const userId = (<{ id: string }>req['user']).id;

        if (!body.optic_number || !body.password || !body.application_id) {
            throw new BadRequestException({
                result_code: ErrorStatus.PRODUCT_CREDS_REQUIRED,
                error: ResponseMessages.ProductCredsRequired,
            });
        }
        const product = await this.productsService.enterProduct(userId, body, locale);
        return res.status(HttpStatus.OK).send(product);
    }

    @Post('details')
    async details(@Res() res: Response, @Body() body: ProductsFetchDto) {
        const storeResult = await this.productsService.fetchProduct(body);
        return res.status(HttpStatus.OK).send(storeResult);
    }
}
