import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { readFileSync } from 'fs';
import { createSecureContext } from 'tls';

import { AppModule } from './app.module';
import { AppService } from './app.service';

function parseCorsOrigins(): string[] {
    const configuredOrigins = process.env.CORS_ALLOWED_ORIGINS
        ?.split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);

    if (configuredOrigins?.length) {
        return configuredOrigins;
    }

    return [
        'https://dior-crm.choicedx.kr',
        'https://dior-crm.choicedx.kr:8097',
        'https://dior-crm.chowis.cloud',
        'https://dior-crm.chowis.cloud:8097',
        'https://dior-crm.chowis.kr',
        'https://dior-backoffice.chowis.cloud',
        'https://dior-backoffice-env-internal-choicetech.vercel.app',
        'https://*.choicetech.vercel.app',
        'http://localhost:3000',
        'http://localhost:3100',
        'http://localhost:5173',
    ];
}

function matchesAllowedHostname(requestHostname: string, allowedHostname: string): boolean {
    if (allowedHostname.startsWith('*.')) {
        const baseHostname = allowedHostname.slice(2);

        return requestHostname === baseHostname || requestHostname.endsWith(`.${baseHostname}`);
    }

    return requestHostname === allowedHostname;
}

function isAllowedOrigin(origin: string, allowedOrigins: string[]): boolean {
    try {
        const requestUrl = new URL(origin);

        return allowedOrigins.some((allowedOrigin) => {
            try {
                const allowedUrl = new URL(allowedOrigin);

                return matchesAllowedHostname(requestUrl.hostname, allowedUrl.hostname);
            } catch {
                return origin === allowedOrigin;
            }
        });
    } catch {
        return allowedOrigins.includes(origin);
    }
}

async function bootstrap() {
    const HOSTNAME = process.env.HOSTNAME || '0.0.0.0';
    const port = Number(process.env.PORT) || 8097;
    const allowedOrigins = parseCorsOrigins();

    const defaultCert = {
        key: readFileSync('/etc/letsencrypt/live/dior-crm.choicedx.kr/privkey.pem'),
        cert: readFileSync('/etc/letsencrypt/live/dior-crm.choicedx.kr/fullchain.pem'),
    };

    const httpsOptions = {
        ...defaultCert,
        SNICallback: (servername: string, cb: any) => {
            try {
                let context;

                if (servername.includes('choicedx')) {
                    context = createSecureContext({
                        key: readFileSync('/etc/letsencrypt/live/dior-crm.choicedx.kr/privkey.pem'),
                        cert: readFileSync('/etc/letsencrypt/live/dior-crm.choicedx.kr/fullchain.pem'),
                    });
                } else if (servername.includes('chowis')) {
                    context = createSecureContext({
                        key: readFileSync('/etc/letsencrypt/live/dior-crm.chowis.cloud/privkey.pem'),
                        cert: readFileSync('/etc/letsencrypt/live/dior-crm.chowis.cloud/fullchain.pem'),
                    });
                } else {
                    context = createSecureContext(defaultCert);
                }

                cb(null, context);
            } catch (err) {
                console.error('SNI error:', err);
                cb(err);
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

    if (process.env.OPEN_SWAGGER === 'true') {
        const config = new DocumentBuilder()
            .setTitle('Dior User management and Login V1/API')
            .setDescription(
                `<b>CHOICEDX</b>: https://dior-crm.choicedx.kr <br>
                 <b>CHOWIS</b>: https://dior-crm.chowis.kr <br>
                 <b>PORT</b>: https://도메인:8097 <br>`,
            )
            .setVersion('1.0.0')
            .addBearerAuth({
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                name: 'JWT',
                description: 'Enter JWT token',
                in: 'header',
            })
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
                return new BadRequestException(errors.flat(Infinity));
            },
        }),
    );

    app.enableCors({
        origin: (origin, callback) => {
            if (!origin || isAllowedOrigin(origin, allowedOrigins)) {
                return callback(null, true);
            }

            return callback(new Error(`CORS blocked for origin: ${origin}`), false);
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'X-Requested-With',
            'X-CHOWIS-LOCALE',
            'X-CHOWIS-TOKEN',
            'X-CHOWIS-CONSULTANT-TOKEN',
            'X-CHOWIS-APP-ID',
        ],
        exposedHeaders: ['Set-Cookie'],
    });

    await app.listen(port, '0.0.0.0', () => {
        Logger.log(`HTTPS Server running on port ${port}`);
        Logger.log(`https://dior-crm.choicedx.kr:${port}`);
        Logger.log(`https://dior-crm.chowis.kr:${port}`);
    });
}

bootstrap();
