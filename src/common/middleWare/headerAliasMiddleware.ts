import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class HeaderAliasMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        const map: Record<string, string> = {
            'x-chowis-locale': 'x-locale',
            'x-chowis-token': 'x-token',
            'x-chowis-consultant-token': 'x-consultant-token',
            'x-chowis-app-id': 'x-app-id',
        };

        for (const [oldKey, newKey] of Object.entries(map)) {
            if (!req.headers[oldKey] && req.headers[newKey]) {
                req.headers[oldKey] = String(req.headers[newKey]);
            }
        }

        next();
    }
}

