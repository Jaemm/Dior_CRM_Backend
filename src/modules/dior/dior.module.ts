import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { DiorController } from './dior.controller';
import { DiorService } from './dior.service';
import { AuthMiddleware } from '@/src/common/middleWare/authMiddlware/auth.middleware';

// DataBase
import { ConsultantBranches, ConsultantCountries, Consultants } from '@/src/common/entities/crmEntities';
import {
    ConsultantsRepository,
    ConsultantCountriesRepository,
    ConsultnatBranchesRepository,
} from '@/src/common/repositories';

@Module({
    imports: [Consultants, ConsultantCountries, ConsultantBranches],
    controllers: [DiorController],
    providers: [DiorService, ConsultantsRepository, ConsultantCountriesRepository, ConsultnatBranchesRepository],
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
