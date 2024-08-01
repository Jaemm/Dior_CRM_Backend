import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { APP_FILTER, APP_GUARD } from '@nestjs/core';
// import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { DevtoolsModule } from '@nestjs/devtools-integration';
import { Analysis } from '@/src/common/entities/analysisEntities/Analysis.entity';

@Module({
    imports: [
        /* GLOBAL DB */
        // CRM
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                ...configService.get('globalDB'),
                autoLoadEntities: true,
            }),
        }),

        // cndp SKIN
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
