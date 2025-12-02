import { forwardRef, MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { DiorController } from './dior.controller';
import { DiorService } from './dior.service';
import { AuthMiddleware } from '@/src/common/middleWare/authMiddlware/auth.middleware';

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
    ProductLogEntity,
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
    PresignRepository,
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
import { AwsS3Service } from '@/src/common/awsS3/awsS3.service';

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
        ProductLogEntity,

        DiorAdminsModule,
        DiorCountriesModule,
        DiorCompanyBranchesModule,
        DiorCompanyConsultantsModule,
        DiorDevicesModule,
        DiorProductAttributesModule,
        ProductRecommendationSelectedsModule,
        ProductRecommendationGroupsModule,
        ProductRecommendationModule,

        StatisticsModule,
    ],
    controllers: [DiorController],
    providers: [
        DiorService,
        CommonService,
        AwsS3Service,

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

        PresignRepository,
    ],
})
export class DiorModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(AuthMiddleware)
            .exclude(
                {
                    path: 'dior/product_recommendations/files/:hash',
                    method: RequestMethod.GET,
                },
                {
                    path: 'dior/company_branches/files/:hash',
                    method: RequestMethod.GET,
                },
                {
                    path: 'dior/product_recommendation_selecteds',
                    method: RequestMethod.GET,
                },
            )
            .forRoutes({
                path: 'dior/*',
                method: RequestMethod.ALL,
            });
    }
}
