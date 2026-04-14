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

    return ['https://dior-crm.choicedx.kr', 'https://dior-crm.chowis.cloud', 'http://localhost:3000'];
}

async function bootstrap() {
    const port = Number(process.env.PORT) || 8097;

    const choicedxCert = {
        key: readFileSync('/etc/letsencrypt/live/dior-crm.choicedx.kr/privkey.pem'),
        cert: readFileSync('/etc/letsencrypt/live/dior-crm.choicedx.kr/fullchain.pem'),
    };

    const chowisCert = {
        key: readFileSync('/etc/letsencrypt/live/dior-crm.chowis.cloud/privkey.pem'),
        cert: readFileSync('/etc/letsencrypt/live/dior-crm.chowis.cloud/fullchain.pem'),
    };

    const choicedxContext = createSecureContext(choicedxCert);
    const chowisContext = createSecureContext(chowisCert);

    const httpsOptions = {
        ...chowisCert,

        SNICallback: (servername: string, cb: any) => {
            try {
                if (servername === 'dior-crm.choicedx.kr') {
                    return cb(null, choicedxContext);
                }

                if (servername === 'dior-crm.chowis.cloud') {
                    return cb(null, chowisContext);
                }

                console.warn('Unknown SNI, fallback → chowis:', servername);
                return cb(null, chowisContext);
            } catch (err) {
                console.error('SNI error:', err);
                return cb(err);
            }
        },
    };

    const app = await NestFactory.create(AppModule, {
        httpsOptions,
        rawBody: true,
        logger: ['log', 'error', 'warn'],
    });

    const appService = app.get(AppService);
    appService.handleApp(app);

    app.setGlobalPrefix('/v1/api');

    const expressApp = app.getHttpAdapter().getInstance();
    expressApp.get(['/health', '/healthz'], (_req: Request, res: Response) => {
        return res.status(200).json(createHealthCheckResponse());
    });

    if (process.env.OPEN_SWAGGER === 'true') {
        const config = new DocumentBuilder().setTitle('Dior API').setVersion('1.0').addBearerAuth().build();

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

    await app.listen(port, '0.0.0.0');

    Logger.log(`HTTPS Server running on ${port}`);
    Logger.log(`https://dior-crm.choicedx.kr:${port}`);
    Logger.log(`https://dior-crm.chowis.cloud:${port}`);

    if (process.send) {
        process.send('ready');
    }
}

bootstrap();
