import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';

import {
    ConsultantBranchesRepository,
    ConsultantsRepository,
    DevicesRepository,
    SalesConnectionRepository,
} from '@/src/common/repositories/crm';
import { AuthMiddleware } from '@/src/common/middleWare/authMiddlware/auth.middleware';
import { PartnerDbService } from './partnerdb.service';
import { PartnerDbController } from './partnerdb.controller';

@Module({
    controllers: [PartnerDbController],
    providers: [
        PartnerDbService,
        ConsultantsRepository,
        ConsultantBranchesRepository,
        DevicesRepository,
        SalesConnectionRepository,
    ],
})
export class PartnerDbModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(AuthMiddleware).forRoutes({
            path: 'partnerdb/*',
            method: RequestMethod.ALL,
        });
    }
}
