import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as fs from 'fs';

async function bootstrap() {
    const SSL = process.env.SSL;
    const HOSTNAME = process.env.HOSTNAME;
    const isSSL = process.env.SSL === 'true';

    let httpsOptions = null;

    if (isSSL) {
        const keyPath = process.env.SSL_KEY_PATH || '';
        const certPath = process.env.SSL_CERT_PATH || '';

        httpsOptions = {
            key: fs.readFileSync(keyPath),
            cert: fs.readFileSync(certPath),
        };
    }
    const app = await NestFactory.create(AppModule, {
        httpsOptions,
        rawBody: true,
        logger: ['log', 'error', 'warn', 'debug', 'verbose'],
    });

    const port = Number(process.env.PORT) || 3100;
    console.log(`Configured Port: ${port}`);

    app.setGlobalPrefix('/v1/api');

    const enableSwagger = process.env.OPEN_SWAGGER;
    if (enableSwagger === 'true') {
        const config = new DocumentBuilder()
            .setTitle('Chowis User management and Login V1/API')
            .setDescription('Chowis User management and Login V1/API')
            .setDescription(`<b>Stagging</b>: https://staging.chowis.cloud:8083/v1/api <br>`)
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

    app.enableCors();

    // await app.listen(port);

    await app.listen(port, async () => {
        const protocol = SSL === 'true' ? 'https' : 'http';
        const address = protocol + '://' + (SSL === 'true' ? HOSTNAME : '0.0.0.0') + ':' + port;
        Logger.log('Listening at ' + address);
    });

    console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
