import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';

import {
    ApplicationsRepository,
    ConsultantBranchesRepository,
    ConsultantsRepository,
    CustomersRepository,
    DevicesRepository,
    PasswordEmailDetailsRepository,
    ProductsRepository,
    SalesConnectionRepository,
} from '@/src/common/repositories/crm';
import { AuthMiddleware } from '@/src/common/middleWare/authMiddlware/auth.middleware';
import { PartnerDbService } from './partnerdb.service';
import { PartnerDbController } from './partnerdb.controller';
import { AuthService } from '../auth/auth.service';
import { ConsultantsService } from '../consultants/consultants.service';
import { JwtService } from '@/src/jwt/jwt.service';
import { ConsultantsModule } from '../consultants/consultants.module';

@Module({
    imports: [ConsultantsModule],
    controllers: [PartnerDbController],
    providers: [
        PartnerDbService,
        AuthService,
        JwtService,
        ApplicationsRepository,
        CustomersRepository,
        ConsultantsRepository,
        ConsultantBranchesRepository,
        DevicesRepository,
        SalesConnectionRepository,
        PasswordEmailDetailsRepository,
        ProductsRepository,
    ],
})
export class PartnerDbModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(AuthMiddleware)
            .exclude(
                {
                    path: 'partnerdb/consultants/dior_login',
                    method: RequestMethod.POST,
                },
                {
                    path: 'partnerdb/consultants/password',
                    method: RequestMethod.POST,
                },
            )
            .forRoutes({
                path: 'partnerdb/*',
                method: RequestMethod.ALL,
            });
    }
}
