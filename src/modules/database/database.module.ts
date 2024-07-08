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

        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            name: 'cndpHairDB',
            useFactory: async (configService: ConfigService) => ({ ...configService.get('cndpHairDB') }),
        }),

        /* OHIO DB */
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            name: 'secondDB',
            useFactory: async (configService: ConfigService) => ({
                ...configService.get('secondDB'),
                autoLoadEntities: true,
            }),
        }),

        //analysis DB
        // CNDP SKIN ANALYSIS
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            name: 'ohioCndpSkinDB',
            useFactory: async (configService: ConfigService) => ({
                ...configService.get('ohioCndpSkinDB'),
                autoLoadEntities: true,
            }),
        }),
        // CNDP HAIR ANALYSIS
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            name: 'ohioCndpHairDB',
            useFactory: async (configService: ConfigService) => ({
                ...configService.get('ohioCndpHairDB'),
                autoLoadEntities: true,
            }),
        }),

        // third DATABASE
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            name: 'thirdDB',
            useFactory: async (configService: ConfigService) => ({
                ...configService.get('thirdDB'),
                autoLoadEntities: true,
            }),
        }),

        //analysis DB
        // CNDP SKIN ANALYSIS
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            name: 'thirdCndpSkinDB',
            useFactory: async (configService: ConfigService) => ({
                ...configService.get('thirdCndpSkinDB'),
                autoLoadEntities: true,
            }),
        }),
        // CNDP HAIR ANALYSIS
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            name: 'thirdCndpHairDB',
            useFactory: async (configService: ConfigService) => ({
                ...configService.get('thirdCndpHairDB'),
                autoLoadEntities: true,
            }),
        }),
    ],
})
export class DatabaseModule {}
