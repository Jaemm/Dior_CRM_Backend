import { forwardRef, MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
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
    ProductLogs,
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
import { ProductRecommendationModule } from './productRecommendations/productRecommendations.module';
import { DiorCountriesModule } from './countries/dior_countries.module';
import { DiorDevicesModule } from './deivces/dior_devices.module';
import { DiorAdminsModule } from './admins/diorAdmins.module';
import { DiorCompanyBranchesModule } from './companyBranches/companyBranches.module';
import { DiorCompanyConsultantsModule } from './companyConsultants/companyConsultants.module';
import { DiorProductAttributesModule } from './productAttributes/productAttributes.module';
import { ProductRecommendationGroupsModule } from './productRecommendationGroups/productRecommendationGroups.module';
import { ProductRecommendationSelectedsModule } from './productRecommendationSelecteds/productRecommendtionSelected.module';
import { StatisticsModule } from './statistics/statistics.module';

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
        ProductLogs,

        // Modules
        DiorAdminsModule,
        DiorCountriesModule,
        DiorCompanyBranchesModule,
        DiorCompanyConsultantsModule,
        DiorDevicesModule,
        DiorProductAttributesModule,
        ProductRecommendationModule,
        ProductRecommendationSelectedsModule,
        ProductRecommendationGroupsModule,

        StatisticsModule,
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
