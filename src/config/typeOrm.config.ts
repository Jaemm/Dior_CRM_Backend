import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService, registerAs } from '@nestjs/config';
import { config } from 'dotenv';

config();

const configService = new ConfigService();

/* ------------ GLOBAL DB SETTINGS START -------------------*/

const globalConfig = {
    // name: 'globalDB',
    type: 'postgres',
    host: configService.get('POSTGRES_HOST'),
    port: configService.get('POSTGRES_PORT'),
    username: configService.get('POSTGRES_USER'),
    password: configService.get('POSTGRES_PASSWORD'),
    database: configService.get('POSTGRES_DB'),
    entities: ['dist/**/*.entity{.ts,.js}'],
    migrations: ['dist/migrations/*{.ts,.js}'],
    autoLoadEntities: true,
    synchronize: false,
    // logging: true,
    // cli: {
    //   migrationsDir: 'src/common/entities',
    // },
};

// ANALYSIS DB SETTINGS

// CNDP SKIN
const cndpSkinDBConfig = {
    type: 'postgres',
    host: configService.get('POSTGRES_HOST'),
    port: configService.get('POSTGRES_PORT'),
    username: configService.get('POSTGRES_USER'),
    password: configService.get('POSTGRES_PASSWORD'),
    database: configService.get('CNDP_SKIN'),
    entities: ['dist/**/analysisEntities/*.entity{.ts,.js}'],
    migrations: ['dist/migrations/*{.ts,.js}'],
    autoLoadEntities: true,
    synchronize: false,
    logging: true,
    // cli: {
    //   migrationsDir: 'src/common/entities',
    // },
};

const diorCndpSkinDBConfig = {
    type: 'postgres',
    host: configService.get('POSTGRES_HOST'),
    port: configService.get('POSTGRES_PORT'),
    username: configService.get('POSTGRES_USER'),
    password: configService.get('POSTGRES_PASSWORD'),
    database: configService.get('DIOR_CNDP_SKIN'),
    entities: ['dist/**/analysisEntities/*.entity{.ts,.js}'],
    migrations: ['dist/migrations/*{.ts,.js}'],
    autoLoadEntities: true,
    synchronize: false,
    logging: true,
    // cli: {
    //   migrationsDir: 'src/common/entities',
    // },
};

export const globalDB = registerAs('globalDB', () => globalConfig);
export const cndpSkinDB = registerAs('cndpSkinDB', () => cndpSkinDBConfig);
export const diorCndpSkinDB = registerAs('diorCndpSkinDB', () => diorCndpSkinDBConfig);
