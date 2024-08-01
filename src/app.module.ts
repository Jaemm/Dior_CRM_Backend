import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from '@hapi/joi';
import { globalDB, cndpSkinDB, diorCndpSkinDB } from './config/typeOrm.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { CommonModule } from './common/common.module';
import { ConsultantsModule } from './modules/consultants/consultants.module';
import { DiorModule } from './modules/dior/dior.module';
import { AwsS3Module } from './common/awsS3/awsS3.module';
import { ImageModule } from './modules/image/image.module';
import config from './config/config.schema';
import { DataReplicationModule } from './modules/dataReplication/dataReplication.module';
import { CustomersModule } from './modules/customers/customers.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthMiddleware } from './common/middleWare/authMiddlware/auth.middleware';

import { ProductsModule } from './modules/products/products.module';
import { HealthModule } from './modules/apiHealthCheck/apiHealth.module';
import { CRMModule } from './modules/crm/crm.module';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './common/guards/roles.guard';
// import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AllExceptionsFilter } from './common/middleWare/exceptions/exceptionHandling/allException.filter';
import { LoggingMiddleware } from './common/middleWare/logMiddleWare/logging.middleware';

import { DevtoolsModule } from '@nestjs/devtools-integration';
import { DatabaseModule } from './modules/database/database.module';
import {
    ConsultantShopsRepository,
    DevicesRepository,
    EthnicitiesRepository,
    GendersRepository,
    SkinColorGroupsRepository,
} from './common/repositories/crm';
import { CountriesRepository } from './common/repositories/crm/countries.repository';
import { SkinColorGroups } from './common/entities/crmEntities';
import { PartnerDbModule } from './modules/partnerdb/partnerdb.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validationSchema: Joi.object({
                POSTGRES_HOST: Joi.string().required(),
                POSTGRES_PORT: Joi.number().required(),
                POSTGRES_USER: Joi.string().required(),
                POSTGRES_PASSWORD: Joi.string().required(),
                POSTGRES_DB: Joi.string().required(),
                PORT: Joi.number(),
                EMAIL_HOST: Joi.string().required(),
                EMAIL_USER: Joi.string().required(),
                EMAIL_PASSWORD: Joi.string().required(),
                APP_ID: Joi.string().uuid({ version: 'uuidv4' }).required(),
                JWT_CONFIRMATION_TIME: Joi.string().required(),
                JWT_RESET_PASSWORD_SECRET: Joi.string().required(),
                JWT_RESET_PASSWORD_TIME: Joi.string().required(),
                DOMAIN: Joi.string().required(),

                // Analyis Table
                CNDP_SKIN: Joi.string().optional(),
                CNDP_HAIR: Joi.string().optional(),
                CMA_SKIN: Joi.string().optional(),
                CMA_HAIR: Joi.string().optional(),

                //DIOR
                DIOR_CNDP_SKIN: Joi.string().required(),
                CNDP_SKIN_ANALYSIS_URL: Joi.string().required(),
            }),
        }),
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['env/.env'],
            load: [config, globalDB, cndpSkinDB, diorCndpSkinDB],
        }),

        DevtoolsModule.register({
            http: process.env.NODE_ENV !== 'production',
        }),

        //
        DatabaseModule,

        ConsultantsModule,
        CustomersModule,
        DiorModule,

        AuthModule,
        CommonModule,
        HealthModule,
        AwsS3Module,
        ImageModule,

        DataReplicationModule,

        ProductsModule,
        PartnerDbModule,
        CRMModule,
    ],
    controllers: [AppController],
    providers: [
        ConsultantShopsRepository,
        CountriesRepository,
        EthnicitiesRepository,

        DevicesRepository,
        GendersRepository,
        SkinColorGroupsRepository,

        AppService,
        {
            provide: APP_GUARD,
            useClass: RolesGuard,
        },
        {
            provide: APP_FILTER,
            useClass: AllExceptionsFilter,
        },
    ],
})
export class AppModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(AuthMiddleware).forRoutes(
            {
                path: '/shops',
                method: RequestMethod.GET,
            },
            {
                path: '/shops-list',
                method: RequestMethod.GET,
            },
            {
                path: '/basic-details-customers',
                method: RequestMethod.GET,
            },
            {
                path: '/countries-list',
                method: RequestMethod.GET,
            },
            {
                path: '/basic-details',
                method: RequestMethod.GET,
            },
            {
                path: '/logout',
                method: RequestMethod.POST,
            },
        );
        consumer.apply(LoggingMiddleware).forRoutes('*');
    }
}
