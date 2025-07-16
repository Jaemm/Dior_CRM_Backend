import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt/dist';
import { UtilsController } from './utils.controller';
import { UtilsService } from './utils.service';
import { AuthMiddleware } from '@/src/common/middleWare/authMiddlware/auth.middleware';

@Module({
    imports: [],
    providers: [UtilsService],
    controllers: [UtilsController],
    exports: [UtilsService],
})
export class UtilsModule {
    configure(consumer: MiddlewareConsumer) {
        // consumer.apply(AuthMiddleware).forRoutes({
        //     path: 'utils/generate_qr_code',
        //     method: RequestMethod.GET,
        // });
    }
}
