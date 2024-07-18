import { MiddlewareConsumer, Module, RequestMethod, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
    AdminUsers,
    Applications,
    Consultants,
    Notifications,
    PasswordEmailDetails,
    Devices,
    Products,
    ConsultantCompanies,
    Countries,
    ConsultantBranches,
    Customers,
    ConsultantShops,
    ConsultantPositions,
    ProductRecommendations,
    HealthTips,
    Identities,
    DiorCustomerConsents,
    SalesConn,
    Genders,
    ConsultantStores,
    ConsultantCountries,
    RefreshTokens,
} from '@/src/common/entities/crmEntities';

import { ConsultantsController } from './consultants.controller';
import { ConsultantsService } from './consultants.service';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/auth.service';
import { JwtService } from 'src/jwt/jwt.service';

import { ConsultantCountrys } from '@/src/common/entities/crmEntities/ConsultantCountrys.entity';

import { CustomerApplications } from '@/src/common/entities/crmEntities/CustomerApplications.entity';

import { ConsultantApplications } from '@/src/common/entities/crmEntities/ConsultantApplications.entity';

import { Licenses } from '@/src/common/entities/crmEntities/Licenses.entity';
import { LicenseHistories } from '@/src/common/entities/crmEntities/LicenseHistories.entity';

import { ConsultantLicenses } from '@/src/common/entities/crmEntities/ConsultantLicenses.entity';
import { CustomerLicenses } from '@/src/common/entities/crmEntities/CustomerLicenses.entity';
import { Ethnicities } from '@/src/common/entities/crmEntities/Ethnicities.entity';
import { SkinColorGroups } from '@/src/common/entities/crmEntities/SkinColorGroups.entity';

import { AdminGroups } from '@/src/common/entities/crmEntities/AdminGroups.entity';

import { ActiveStorageAttachments } from '@/src/common/entities/crmEntities/ActiveStorageAttachments.entity';

import { CrmDataReplicationModule } from '../dataReplication/consultantDataReplication/consultantDataReplication.module';
import { AuthMiddleware } from '@/src/common/middleWare/authMiddlware/auth.middleware';
import { SkinColorGroupsModule } from '../skinColorGroups/skinColorGroups.module';

import { ProductsModule } from '../products/products.module';
import { CustomersModule } from '../customers/customers.module';
import { Versions } from '@/src/common/entities/crmEntities/Versions.entity';
import { CRMModule } from '../crm/crm.module';
import {
    ApplicationsRepository,
    ConsultantShopsRepository,
    ConsultantsRepository,
    CustomersRepository,
    DevicesRepository,
    DiorCustomerConsentsRepository,
    GendersRepository,
    ProductsRepository,
    ConsultantBranchesRepository,
    ConsultantPositionsRepository,
    ConsultantCountriesRepository,
    ConsultantStoresRepository,
    SalesConnectionRepository,
    NotificationsRepository,
    RefreshTokensRepository,
    ConsultantCompaniesRepository,
    ActiveStorageAttachmentsRepository,
    EthnicitiesRepository,
} from '@/src/common/repositories/crm';
import { AnalysisDataReplicationModule } from '../dataReplication/analysisDataReplication/analysisDataReplication.module';
import { CountriesRepository } from '@/src/common/repositories/crm/countries.repository';
import { LicenseHistoriesRepository } from '@/src/common/repositories/crm/licenseHistories.repository';
import { LicensesRepository } from '@/src/common/repositories/crm/licenses.repository';

@Module({
    imports: [
        Consultants,
        ConsultantBranches,
        ConsultantShops,
        ConsultantPositions,
        ConsultantCountries,
        Products,
        Devices,
        Customers,
        DiorCustomerConsents,
        Applications,
        ConsultantStores,
        SalesConn,
        Notifications,
        RefreshTokens,

        AnalysisDataReplicationModule,
        TypeOrmModule.forFeature([
            ConsultantShops,
            ConsultantCompanies,
            ConsultantPositions,

            Identities,
            PasswordEmailDetails,
            ProductRecommendations,
            HealthTips,

            Devices,

            ConsultantCountrys,
            Countries,

            CustomerApplications,
            Applications,

            ConsultantApplications,
            Products,

            Licenses,
            LicenseHistories,

            ConsultantLicenses,
            CustomerLicenses,
            Ethnicities,
            SkinColorGroups,

            AdminUsers,

            AdminGroups,

            Genders,

            ConsultantCountries,

            ActiveStorageAttachments,
            Versions,
        ]),
        AuthModule,

        CrmDataReplicationModule,

        ConsultantsModule,

        SkinColorGroupsModule,

        forwardRef(() => ProductsModule),
        CustomersModule,
        CRMModule,
    ],
    controllers: [ConsultantsController],
    providers: [
        ConsultantsService,
        AuthService,
        JwtService,

        // Repos
        ApplicationsRepository,
        ActiveStorageAttachmentsRepository,
        ConsultantsRepository,
        ConsultantBranchesRepository,
        ConsultantCountriesRepository,
        ConsultantCompaniesRepository,
        ConsultantShopsRepository,
        ConsultantStoresRepository,
        ConsultantPositionsRepository,
        CountriesRepository,
        CustomersRepository,
        DevicesRepository,
        DiorCustomerConsentsRepository,
        EthnicitiesRepository,
        GendersRepository,
        RefreshTokensRepository,
        NotificationsRepository,
        ProductsRepository,
        SalesConnectionRepository,
        LicensesRepository,
        LicenseHistoriesRepository,
    ],
    exports: [ConsultantsService],
})
export class ConsultantsModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(AuthMiddleware).forRoutes(
            {
                path: 'consultants',
                method: RequestMethod.GET,
            },
            {
                path: 'consultants/company',
                method: RequestMethod.GET,
            },
            {
                path: 'consultants/branch',
                method: RequestMethod.GET,
            },
            {
                path: 'consultants/shop',
                method: RequestMethod.GET,
            },
            {
                path: 'consultants/position',
                method: RequestMethod.GET,
            },
            {
                path: 'consultants/country',
                method: RequestMethod.GET,
            },
            {
                path: 'consultants/store',
                method: RequestMethod.GET,
            },
            {
                path: 'consultants/create_sale_connection',
                method: RequestMethod.POST,
            },
            {
                path: 'consultants/fetch_sales_connection',
                method: RequestMethod.GET,
            },
            {
                path: 'consultants/change_email',
                method: RequestMethod.GET,
            },
            {
                path: 'consultants/login/phone',
                method: RequestMethod.POST,
            },
            {
                path: 'consultants/update',
                method: RequestMethod.PUT,
            },
            {
                path: 'consultants/me',
                method: RequestMethod.GET,
            },
            {
                path: 'consultants/password_change',
                method: RequestMethod.POST,
            },
            {
                path: 'consultants/logout',
                method: RequestMethod.POST,
            },
            {
                path: 'consultants/delete_account',
                method: RequestMethod.DELETE,
            },
            {
                path: 'consultants/:id/confirm',
                method: RequestMethod.GET,
            },
            {
                path: 'consultants/all-license',
                method: RequestMethod.GET,
            },
            {
                path: 'consultants/change-license',
                method: RequestMethod.PUT,
            },
            {
                path: 'consultants/notify_sales_change_license',
                method: RequestMethod.PUT,
            },
            {
                path: 'consultants/calculate-price',
                method: RequestMethod.GET,
            },
            {
                path: 'consultants/update-license',
                method: RequestMethod.PUT,
            },
            {
                path: 'consultants/renew-devices',
                method: RequestMethod.POST,
            },
            {
                path: 'consultants/product_recommendations',
                method: RequestMethod.GET,
            },
            {
                path: 'consultants/products/enter',
                method: RequestMethod.POST,
            },
            {
                path: 'consultants/request_callback_url',
                method: RequestMethod.POST,
            },
            {
                path: 'consultants/customers/:id',
                method: RequestMethod.GET,
            },
            {
                path: 'consultants/notifications',
                method: RequestMethod.GET,
            },
            {
                path: 'consultants/notifications/:id',
                method: RequestMethod.DELETE,
            },
            {
                path: 'consultants/health_tips',
                method: RequestMethod.GET,
            },
            {
                path: 'consultants/health_tips/by_company',
                method: RequestMethod.GET,
            },
            {
                path: 'consultants/generate_flat_file_dior',
                method: RequestMethod.GET,
            },
        );
    }
}
