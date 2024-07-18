import { MiddlewareConsumer, Module, RequestMethod, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
    Applications,
    //
    Consultants,
    ConsultantShops,
    ConsultantBranches,
    ConsultantCompanies,
    //
    Customers,
    Countries,
    //
    Devices,
    DiorCustomerConsents,
    //
    Products,
} from '@/src/common/entities/crmEntities';

import { AdminUsers } from '@/src/common/entities/crmEntities/AdminUsers.entity';

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
import { ConsultantPositions } from '@/src/common/entities/crmEntities/ConsultantPositions.entity';

import { ConsultantStores } from '@/src/common/entities/crmEntities/ConsultantStores.entity';
import { ConsultantCountries } from '@/src/common/entities/crmEntities/ConsultantCountries.entity';

import { ActiveStorageAttachments } from '@/src/common/entities/crmEntities/ActiveStorageAttachments.entity';
import { CRMController } from './crm.controller';
import { CRMService } from './crm.service';
import { AuthMiddleware } from '@/src/common/middleWare/authMiddlware/auth.middleware';
import { CustomersModule } from '../customers/customers.module';
import { ConsultantsModule } from '../consultants/consultants.module';

import { ProductsModule } from '../products/products.module';

import { JwtService } from '@/src/jwt/jwt.service';
import { AwsS3Service } from '@/src/common/awsS3/awsS3.service';
import {
    ConsultantsRepository,
    CustomersRepository,
    DiorCustomerConsentsRepository,
} from '@/src/common/repositories/crm';
import { CountriesRepository } from '@/src/common/repositories/crm/countries.repository';

@Module({
    imports: [
        Customers,
        Consultants,
        DiorCustomerConsents,
        TypeOrmModule.forFeature([
            ConsultantShops,
            ConsultantBranches,
            ConsultantCompanies,

            AdminUsers,

            ConsultantCountrys,
            Countries,

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
        ]),
        CustomersModule,
        forwardRef(() => ConsultantsModule),

        ProductsModule,
    ],
    controllers: [CRMController],
    providers: [
        // Services
        CRMService,
        JwtService,
        AwsS3Service,

        // Repos
        CustomersRepository,
        ConsultantsRepository,
        CountriesRepository,
        DiorCustomerConsentsRepository,
    ],
    exports: [CRMService],
})
export class CRMModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(AuthMiddleware).forRoutes(
            {
                path: 'crm/customers/register',
                method: RequestMethod.POST,
            },
            {
                path: 'crm/customers/update/:id',
                method: RequestMethod.POST,
            },
            {
                path: 'crm/customers',
                method: RequestMethod.GET,
            },
            {
                path: 'crm/customers',
                method: RequestMethod.POST,
            },
            {
                path: 'crm/customers/:id',
                method: RequestMethod.GET,
            },
            {
                path: 'crm/customers/:id',
                method: RequestMethod.PUT,
            },
            {
                path: 'crm/customers/:id',
                method: RequestMethod.DELETE,
            },
            {
                path: 'crm/customers/get_by_email',
                method: RequestMethod.GET,
            },
            {
                path: 'crm/customers/sync',
                method: RequestMethod.POST,
            },
            {
                path: 'crm/customers/presign_upload_consent_form',
                method: RequestMethod.POST,
            },
            {
                path: 'crm/customers/update_consent_form',
                method: RequestMethod.PUT,
            },
        );
    }
}
