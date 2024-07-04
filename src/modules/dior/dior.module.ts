import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { DiorController } from './dior.controller';
import { DiorService } from './dior.service';
import { AuthMiddleware } from '@/src/common/middleWare/authMiddlware/auth.middleware';

// DataBase
import { ConsultantBranches, ConsultantCountries, Consultants, Customers } from '@/src/common/entities/crmEntities';
import {
    ConsultantsRepository,
    ConsultantCountriesRepository,
    ConsultnatBranchesRepository,
    CustomersRepository,
} from '@/src/common/repositories';

@Module({
    imports: [Consultants, ConsultantCountries, ConsultantBranches, Customers],
    controllers: [DiorController],
    providers: [
        DiorService,

        // Repositories
        ConsultantsRepository,
        ConsultantCountriesRepository,
        ConsultnatBranchesRepository,
        CustomersRepository,
    ],
})
export class DiorModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(AuthMiddleware).forRoutes({
            path: 'dior/*',
            method: RequestMethod.ALL,
        });
        // consumer.apply(AuthMiddleware).forRoutes({
        //     path: 'dior/company_consultants/by_consultant',
        //     method: RequestMethod.GET,
        // });
    }
}
