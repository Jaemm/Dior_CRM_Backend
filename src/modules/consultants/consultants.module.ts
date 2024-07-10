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
    Customers,
    ConsultantShops,
    ConsultantPositions,
    ProductRecommendations,
    HealthTips,
    Identities,
    DiorCustomerConsents,
} from '@/src/common/entities/crmEntities';

import { ConsultantsController } from './consultants.controller';
import { ConsultantsService } from './consultants.service';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/auth.service';
import { JwtService } from 'src/jwt/jwt.service';
import { ConsultantBranches } from '@/src/common/entities/crmEntities/ConsultantBranches.entity';

import { ConsultantCountrys } from '@/src/common/entities/crmEntities/ConsultantCountrys.entity';

import { CustomerApplications } from '@/src/common/entities/crmEntities/CustomerApplications.entity';

import { ConsultantApplications } from '@/src/common/entities/crmEntities/ConsultantApplications.entity';

import { Licenses } from '@/src/common/entities/crmEntities/Licenses.entity';
import { LicenseHistories } from '@/src/common/entities/crmEntities/LicenseHistories.entity';

import { ConsultantLicenses } from '@/src/common/entities/crmEntities/ConsultantLicenses.entity';
import { CustomerLicenses } from '@/src/common/entities/crmEntities/CustomerLicenses.entity';
import { Ethnicities } from '@/src/common/entities/crmEntities/Ethnicities.entity';
import { SkinColorGroups } from '@/src/common/entities/crmEntities/SkinColorGroups.entity';

import { SalesConn } from '@/src/common/entities/crmEntities/SalesConn.entity';

import { AdminGroups } from '@/src/common/entities/crmEntities/AdminGroups.entity';

import { Genders } from '@/src/common/entities/crmEntities/Genders.entity';

import { ConsultantStores } from '@/src/common/entities/crmEntities/ConsultantStores.entity';
import { ConsultantCountries } from '@/src/common/entities/crmEntities/ConsultantCountries.entity';

import { ConsultantCompanyService } from '../consultantCompany/consultantCompany.service';
import { ActiveStorageAttachments } from '@/src/common/entities/crmEntities/ActiveStorageAttachments.entity';
import { ConsultantCompanyModule } from '../consultantCompany/consultantCompany.module';
import { DeviceService } from '../devices/devices.service';
import { CrmDataReplicationModule } from '../dataReplication/consultantDataReplication/consultantDataReplication.module';
import { AuthMiddleware } from '@/src/common/middleWare/authMiddlware/auth.middleware';
import { StoreModule } from '../stores/stores.module';
import { GendersModule } from '../genders/genders.module';
import { CountriesModule } from '../countries/countries.module';
import { SkinColorGroupsModule } from '../skinColorGroups/skinColorGroups.module';
import { EthinicitiesModule } from '../ethinicities/ethinicities.module';
import { LicenceModule } from '../licence/licence.module';
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
    ProductsRepository,
} from '@/src/common/repositories/crm';
import { AnalysisDataReplicationModule } from '../dataReplication/analysisDataReplication/analysisDataReplication.module';

@Module({
    imports: [
        Consultants,
        ConsultantShops,
        Products,
        Devices,
        Customers,
        DiorCustomerConsents,
        Applications,

        AnalysisDataReplicationModule,
        TypeOrmModule.forFeature([
            ConsultantShops,
            ConsultantBranches,
            ConsultantCompanies,

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

            SalesConn,

            AdminGroups,

            Genders,
            ConsultantPositions,

            ConsultantStores,
            ConsultantCountries,

            ActiveStorageAttachments,
            Versions,
            Notifications,
        ]),
        AuthModule,

        ConsultantCompanyModule,
        CrmDataReplicationModule,

        StoreModule,
        ConsultantsModule,
        GendersModule,
        CountriesModule,
        SkinColorGroupsModule,
        EthinicitiesModule,

        LicenceModule,
        forwardRef(() => ProductsModule),
        CustomersModule,
        CRMModule,
    ],
    controllers: [ConsultantsController],
    providers: [
        ConsultantsService,
        AuthService,
        JwtService,
        ConsultantCompanyService,
        DeviceService,

        // Repos
        ApplicationsRepository,
        ConsultantsRepository,
        ConsultantShopsRepository,
        CustomersRepository,
        DevicesRepository,
        ProductsRepository,
        DiorCustomerConsentsRepository,
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
