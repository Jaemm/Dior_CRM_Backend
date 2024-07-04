import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { ErrorStatus } from '../../constants/error-status';
import { ResponseMessages } from '../../constants/response-messages';
@Injectable()
export class AuthMiddleware implements NestMiddleware {
    private readonly secretKey = process.env.CRM_ACCESS_TOKEN_SECRET;
    private readonly jwtSecret = process.env.JWT_ACCESS_TOKEN_SECRET;

    use(req: Request, res: Response, next: NextFunction) {
        // const token = String(req.headers['authorization'])
        let token;

        if (req.headers['x-chowis-consultant-token']) {
            token = String(req.headers['x-chowis-consultant-token']);
        } else if (req.headers['x-chowis-token']) {
            token = String(req.headers['x-chowis-token']);
        } else {
            // Extract the token from the Authorization header if present
            if (req.headers.authorization) {
                token = req.headers.authorization.split(' ')[1];
            }
        }

        if (!token) {
            // Token not provided, handle accordingly (e.g., return unauthorized response)
            throw new UnauthorizedException({
                result_code: ErrorStatus.UNAUTHORIZED,
                error: ResponseMessages.Unauthorized,
            });
        }
        try {
            const decoded = jwt.verify(token, this.secretKey);
            // const decoded = jwt.verify(token, this.secretKey, {ignoreExpiration: true});

            req['user'] = decoded;

            console.log(decoded);

            // return decoded;
            // Do further verification or processing if needed
            next();
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(ErrorStatus.TOKEN_EXPIRED).send({
                    status: 10000,
                    type: 'TokenExpiredError',
                    message: {
                        en: ResponseMessages.TokenExpired,
                    },
                });
            } else if (err.name === 'JsonWebTokenError') {
                return res.status(ErrorStatus.JSON_WEBTOKEN_ERROR).send({
                    status: 10001,
                    type: 'JsonWebTokenError',
                    message: {
                        en: ResponseMessages.InvalidToken,
                    },
                });
            } else if (err.name === 'NotBeforeError') {
                return res.status(401).send({
                    status: 10003,
                    type: 'JsonWebTokenError',
                    message: {
                        en: err.message,
                    },
                });
            }
            throw new UnauthorizedException({
                result_code: ErrorStatus.UNAUTHORIZED,
                error: ResponseMessages.Unauthorized,
            });
        }
    }
}
