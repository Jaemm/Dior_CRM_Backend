import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { DiorController } from './dior.controller';
import { DiorService } from './dior.service';
import { AuthMiddleware } from '@/src/common/middleWare/authMiddlware/auth.middleware';

// DataBase
import {
    ConsultantBranches,
    ConsultantCountries,
    Consultants,
    Customers,
    Products,
    ProductAttributes,
    ProductAttributeTranslations,
    ProductRecommendations,
    ProductRecommendationGroups,
    ProductRecommendationSelecteds,
} from '@/src/common/entities/crmEntities';
import {
    ConsultantsRepository,
    ConsultantCountriesRepository,
    ConsultantBranchesRepository,
    CustomersRepository,
    ProductAttributesRepository,
    ProductAttributeTranslationsRepository,
    ProductRecommendationRepository,
    ProductRecommendationGroupsRepository,
    ProductRecommendationSelectedRepository,
    ProductTranslationsRepository,
    ProductsRepository,
} from '@/src/common/repositories/crm';
import { CommonService } from '@/src/common/common.service';
import { ProductRecommendationModule } from './product_recommendations/product_recommendations.module';
import { DiorCountriesModule } from './countries/dior_countries.module';

@Module({
    imports: [
        Consultants,
        ConsultantCountries,
        ConsultantBranches,
        Customers,
        Products,
        ProductAttributes,
        ProductAttributeTranslations,
        ProductRecommendations,
        ProductRecommendationSelecteds,
        ProductRecommendationGroups,

        // Modules
        DiorCountriesModule,
        ProductRecommendationModule,
    ],
    controllers: [DiorController],
    providers: [
        DiorService,
        CommonService,

        // Repositories
        ProductsRepository,
        ConsultantsRepository,
        ConsultantCountriesRepository,
        ConsultantBranchesRepository,
        CustomersRepository,
        ProductAttributesRepository,
        ProductAttributeTranslationsRepository,
        ProductRecommendationRepository,
        ProductRecommendationSelectedRepository,
        ProductRecommendationGroupsRepository,
        ProductTranslationsRepository,
    ],
})
export class DiorModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(AuthMiddleware).forRoutes({
            path: 'dior/*',
            method: RequestMethod.ALL,
        });
        // consumer.apply(AuthMiddleware).forRoutes({
        //     path: 'dior/company_consultants/by_consultant',
        //     method: RequestMethod.GET,
        // });
    }
}
