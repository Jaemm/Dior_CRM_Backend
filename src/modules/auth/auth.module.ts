import { Module } from '@nestjs/common';
import { JwtService } from 'src/jwt/jwt.service';
import { AuthService } from './auth.service';

@Module({
    imports: [
    ],
    providers: [AuthService, JwtService],

    exports: [AuthService],
})
export class AuthModule {}
