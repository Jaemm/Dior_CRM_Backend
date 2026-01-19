import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { IAccessPayload, IAccessToken } from './interfaces/access-token.interface';
import { IEmailPayload, IEmailToken } from './interfaces/email-token.interface';
import { IRefreshPayload, IRefreshToken } from './interfaces/refresh-token.interface';
import * as Jwt from 'jsonwebtoken';

import { ConfigService } from '@nestjs/config';
import { IJwt } from 'src/config/interfaces/jwt.interfaces';
import { TokenTypeEnum } from './enums/auth-token.enum';
import { CommonService } from 'src/common/common.service';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';
import { ErrorStatus } from '../common/constants/error-status';
import { ResponseMessages } from '../common/constants/response-messages';

@Injectable()
export class JwtService {
    private readonly jwtConfig: IJwt;
    private readonly issuer: string;
    private readonly domain: string;
    constructor(private readonly configService: ConfigService, private readonly commonService: CommonService) {
        this.jwtConfig = this.configService.get<IJwt>('jwt');
        this.issuer = this.configService.get<string>('APP_ID');
        this.domain = this.configService.get<string>('DOMAIN');
    }

    private async generateRS256Token(
        payload: any,
        privateKey: string,
        jwtOptions: Jwt.SignOptions,
        expiresIn: number,
    ): Promise<string> {
        return this.commonService.throwDuplicateError(
            JwtService.generateTokenAsync(payload, privateKey, {
                ...jwtOptions,
                expiresIn,
                algorithm: 'RS256',
            }),
        );
    }

    private static async generateTokenAsync(
        payload: IAccessPayload | IEmailPayload | IRefreshPayload,
        secret: string,
        options: Jwt.SignOptions,
    ): Promise<string> {
        return new Promise((resolve, rejects) => {
            Jwt.sign(payload, secret, options, (error, token) => {
                if (error) {
                    rejects(error);
                    return;
                }
                resolve(token);
            });
        });
    }

    private static async verifyTokenAsync<T>(token: string, secret: string, options: Jwt.VerifyOptions): Promise<T> {
        return new Promise((resolve, rejects) => {
            Jwt.verify(token, secret, options, (error, payload: T) => {
                if (error) {
                    rejects(error);
                    return;
                }
                resolve(payload);
            });
        });
    }

    public async generateToken(
        user: any,
        tokenType: TokenTypeEnum,
        domain: string | null,
        tokenId?: string,
    ): Promise<string> {
        const jwtOptions: Jwt.SignOptions = {
            issuer: this.issuer,
            subject: user.email,
            audience: domain ?? this.domain,
            algorithm: 'HS256',
        };
        const payload: any = { id: user.id };

        switch (tokenType) {
            case TokenTypeEnum.ACCESS:
                const { secret: tokenAccess, time: accessTime } = this.jwtConfig.access;

                const accessToken = await this.commonService.throwDuplicateError(
                    JwtService.generateTokenAsync({ id: user.id.toString(), role: user.role }, tokenAccess, {
                        ...jwtOptions,
                        expiresIn: accessTime,
                    }),
                );
                return accessToken;

            case TokenTypeEnum.REFRESH:
                const { secret: refreshSecret, time: refreshTime } = this.jwtConfig.refresh;
                return this.commonService.throwInternalError(
                    JwtService.generateTokenAsync(
                        {
                            id: user.id.toString(),
                            role: user.role,
                            tokenId: tokenId ?? uuidv4(),
                        },
                        refreshSecret,
                        {
                            ...jwtOptions,
                            expiresIn: refreshTime,
                        },
                    ),
                );
            case TokenTypeEnum.CONFIRMATION:
            case TokenTypeEnum.RESET_PASSWORD:
                const { secret, time } = this.configService.get<IJwt>('jwt')[tokenType];
                return this.commonService.throwInternalError(
                    JwtService.generateTokenAsync({ id: user.id.toString(), role: user.role }, secret, {
                        ...jwtOptions,
                        expiresIn: time,
                    }),
                );
        }
    }

    private static async throwBadRequest<T extends IAccessToken | IRefreshToken | IEmailToken>(
        promise: Promise<T>,
    ): Promise<T> {
        try {
            return await promise;
        } catch (error) {
            if (error instanceof Jwt.TokenExpiredError) {
                throw new UnauthorizedException({
                    result_code: ErrorStatus.UNAUTHORIZED,
                    error: ResponseMessages.TokenExpired,
                });
            }
            if (error instanceof Jwt.JsonWebTokenError) {
                throw new UnauthorizedException({
                    result_code: ErrorStatus.UNAUTHORIZED,
                    error: ResponseMessages.InvalidToken,
                });
            }
            throw new InternalServerErrorException({ result_code: ErrorStatus.SERVER_ERROR, error: error });
        }
    }

    public async verifyToken<T extends IAccessToken | IRefreshToken | IEmailToken>(
        token: string,
        tokenType: TokenTypeEnum,
    ): Promise<T> {
        const jwtOptions: Jwt.VerifyOptions = {
            issuer: this.issuer,
            audience: new RegExp(this.domain),
        };
        switch (tokenType) {
            case TokenTypeEnum.ACCESS:
                const { secret: secret_, time: accessTime } = this.jwtConfig.access;

                return JwtService.throwBadRequest(
                    JwtService.verifyTokenAsync(token, secret_, {
                        ...jwtOptions,
                        maxAge: accessTime,
                    }),
                );
            case TokenTypeEnum.REFRESH:
            case TokenTypeEnum.CONFIRMATION:
            case TokenTypeEnum.RESET_PASSWORD:
                const { secret, time } = this.jwtConfig[tokenType];
                return JwtService.throwBadRequest(
                    JwtService.verifyTokenAsync(token, secret, {
                        ...jwtOptions,
                        maxAge: time,
                    }),
                );
        }
    }

    getTokenFromRequest(req: Request) {
        let token;
        if (req.headers['X-CONSULTANT-TOKEN']) {
            token = String(req.headers['X-CONSULTANT-TOKEN']);
        } else if (req.headers['X-TOKEN']) {
            token = String(req.headers['X-TOKEN']);
        } else {
            if (req.headers.authorization) {
                token = req.headers.authorization.split(' ')[1];
            }
        }
        return token;
    }
}
