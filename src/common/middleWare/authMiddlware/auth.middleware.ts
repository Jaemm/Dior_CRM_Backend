import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { ErrorStatus } from '../../constants/error-status';
import { ResponseMessages } from '../../constants/response-messages';
import { CommonService } from '../../common.service';
@Injectable()
export class AuthMiddleware implements NestMiddleware {
    private readonly secretKey = process.env.CRM_ACCESS_TOKEN_SECRET;
    private readonly jwtSecret = process.env.JWT_ACCESS_TOKEN_SECRET;

    constructor(private readonly commonService: CommonService) {}

    use(req: Request, res: Response, next: NextFunction) {
        let token;

        let locale = 'en';
        if (req.headers['x-chowis-locale']) {
            locale = String(req.headers['x-chowis-locale']);
        }

        if (req.headers['x-chowis-consultant-token']) {
            token = String(req.headers['x-chowis-consultant-token']);
        } else if (req.headers['x-chowis-token']) {
            token = String(req.headers['x-chowis-token']);
        } else {
            if (req.headers.authorization) {
                token = req.headers.authorization.split(' ')[1];
            }
        }

        if (!token) {
            throw new UnauthorizedException({
                result_code: ErrorStatus.UNAUTHORIZED,
                error: this.commonService.createLocaleErrorMessage(locale, 'unauthorized'),
            });
        }

        try {
            const decoded = jwt.verify(token, this.secretKey);

            req['user'] = decoded;


            if (!(<{ id: string }>req.user).id) {
                (<{ id: string }>req.user).id = (<{ consultant_id: string }>req.user).consultant_id;
            }
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
                error: this.commonService.createLocaleErrorMessage(locale, 'unauthorized'),
            });
        }
    }
}
