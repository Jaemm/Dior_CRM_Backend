import { Module } from '@nestjs/common';
import { JwtService } from 'src/jwt/jwt.service';
import { AuthService } from './auth.service';
// import { SsoSamlStrategy } from './sso-saml.strategy';

@Module({
    imports: [
        // PassportModule.register({ defaultStrategy: 'jwt' }),
        // JwtModule.register({ secret: process.env.JWT_REFRESH_TOKEN_SECRET, signOptions: { expiresIn: '1d' } }),
        // TypeOrmModule.forFeature([AdminUsers, AdminUserToken]),
    ],
    // providers: [AuthService, JwtService, SsoSamlStrategy],
    providers: [AuthService, JwtService],

    exports: [AuthService],
})
export class AuthModule {}
