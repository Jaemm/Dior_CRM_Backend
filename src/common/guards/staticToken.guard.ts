import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class StaticTokenGuard implements CanActivate {
    private readonly staticToken = ''; // process.env.staticToken; // Replace with your static token

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const token = request.headers['authorization']; // Assuming token is sent in the Authorization header

        // Check if the token matches the static token
        return token === this.staticToken;
    }
}
