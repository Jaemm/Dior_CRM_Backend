import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CrmDataReplicationService } from './consultantDataReplication.service';
import { ActiveStorageAttachments } from '@/src/common/entities/crmEntities/ActiveStorageAttachments.entity';

import { ConsultantCountries } from '@/src/common/entities/crmEntities/ConsultantCountries.entity';
import { ConsultantStores } from '@/src/common/entities/crmEntities/ConsultantStores.entity';
import { ConsultantPositions } from '@/src/common/entities/crmEntities/ConsultantPositions.entity';
import { Genders } from '@/src/common/entities/crmEntities/Genders.entity';

import { SkinColorGroups } from '@/src/common/entities/crmEntities/SkinColorGroups.entity';
import { Ethnicities } from '@/src/common/entities/crmEntities/Ethnicities.entity';
import { CustomerLicenses } from '@/src/common/entities/crmEntities/CustomerLicenses.entity';
import { ConsultantLicenses } from '@/src/common/entities/crmEntities/ConsultantLicenses.entity';

import { LicenseHistories } from '@/src/common/entities/crmEntities/LicenseHistories.entity';
import { Licenses } from '@/src/common/entities/crmEntities/Licenses.entity';
import { Consultants } from '@/src/common/entities/crmEntities/Consultants.entity';
import { ConsultantShops } from '@/src/common/entities/crmEntities/ConsultantShops.entity';
import { ConsultantBranches } from '@/src/common/entities/crmEntities/ConsultantBranches.entity';
import { ConsultantCompanies } from '@/src/common/entities/crmEntities/ConsultantCompanies.entity';

import { ConsultantCountrys } from '@/src/common/entities/crmEntities/ConsultantCountrys.entity';
import { Countries } from '@/src/common/entities/crmEntities/Countries.entity';
import { Customers } from '@/src/common/entities/crmEntities/Customers.entity';

import { CustomerApplications } from '@/src/common/entities/crmEntities/CustomerApplications.entity';
import { Applications } from '@/src/common/entities/crmEntities/Applications.entity';

import { ConsultantApplications } from '@/src/common/entities/crmEntities/ConsultantApplications.entity';
import { Products } from '@/src/common/entities/crmEntities/Products.entity';
import { Devices } from '@/src/common/entities/crmEntities/Devices.entity';

import { CommonModule } from '@/src/common/common.module';
import { ActiveStorageBlobs } from '@/src/common/entities/crmEntities/ActiveStorageBlobs.entity';
import { AnalysisDataReplicationModule } from '../analysisDataReplication/analysisDataReplication.module';

@Module({
    imports: [
        // PassportModule.register({ defaultStrategy: 'jwt' }),
        // JwtModule.register({ secret: process.env.JWT_REFRESH_TOKEN_SECRET, signOptions: { expiresIn: '1d' } }),
        TypeOrmModule.forFeature(
            [
                Consultants,
                ConsultantShops,
                ConsultantBranches,
                ConsultantCompanies,

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

                Genders,
                ConsultantPositions,
                ConsultantStores,
                ConsultantCountries,

                ActiveStorageAttachments,
                ActiveStorageBlobs,
            ],
            'secondDB',
        ),

        TypeOrmModule.forFeature([
            Consultants,
            ConsultantShops,
            ConsultantBranches,
            ConsultantCompanies,

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

            Genders,
            ConsultantPositions,
            ConsultantStores,
            ConsultantCountries,

            ActiveStorageAttachments,
            ActiveStorageBlobs,
        ]),
        CommonModule,
        AnalysisDataReplicationModule,
    ],
    providers: [CrmDataReplicationService],
    exports: [CrmDataReplicationService],
})
export class CrmDataReplicationModule {}
