import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ChowisServiceService } from './chowis-service.service';
import { ChowisServiceController } from './chowis-service.controller';
import { AuthMiddleware } from '@/src/common/middleWare/authMiddlware/auth.middleware';
import { ChowisServiceLicenseManagement } from '@/src/common/entities/crmEntities/ChowisServiceLicenseManagement.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConsultantsModule } from '../consultants/consultants.module';

@Module({
    imports: [TypeOrmModule.forFeature([ChowisServiceLicenseManagement]), ConsultantsModule],
    controllers: [ChowisServiceController],
    providers: [ChowisServiceService],
})
export class ChowisServiceModule {
    configure(consumer: MiddlewareConsumer) {
        // consumer.apply(AuthMiddleware).forRoutes({
        //     path: 'chowis-service/expirationCheck',
        //     method: RequestMethod.POST,
        // });
    }
}
