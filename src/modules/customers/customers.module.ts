import { MiddlewareConsumer, Module, RequestMethod, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { Consultants } from '@/src/common/entities/crmEntities/Consultants.entity';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/auth.service';
import { JwtService } from 'src/jwt/jwt.service';
import { ConsultantShops } from '@/src/common/entities/crmEntities/ConsultantShops.entity';
import { ConsultantBranches } from '@/src/common/entities/crmEntities/ConsultantBranches.entity';
import { ConsultantCompanies } from '@/src/common/entities/crmEntities/ConsultantCompanies.entity';

import { AdminUsers } from '@/src/common/entities/crmEntities/AdminUsers.entity';

import { ConsultantCountrys } from '@/src/common/entities/crmEntities/ConsultantCountrys.entity';
import { Countries } from '@/src/common/entities/crmEntities/Countries.entity';
import { Customers } from '@/src/common/entities/crmEntities/Customers.entity';

import { CustomerApplications } from '@/src/common/entities/crmEntities/CustomerApplications.entity';
import { Applications } from '@/src/common/entities/crmEntities/Applications.entity';

import { ConsultantApplications } from '@/src/common/entities/crmEntities/ConsultantApplications.entity';
import { Products } from '@/src/common/entities/crmEntities/Products.entity';
import { Devices } from '@/src/common/entities/crmEntities/Devices.entity';

import { Licenses } from '@/src/common/entities/crmEntities/Licenses.entity';
import { LicenseHistories } from '@/src/common/entities/crmEntities/LicenseHistories.entity';

import { ConsultantLicenses } from '@/src/common/entities/crmEntities/ConsultantLicenses.entity';
import { CustomerLicenses } from '@/src/common/entities/crmEntities/CustomerLicenses.entity';
import { Ethnicities } from '@/src/common/entities/crmEntities/Ethnicities.entity';
import { SkinColorGroups } from '@/src/common/entities/crmEntities/SkinColorGroups.entity';

import { SalesConn } from '@/src/common/entities/crmEntities/SalesConn.entity';

import { AdminGroups } from '@/src/common/entities/crmEntities/AdminGroups.entity';

import { Genders } from '@/src/common/entities/crmEntities/Genders.entity';
import { ConsultantPositions } from '@/src/common/entities/crmEntities/ConsultantPositions.entity';

import { ConsultantStores } from '@/src/common/entities/crmEntities/ConsultantStores.entity';
import { ConsultantCountries } from '@/src/common/entities/crmEntities/ConsultantCountries.entity';

import { ActiveStorageAttachments } from '@/src/common/entities/crmEntities/ActiveStorageAttachments.entity';
import { CrmDataReplicationModule } from '../dataReplication/consultantDataReplication/consultantDataReplication.module';
import { AuthMiddleware } from '@/src/common/middleWare/authMiddlware/auth.middleware';

import { SkinColorGroupsService } from '../skinColorGroups/skinColorGroups.service';
import { CustomerDataReplicationModule } from '../dataReplication/customerDataReplication/customerDataReplication.module';

import { ProductsModule } from '../products/products.module';
import { Versions } from '@/src/common/entities/crmEntities/Versions.entity';

import { Notifications } from '@/src/common/entities/crmEntities/Notifications.entity';
import { PasswordEmailDetails } from '@/src/common/entities/crmEntities/PasswordEmailDetails.entity';

import { ProductRecommendations, HealthTips, Identities } from '@/src/common/entities/crmEntities';
import { ApplicationsRepository, EthnicitiesRepository } from '@/src/common/repositories/crm';
import { CountriesRepository } from '@/src/common/repositories/crm/countries.repository';

@Module({
    imports: [
        Applications,
        TypeOrmModule.forFeature([
            Consultants,
            ConsultantShops,
            ConsultantBranches,
            ConsultantCompanies,

            PasswordEmailDetails,
            ProductRecommendations,
            HealthTips,

            AdminUsers,

            ConsultantCountrys,
            Countries,
            Customers,

            CustomerApplications,

            ConsultantApplications,
            Products,
            Devices,

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
            Identities,
        ]),
        AuthModule,

        CrmDataReplicationModule,
        CustomerDataReplicationModule,

        forwardRef(() => ProductsModule),
        // CustomerConsentsModule
    ],
    controllers: [CustomersController],
    providers: [
        CustomersService,
        AuthService,
        JwtService,

        SkinColorGroupsService,
        // CustomerDataReplicationService,

        // Repos
        ApplicationsRepository,
        CountriesRepository,
        EthnicitiesRepository,
    ],
    exports: [CustomersService],
})
export class CustomersModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(AuthMiddleware).exclude('customers/confirmation').forRoutes(
            {
                path: 'customers/update',
                method: RequestMethod.PUT,
            },
            {
                path: 'customers/basic-details-customers',
                method: RequestMethod.GET,
            },
            {
                path: 'customers/me',
                method: RequestMethod.GET,
            },
            {
                path: 'customers/password_change',
                method: RequestMethod.POST,
            },
            {
                path: 'customers/logout',
                method: RequestMethod.POST,
            },
            {
                path: 'customers/shop-list',
                method: RequestMethod.GET,
            },
            {
                path: 'customers/countries-list',
                method: RequestMethod.GET,
            },
            {
                path: 'customers/:id',
                method: RequestMethod.GET,
            },
            {
                path: 'customers/delete_account',
                method: RequestMethod.DELETE,
            },
            {
                path: 'customers/all-license',
                method: RequestMethod.GET,
            },
            {
                path: 'customers/change-license',
                method: RequestMethod.PUT,
            },
            {
                path: 'customers/notify_sales_change_license',
                method: RequestMethod.PUT,
            },
            {
                path: 'customers/calculate-price',
                method: RequestMethod.GET,
            },
            {
                path: 'customers/update-license',
                method: RequestMethod.PUT,
            },
            {
                path: 'customers/renew-devices',
                method: RequestMethod.POST,
            },
        );
    }
}
