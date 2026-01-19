import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { AppService } from './app.service';
import * as fs from 'fs';
import * as tls from 'tls';

async function bootstrap() {
    const SSL = process.env.SSL;
    const HOSTNAME = process.env.HOSTNAME;

    let httpsOptions: any = null;

    if (SSL === 'true') {
        /* ===== 기본 인증서 (chowis) ===== */
        const chowisKey = fs.readFileSync(process.env.CHOWIS_SSL_KEY_PATH!);
        const chowisCert = fs.readFileSync(process.env.CHOWIS_SSL_CERT_PATH!);

        /* ===== 추가 인증서 (choicedx) ===== */
        const choicedxKey = fs.readFileSync(process.env.CHOICEDX_SSL_KEY_PATH!);
        const choicedxCert = fs.readFileSync(process.env.CHOICEDX_SSL_CERT_PATH!);

        const chowisContext = tls.createSecureContext({
            key: chowisKey,
            cert: chowisCert,
        });

        const choicedxContext = tls.createSecureContext({
            key: choicedxKey,
            cert: choicedxCert,
        });

        httpsOptions = {
            // fallback 필수
            key: chowisKey,
            cert: chowisCert,

            SNICallback: (servername: string, cb: Function) => {
                if (servername === 'dior-crm.choicedx.kr') {
                    cb(null, choicedxContext);
                } else {
                    cb(null, chowisContext);
                }
            },
        };
    }

    const app = await NestFactory.create(AppModule, {
        httpsOptions,
        rawBody: true,
        logger: ['log', 'error', 'warn', 'debug', 'verbose'],
    });

    const appService = app.get(AppService);
    appService.handleApp(app);

    const port = Number(process.env.PORT) || 8081;

    app.setGlobalPrefix('/v1/api');

    const enableSwagger = process.env.OPEN_SWAGGER;
    if (enableSwagger === 'true') {
        const config = new DocumentBuilder()
            .setTitle('Dior User management and Login V1/API')
            .setDescription(
                `<b>STAGING</b>: https://stg-dior.choicedx.kr <br>
                 <b>CHOWIS</b>: https://crm-dior.chowis.cloud <br>
                 <b>CHOICETECH</b>: https://stg-dior.choicedx.kr <br>`,
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
        SwaggerModule.setup('docs', app, document);
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

    app.enableCors();

    await app.listen(port, () => {
        const protocol = SSL === 'true' ? 'https' : 'http';
        Logger.log(`Listening at ${protocol}://${HOSTNAME}:${port}`);
    });
}

bootstrap();
