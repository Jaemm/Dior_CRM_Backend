import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { AppService } from './app.service';

async function bootstrap() {
    const HOSTNAME = process.env.HOSTNAME;
    const port = Number(process.env.PORT) || 8081;

    const app = await NestFactory.create(AppModule, {
        rawBody: true,
        logger: ['log', 'error', 'warn', 'debug', 'verbose'],
    });

    const appService = app.get(AppService);
    appService.handleApp(app);

    app.setGlobalPrefix('/v1/api');

    // swagger
    if (process.env.OPEN_SWAGGER === 'true') {
        const config = new DocumentBuilder()
            .setTitle('Dior User management and Login V1/API')
            .setDescription(
                `<b>STAGING</b>: https://dior-staging.choicedx.kr <br>
                 <b>PROD</b>: https://dior-crm.choicedx.kr <br>`,
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

        // prefix 고려
        SwaggerModule.setup('/docs', app, document);
    }

    // middleware
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
        Logger.log(`Listening at http://${HOSTNAME}:${port}`);
    });
}

bootstrap();
