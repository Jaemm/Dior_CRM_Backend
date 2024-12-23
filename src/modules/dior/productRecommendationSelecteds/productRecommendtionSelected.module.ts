import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ProductRecommendationSelectedsController } from './productRecommendtionSelected.controller';
import { ProductRecommendationSelectedsService } from './productRecommendtionSelected.service';
import {
    ProductAttributeTranslationsRepository,
    ProductAttributesRepository,
    ProductRecommendationRepository,
    ProductRecommendationSelectedRepository,
    ProductTranslationsRepository,
} from '@/src/common/repositories/crm';
import { StaticTokenMiddleware } from '@/src/common/middleWare/authMiddlware/staticToken.middleware';

@Module({
    controllers: [ProductRecommendationSelectedsController],
    providers: [
        ProductRecommendationSelectedsService,

        // Repos
        ProductAttributesRepository,
        ProductAttributeTranslationsRepository,
        ProductRecommendationRepository,
        ProductRecommendationSelectedRepository,
        ProductTranslationsRepository,
    ],
})
export class ProductRecommendationSelectedsModule {
    // StaticTokenMiddleware

    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(StaticTokenMiddleware)

            .forRoutes({
                path: 'dior/product_recommendation_selecteds',
                method: RequestMethod.GET,
            });
        // consumer.apply(AuthMiddleware).forRoutes({
        //     path: 'dior/company_consultants/by_consultant',
        //     method: RequestMethod.GET,
        // });
    }
}
