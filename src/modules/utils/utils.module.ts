import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt/dist';
import { UtilsController } from './utils.controller';
import { UtilsService } from './utils.service';

@Module({
    imports: [],
    providers: [UtilsService],
    controllers: [UtilsController],
    exports: [UtilsService],
})
export class UtilsModule {}
