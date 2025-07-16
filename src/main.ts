import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { AppService } from './app.service';

async function bootstrap() {
    const SSL = process.env.SSL;
    const HOSTNAME = process.env.HOSTNAME;

    const httpsOptions = null;
    const app = await NestFactory.create(AppModule, {
        httpsOptions,
        rawBody: true,
        logger: ['log', 'error', 'warn', 'debug', 'verbose'],
    });
    const appService = app.get(AppService);
    appService.handleApp(app);

    const port = Number(process.env.PORT) || 8081;
    console.log(`Configured Port: ${port}`);

    app.setGlobalPrefix('/v1/api');
    const enableSwagger = process.env.OPEN_SWAGGER;
    if (enableSwagger === 'true') {
        const config = new DocumentBuilder()
            .setTitle('Dior User management and Login V1/API')
            .setDescription('Dior User management and Login V1/API')
            .setDescription(
                `<b>Production</b>: https://crm-dior.chowis.cloud <br>
                <b>Stagging</b>: https://stg-dior.chowis.cloud <br>
               `,
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
                console.error(e);
                const errors = e.map((err) => {
                    return Object.values(err.constraints);
                });

                return new BadRequestException(errors.flat(Infinity));
            },
        }),
    );

    app.enableCors();

    await app.listen(port, async () => {
        const protocol = SSL === 'true' ? 'https' : 'http';
        const address = protocol + '://' + (SSL === 'true' ? HOSTNAME : '0.0.0.0') + ':' + port;
        Logger.log('Listening at ' + address);
    });

    console.log(`Application is running on: ${await app.getUrl()}`);
}
//
bootstrap();
