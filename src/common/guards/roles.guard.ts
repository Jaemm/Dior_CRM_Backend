import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ErrorStatus } from '../constants/error-status';
import { ResponseMessages } from '../constants/response-messages';

@Injectable()
export class RolesGuard implements CanActivate {
    IS_PUBLIC_KEY: string = process.env.IS_PUBLIC_KEY;
    ROLES_KEY: string = process.env.ROLES_KEY;
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const roles = this.reflector.get<string[]>(this.ROLES_KEY, context.getHandler());

        const isPublic = this.reflector.getAllAndOverride<boolean>(this.IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic || !roles) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            throw new UnauthorizedException({
                result_code: ErrorStatus.UNAUTHORIZED,
                error: ResponseMessages.Unauthorized,
            });
        }

        if (!user?.role) {
            const url = request.url;
            if (url.includes('customer')) {
                user.role = 'customer';
            } else {
                user.role = 'consultant';
            }
        }

        return this.matchRoles(roles, user.role);
    }

    matchRoles(roles: string[], userRole: string): boolean {
        return roles.some((role) => role === userRole);
    }
}
