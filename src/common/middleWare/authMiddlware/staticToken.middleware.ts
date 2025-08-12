import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class StaticTokenMiddleware implements NestMiddleware {
    private readonly staticToken = process.env.staticToken;
    private readonly secretKey = process.env.CRM_ACCESS_TOKEN_SECRET;

    use(req: Request, res: Response, next: NextFunction) {
        let token = req.headers.authorization?.split(' ')[1] ?? '';
        if (req.headers['x-chowis-consultant-token']) {
            token = String(req.headers['x-chowis-consultant-token']) ?? '';
        } else if (req.headers['x-chowis-token']) {
            token = String(req.headers['x-chowis-token']);
        } else {
            if (req?.headers?.authorization) {
                token = req.headers?.authorization.split(' ')[1];
            }
        }
        if (token !== this.staticToken) {
            throw new UnauthorizedException('Invalid static token');
        }

        next();
    }
}
