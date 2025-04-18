import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt/dist';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';

import { PassportModule } from '@nestjs/passport';
import { JwtService } from 'src/jwt/jwt.service';
import { SsoSamlStrategy } from './sso-saml.strategy';

@Module({
    imports: [
        // PassportModule.register({ defaultStrategy: 'jwt' }),
        // JwtModule.register({ secret: process.env.JWT_REFRESH_TOKEN_SECRET, signOptions: { expiresIn: '1d' } }),
        // TypeOrmModule.forFeature([AdminUsers, AdminUserToken]),
    ],
    providers: [AuthService, JwtService, SsoSamlStrategy],
    exports: [AuthService],
})
export class AuthModule {}
