import { ConfigModule } from '@nestjs/config';
import { readFileSync } from 'fs';
import Joi from 'joi';
import { join } from 'path';

// const publicKey = readFileSync(join(__dirname, '..', '..', 'tokenKeys/public.pem'), 'utf-8');
// const privateKey = readFileSync(join(__dirname, '..', '..', 'tokenKeys/private.pem'), 'utf-8');
export default () => ({
    jwt: {
        access: {
            // publicKey,
            // privateKey,
            // secret: process.env.JWT_ACCESS_TOKEN_SECRET,
            secret: process.env.CRM_ACCESS_TOKEN_SECRET,
            time: parseInt(process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME, 10),
        },
        confirmation: {
            secret: process.env.JWT_CONFIRMATION_SECRET,
            time: parseInt(process.env.JWT_CONFIRMATION_TIME, 10),
        },
        resetPassword: {
            secret: process.env.JWT_RESET_PASSWORD_SECRET,
            time: parseInt(process.env.JWT_RESET_PASSWORD_TIME, 10),
        },
        refresh: {
            secret: process.env.JWT_REFRESH_TOKEN_SECRET,
            time: parseInt(process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME, 10),
        },
    },
});
