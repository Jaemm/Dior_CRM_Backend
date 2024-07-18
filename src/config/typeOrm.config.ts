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
    // logging: true,
    // cli: {
    //   migrationsDir: 'src/common/entities',
    // },
};

// CNDP HAIR
const cndpHairDBConfig = {
    type: 'postgres',
    host: configService.get('POSTGRES_HOST'),
    port: configService.get('POSTGRES_PORT'),
    username: configService.get('POSTGRES_USER'),
    password: configService.get('POSTGRES_PASSWORD'),
    database: configService.get('CNDP_HAIR'),
    entities: ['dist/**/analysisEntities/*.entity{.ts,.js}'],
    migrations: ['dist/migrations/*{.ts,.js}'],
    autoLoadEntities: true,
    synchronize: false,
    logging: true,
    // cli: {
    //   migrationsDir: 'src/common/entities',
    // },
};

/* ------------ GLOBAL DB SETTINGS END -------------------*/

/* ------------ OHIO DB SETTINGS START -------------------*/
const secondDBConfig = {
    type: 'postgres',
    host: configService.get('POSTGRES_HOST_2'),
    port: configService.get('POSTGRES_PORT_2'),
    username: configService.get('POSTGRES_USER_2'),
    password: configService.get('POSTGRES_PASSWORD_2'),
    database: configService.get('POSTGRES_DB_2'),
    entities: ['dist/**/*.entity{.ts,.js}'],
    migrations: ['dist/migrations/*{.ts,.js}'],
    autoLoadEntities: true,
    synchronize: false,
    logging: true,
    // cli: {
    //   migrationsDir: 'src/common/entities',
    // },
};

// ANALYSIS
// CNDP SKIN
const ohioCndpSkinDBConfig = {
    // name: 'ohioDB',
    type: 'postgres',
    host: configService.get('POSTGRES_HOST_2'),
    port: configService.get('POSTGRES_PORT_2'),
    username: configService.get('POSTGRES_USER_2'),
    password: configService.get('POSTGRES_PASSWORD_2'),
    database: configService.get('CNDP_SKIN'),
    entities: ['dist/**/analysisEntities/*.entity{.ts,.js}'],
    migrations: ['dist/migrations/*{.ts,.js}'],
    autoLoadEntities: true,
    synchronize: false,
    logging: true,
    // cli: {
    //   migrationsDir: 'src/common/entities',
    // },

    /* ------------ OHIO DB SETTINGS END -------------------*/
};

// CNDP HAIR
const ohioCndpHairDBConfig = {
    type: 'postgres',
    host: configService.get('POSTGRES_HOST_2'),
    port: configService.get('POSTGRES_PORT_2'),
    username: configService.get('POSTGRES_USER_2'),
    password: configService.get('POSTGRES_PASSWORD_2'),
    database: configService.get('CNDP_HAIR'),
    entities: ['dist/**/analysisEntities/*.entity{.ts,.js}'],
    migrations: ['dist/migrations/*{.ts,.js}'],
    autoLoadEntities: true,
    synchronize: false,
    logging: true,
    // cli: {
    //   migrationsDir: 'src/common/entities',
    // },
};

/* ------------ third DB SETTINGS START -------------------*/

const thirdDBConfig = {
    type: 'postgres',
    host: configService.get('POSTGRES_HOST_3'),
    port: configService.get('POSTGRES_PORT_3'),
    username: configService.get('POSTGRES_USER_3'),
    password: configService.get('POSTGRES_PASSWORD_3'),
    database: configService.get('POSTGRES_DB_3'),
    entities: ['dist/**/*.entity{.ts,.js}'],
    migrations: ['dist/migrations/*{.ts,.js}'],
    autoLoadEntities: true,
    synchronize: false,
    logging: true,
    // cli: {
    //   migrationsDir: 'src/common/entities',
    // },
};

// ANALYSIS
// CNDP SKIN
const thirdCndpSkinDBConfig = {
    // name: 'ohioDB',
    type: 'postgres',
    host: configService.get('POSTGRES_HOST_3'),
    port: configService.get('POSTGRES_PORT_3'),
    username: configService.get('POSTGRES_USER_3'),
    password: configService.get('POSTGRES_PASSWORD_3'),
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
/* ------------ OHIO DB SETTINGS END -------------------*/

// CNDP HAIR
const thirdCndpHairDBConfig = {
    type: 'postgres',
    host: configService.get('POSTGRES_HOST_3'),
    port: configService.get('POSTGRES_PORT_3'),
    username: configService.get('POSTGRES_USER_3'),
    password: configService.get('POSTGRES_PASSWORD_3'),
    database: configService.get('CNDP_HAIR'),
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
export const cndpHairDB = registerAs('cndpHairDB', () => cndpHairDBConfig);
export const diorCndpSkinDB = registerAs('diorCndpSkinDB', () => diorCndpSkinDBConfig);

export const secondDB = registerAs('secondDB', () => secondDBConfig);
export const ohioCndpSkinDB = registerAs('ohioCndpSkinDB', () => ohioCndpSkinDBConfig);
export const ohioCndpHairDB = registerAs('ohioCndpHairDB', () => ohioCndpHairDBConfig);

export const thirdDB = registerAs('thirdDB', () => thirdDBConfig);
export const thirdCndpSkinDB = registerAs('thirdCndpSkinDB', () => thirdCndpSkinDBConfig);
export const thirdCndpHairDB = registerAs('thirdCndpHairDB', () => thirdCndpHairDBConfig);
