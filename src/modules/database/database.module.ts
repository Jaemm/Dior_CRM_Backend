import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                ...configService.get('globalDB'),
                autoLoadEntities: true,
            }),
        }),

        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            name: 'cndpSkinDB',
            useFactory: async (configService: ConfigService) => ({
                ...configService.get('cndpSkinDB'),
            }),
        }),

        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            name: 'diorCndpSkinDB',
            useFactory: async (configService: ConfigService) => ({
                ...configService.get('diorCndpSkinDB'),
            }),
        }),
    ],
})
export class DatabaseModule {}
