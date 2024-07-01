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
} from '@/src/common/entities/crmEntities';

import { ConsultantsController } from './consultants.controller';
import { ConsultantsService } from './consultants.service';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/auth.service';
import { JwtService } from 'src/jwt/jwt.service';
import { ConsultantBranches } from '@/src/common/entities/crmEntities/ConsultantBranches.entity';

import { DoWrite } from '@/src/common/entities/crmEntities/DoWrite.entity';
import { UserInformation } from '@/src/common/entities/crmEntities/UserInformation.entity';
import { ConsultantCountrys } from '@/src/common/entities/crmEntities/ConsultantCountrys.entity';
import { ChowisCustomerConsents } from '@/src/common/entities/crmEntities/ChowisCustomerConsents.entity';
import { CustomerApplications } from '@/src/common/entities/crmEntities/CustomerApplications.entity';
import { AppVersionChecks } from '@/src/common/entities/crmEntities/AppVersionChecks.entity';
import { ConsultantApplications } from '@/src/common/entities/crmEntities/ConsultantApplications.entity';
import { DeviceConfigurations } from '@/src/common/entities/crmEntities/DeviceConfigurations.entity';
import { Licenses } from '@/src/common/entities/crmEntities/Licenses.entity';
import { LicenseHistories } from '@/src/common/entities/crmEntities/LicenseHistories.entity';
import { LicenseSummaries } from '@/src/common/entities/crmEntities/LicenseSummaries.entity';
import { ConsultantLicenses } from '@/src/common/entities/crmEntities/ConsultantLicenses.entity';
import { CustomerLicenses } from '@/src/common/entities/crmEntities/CustomerLicenses.entity';
import { Ethnicities } from '@/src/common/entities/crmEntities/Ethnicities.entity';
import { SkinColorGroups } from '@/src/common/entities/crmEntities/SkinColorGroups.entity';
import { AgentCustomizations } from '@/src/common/entities/crmEntities/AgentCustomizations.entity';
import { DoComment } from '@/src/common/entities/crmEntities/DoComment.entity';
import { DoRemark } from '@/src/common/entities/crmEntities/DoRemark.entity';
import { DoCustomerType } from '@/src/common/entities/crmEntities/DoCustomerType.entity';
import { DoSaleChannel } from '@/src/common/entities/crmEntities/DoSaleChannel.entity';
import { DoShippingTerm } from '@/src/common/entities/crmEntities/DoShippingTerm.entity';
import { DoStatus } from '@/src/common/entities/crmEntities/DoStatus.entity';
import { DoUsage } from '@/src/common/entities/crmEntities/DoUsage.entity';
import { DoProductPortfolio } from '@/src/common/entities/crmEntities/DoProductPortfolio.entity';
import { DoPickupCase } from '@/src/common/entities/crmEntities/DoPickupCase.entity';
import { DoPackingSpec } from '@/src/common/entities/crmEntities/DoPackingSpec.entity';
import { DoCountries } from '@/src/common/entities/crmEntities/DoCountries.entity';
import { SalesConn } from '@/src/common/entities/crmEntities/SalesConn.entity';
import { DoBusinessTeam } from '@/src/common/entities/crmEntities/DoBusinessTeam.entity';
import { DoSales } from '@/src/common/entities/crmEntities/DoSales.entity';
import { DoRent } from '@/src/common/entities/crmEntities/DoRent.entity';
import { DoAs } from '@/src/common/entities/crmEntities/DoAs.entity';
import { DoProductSort } from '@/src/common/entities/crmEntities/DoProductSort.entity';
import { DoProductType } from '@/src/common/entities/crmEntities/DoProductType.entity';
import { AdminGroups } from '@/src/common/entities/crmEntities/AdminGroups.entity';
import { DoPackages } from '@/src/common/entities/crmEntities/DoPackages.entity';
import { Genders } from '@/src/common/entities/crmEntities/Genders.entity';
import { PackageRelation } from '@/src/common/entities/crmEntities/PackageRelation.entity';
import { ConsultantStores } from '@/src/common/entities/crmEntities/ConsultantStores.entity';
import { ConsultantCountries } from '@/src/common/entities/crmEntities/ConsultantCountries.entity';
import { Faq } from '@/src/common/entities/crmEntities/Faq.entity';
import { ConsultantCompanyService } from '../consultantCompany/consultantCompany.service';
import { ActiveStorageAttachments } from '@/src/common/entities/crmEntities/ActiveStorageAttachments.entity';
import { ConsultantCompanyModule } from '../consultantCompany/consultantCompany.module';
import { DeviceService } from '../devices/devices.service';
import { CrmDataReplicationModule } from '../dataReplication/consultantDataReplication/consultantDataReplication.module';
import { AuthMiddleware } from '@/src/common/middleWare/authMiddlware/auth.middleware';
import { ConsultantPositionsModule } from '../consultantPositions/consultantPositions.module';
import { StoreModule } from '../stores/stores.module';
import { ConsultantShopsModule } from '../consultantShops/consultantShops.module';
import { GendersModule } from '../genders/genders.module';
import { CountriesModule } from '../countries/countries.module';
import { SkinColorGroupsModule } from '../skinColorGroups/skinColorGroups.module';
import { EthinicitiesModule } from '../ethinicities/ethinicities.module';
import { ApplicationsModule } from '../applications/applications.module';
import { ConsultantBranchesModule } from '../consultantBranches/consultantBranches.module';
import { LicenceModule } from '../licence/licence.module';
import { ProductsModule } from '../products/products.module';
import { CustomersModule } from '../customers/customers.module';
import { Versions } from '@/src/common/entities/crmEntities/Versions.entity';
import { CRMModule } from '../crm/crm.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Consultants,
            ConsultantShops,
            ConsultantBranches,
            ConsultantCompanies,

            Identities,
            PasswordEmailDetails,
            ProductRecommendations,
            HealthTips,
            DoWrite,
            Devices,
            AdminUsers,
            UserInformation,
            ConsultantCountrys,
            Countries,
            Customers,
            ChowisCustomerConsents,
            CustomerApplications,
            Applications,
            AppVersionChecks,
            ConsultantApplications,
            Products,
            Devices,
            DeviceConfigurations,
            Licenses,
            LicenseHistories,
            LicenseSummaries,
            ConsultantLicenses,
            CustomerLicenses,
            Ethnicities,
            SkinColorGroups,
            AgentCustomizations,
            DoComment,
            DoRemark,
            DoCustomerType,
            DoSaleChannel,
            DoShippingTerm,
            DoStatus,
            DoUsage,
            AdminUsers,
            DoProductPortfolio,
            DoPickupCase,
            DoPackingSpec,
            DoCountries,
            SalesConn,
            DoBusinessTeam,
            DoSales,
            DoRent,
            DoAs,
            DoProductSort,
            DoProductType,
            AdminGroups,
            DoPackages,
            Genders,
            ConsultantPositions,
            PackageRelation,
            ConsultantStores,
            ConsultantCountries,
            Faq,
            ActiveStorageAttachments,
            Versions,
            Notifications,
        ]),
        AuthModule,
        ConsultantCompanyModule,
        CrmDataReplicationModule,
        ConsultantPositionsModule,
        StoreModule,
        ConsultantsModule,
        ConsultantShopsModule,
        GendersModule,
        CountriesModule,
        SkinColorGroupsModule,
        EthinicitiesModule,
        ApplicationsModule,
        ConsultantBranchesModule,
        LicenceModule,
        forwardRef(() => ProductsModule),
        CustomersModule,
        CRMModule,
    ],
    controllers: [ConsultantsController],
    providers: [ConsultantsService, AuthService, JwtService, ConsultantCompanyService, DeviceService],
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
        );
    }
}
