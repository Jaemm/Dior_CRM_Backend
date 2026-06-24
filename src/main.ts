import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { readFileSync } from 'fs';
import { Request, Response } from 'express';
import { createSecureContext } from 'tls';

import { AppModule } from './app.module';
import { AppService } from './app.service';
import { createHealthCheckResponse } from './modules/apiHealthCheck/apiHealth.response';

function parseCorsOrigins(): string[] {
    const configuredOrigins = process.env.CORS_ALLOWED_ORIGINS?.split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);

    if (configuredOrigins?.length) return configuredOrigins;

    return ['http://localhost:3000'];
}

async function bootstrap() {
    const enableSwagger = process.env.OPEN_SWAGGER === 'true';
    const primaryHostname = process.env.PRIMARY_HOSTNAME;
    const secondaryHostname = process.env.SECONDARY_HOSTNAME;

    /* ================= HTTP ================= */
    const httpApp = await NestFactory.create(AppModule);
    await httpApp.listen(process.env.HTTP);

    /* ================= HTTPS ================= */
    const ssl = process.env.SSL === 'true';
    let httpsOptions: Record<string, unknown> | null = null;

    if (ssl) {
        const primaryKey = readFileSync(process.env.PRIMARY_SSL_KEY_PATH || '');
        const primaryCert = readFileSync(process.env.PRIMARY_SSL_CERT_PATH || '');
        const secondaryKey = readFileSync(process.env.SECONDARY_SSL_KEY_PATH || '');
        const secondaryCert = readFileSync(process.env.SECONDARY_SSL_CERT_PATH || '');

        const primaryContext = createSecureContext({
            key: primaryKey,
            cert: primaryCert,
        });

        const secondaryContext = createSecureContext({
            key: secondaryKey,
            cert: secondaryCert,
        });

        httpsOptions = {
            key: secondaryKey,
            cert: secondaryCert,
            SNICallback: (servername: string, cb: Function) => {
                if (servername === primaryHostname && primaryHostname) {
                    cb(null, primaryContext);
                    return;
                }

                if (servername === secondaryHostname && secondaryHostname) {
                    cb(null, secondaryContext);
                    return;
                }

                cb(null, secondaryContext);
            },
        };
    }

    /* ================= HTTPS APP ================= */
    const app = await NestFactory.create(AppModule, {
        httpsOptions,
        rawBody: true,
        logger: ['log', 'error', 'warn', 'debug', 'verbose'],
    });

    const port = Number(process.env.PORT) || 8097;
    const hostname = process.env.HOSTNAME || 'localhost';

    /* ================= Swagger ================= */
    if (enableSwagger) {
        const config = new DocumentBuilder()
            .setTitle('Dior API')
            .setVersion('1.0')
            .addBearerAuth()
            .build();

        const document = SwaggerModule.createDocument(app, config);
        SwaggerModule.setup('/docs', app, document);
    }

    app.use(cookieParser());

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            exceptionFactory: (e) => {
                const errors = e.map((err) => Object.values(err.constraints));
                return new BadRequestException(errors.flat());
            },
        }),
    );

    app.enableCors({
        origin: true,
        credentials: true,
    });

    const corsOrigins = parseCorsOrigins();
    Logger.log(`Configured CORS origins: ${corsOrigins.join(', ')}`);

    await app.listen(port, hostname);

    Logger.log(`HTTPS Server running on ${port}`);
    Logger.log(`Primary host: ${primaryHostname ?? 'unset'}`);
    Logger.log(`Secondary host: ${secondaryHostname ?? 'unset'}`);

    if (process.send) {
        process.send('ready');
    }
}

bootstrap();
