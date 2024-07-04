import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConsultantCompanyController } from './consultantCompany.controller';
import { ConsultantCompanyService } from './consultantCompany.service';
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
import { ActiveStorageBlobs } from '@/src/common/entities/crmEntities/ActiveStorageBlobs.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Consultants,
            ConsultantShops,
            ConsultantBranches,
            ConsultantCompanies,

            AdminUsers,

            ConsultantCountrys,
            Countries,
            Customers,

            CustomerApplications,
            Applications,

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
            ActiveStorageBlobs,
        ]),
        AuthModule,
    ],
    controllers: [ConsultantCompanyController],
    providers: [ConsultantCompanyService, AuthService, JwtService],
    exports: [ConsultantCompanyService],
})
export class ConsultantCompanyModule {}
