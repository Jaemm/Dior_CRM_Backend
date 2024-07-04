import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { json } from 'body-parser';

async function bootstrap() {
    const SSL = process.env.SSL;
    const HOSTNAME = process.env.HOSTNAME;

    let httpsOptions = null;

    const app = await NestFactory.create(AppModule, {
        httpsOptions,
        rawBody: true,
        snapshot: true,
        logger: ['log', 'error', 'warn', 'debug', 'verbose'],
    });

    const port = Number(process.env.PORT) || 3100;

    app.setGlobalPrefix('/v1/api');

    const enableSwagger = process.env.OPEN_SWAGGER;
    if (enableSwagger === 'true') {
        const config = new DocumentBuilder()
            .setTitle('Chowis User management and Login V1/API')
            .setDescription('Chowis User management and Login V1/API')
            .setDescription(
                `<b>Production</b>: https://crm.chowis.cloud/v1/api <br>
                <b>Stagging</b>: https://crm-staging.chowis.cloud/v1/api <br>
                <b>China</b>: https://crm.chowis.cn/v1/api`,
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

    app.use(json({ limit: '50mb' }));

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            exceptionFactory: (e) => {
                console.error(e);
                const errors = e.map((err) => {
                    return Object.values(err.constraints);
                });

                return new BadRequestException(errors.flat(Infinity));
            },
        }),
    );

    app.enableCors();
    await app.listen(port, () => {
        const protocol = SSL === 'true' ? 'https' : 'http';
        const address = protocol + '://' + (SSL === 'true' ? HOSTNAME : '0.0.0.0') + ':' + port;
        Logger.log('Listening at ' + address);
    });
}

bootstrap();
