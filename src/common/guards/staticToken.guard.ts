import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class StaticTokenGuard implements CanActivate {
    private readonly staticToken = '';

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const token = request.headers['authorization'];

        return token === this.staticToken;
    }
}
