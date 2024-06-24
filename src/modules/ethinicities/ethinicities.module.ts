
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Consultants } from '@/src/common/entities/crmEntities/Consultants.entity';
import { ConsultantShops } from '@/src/common/entities/crmEntities/ConsultantShops.entity';
import { ConsultantBranches } from '@/src/common/entities/crmEntities/ConsultantBranches.entity';
import { ConsultantCompanies } from '@/src/common/entities/crmEntities/ConsultantCompanies.entity';
import { ConsultantCustomzations } from '@/src/common/entities/crmEntities/ConsultantCustomzations.entity';
import { DoWrite } from '@/src/common/entities/crmEntities/DoWrite.entity';
import { AdminUsers } from '@/src/common/entities/crmEntities/AdminUsers.entity';
import { UserInformation } from '@/src/common/entities/crmEntities/UserInformation.entity';
import { ConsultantCountrys } from '@/src/common/entities/crmEntities/ConsultantCountrys.entity';
import { Countries } from '@/src/common/entities/crmEntities/Countries.entity';
import { Customers } from '@/src/common/entities/crmEntities/Customers.entity';
import { ChowisCustomerConsents } from '@/src/common/entities/crmEntities/ChowisCustomerConsents.entity';
import { CustomerApplications } from '@/src/common/entities/crmEntities/CustomerApplications.entity';
import { Applications } from '@/src/common/entities/crmEntities/Applications.entity';
import { AppVersionChecks } from '@/src/common/entities/crmEntities/AppVersionChecks.entity';
import { ConsultantApplications } from '@/src/common/entities/crmEntities/ConsultantApplications.entity';
import { Products } from '@/src/common/entities/crmEntities/Products.entity';
import { Devices } from '@/src/common/entities/crmEntities/Devices.entity';
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
import { ConsultantPositions } from '@/src/common/entities/crmEntities/ConsultantPositions.entity';
import { PackageRelation } from '@/src/common/entities/crmEntities/PackageRelation.entity';
import { ConsultantStores } from '@/src/common/entities/crmEntities/ConsultantStores.entity';
import { ConsultantCountries } from '@/src/common/entities/crmEntities/ConsultantCountries.entity';
import { Faq } from '@/src/common/entities/crmEntities/Faq.entity';
import { ActiveStorageAttachments } from '@/src/common/entities/crmEntities/ActiveStorageAttachments.entity';
import { EthinicitiesController } from './ethinicities.controller';
import { EthinicitiesService } from './ethinicities.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Consultants,
            ConsultantShops,
            ConsultantBranches,
            ConsultantCompanies,
            ConsultantCustomzations,
            DoWrite,
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
        ]),
    ],
    controllers: [EthinicitiesController],
    providers: [
        EthinicitiesService,
    ],
    exports: [EthinicitiesService],
})

export class EthinicitiesModule { }
