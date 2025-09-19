import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';
import * as Jwt from 'jsonwebtoken';
import * as Saml2Js from 'saml2-js';
import { CommonService } from 'src/common/common.service';
import { TokenTypeEnum } from 'src/jwt/enums/auth-token.enum';
import { IRefreshToken } from 'src/jwt/interfaces/refresh-token.interface';
import { JwtService } from 'src/jwt/jwt.service';
import { parseStringPromise } from 'xml2js';
import { IAuthResult } from './auth-result.interface';

@Injectable()
export class AuthService {
    private samlValidator: Saml2Js.ServiceProvider;

    constructor(private readonly jwtService: JwtService, private readonly common: CommonService) {
        this.samlValidator = new Saml2Js.ServiceProvider({
            entity_id: process.env.ENTITY_ID,
            assert_endpoint: process.env.OKTA_CALLBACK_URL,
            private_key: '',
            certificate: process.env.OKTA_SINGING_CERTIFICATE,
            allow_unencrypted_assertion: true,
        });
    }

    private async loadIdpMetadata(metadataUrl: string) {
        const response = await axios.get(metadataUrl);
        const xml = response.data;

        const parsed = await parseStringPromise(xml);
        const descriptor = parsed.EntityDescriptor.IDPSSODescriptor[0];

        const ssoLoginUrl = descriptor.SingleSignOnService.find((s: any) => s.$.Binding.includes('HTTP-Redirect')).$
            .Location;

        const certificates = descriptor.KeyDescriptor.map(
            (key: any) => key.KeyInfo[0].X509Data[0].X509Certificate[0],
        ).map((cert: string) => `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----`);

        return {
            ssoLoginUrl,
            certificates,
            issuer: parsed.EntityDescriptor.$.entityID,
        };
    }

    async validateSAMLResponse(samlResponse: string) {
        const metadata = await this.loadIdpMetadata(process.env.OKTA_METADATA_URL);

        const identityProvider = new Saml2Js.IdentityProvider({
            sso_login_url: metadata.ssoLoginUrl,
            sso_logout_url: process.env.OKTA_SIGNOUT_URL || '',
            certificates: metadata.certificates,
            // want_assertions_encrypted: false,
        });

        return new Promise((resolve, reject) => {
            this.samlValidator.post_assert(
                identityProvider,
                {
                    request_body: {
                        SAMLResponse: samlResponse,
                    },
                },
                (error, response) => {
                    if (error) return reject(error);
                    resolve(response);
                },
            );
        });
    }

    async loginWithUsernameAndPassword(username: string, password: string) {
        if (username === 'test@example.com' && password === 'password123') {
            return { id: 1, username, token: 'mock-jwt-token' };
        }
        throw new Error('Invalid username or password');
    }

    async generateAuthTokens(user: any, domain?: string, tokenId?: string): Promise<[string, string]> {
        return Promise.all([
            this.jwtService.generateToken(user, TokenTypeEnum.ACCESS, domain, tokenId),
            this.jwtService.generateToken(user, TokenTypeEnum.REFRESH, domain, tokenId),
        ]);
    }

    async refreshTokenAccess(user: any, refreshToken: string, domain: string): Promise<IAuthResult> {
        const { id, tokenId } = await this.jwtService.verifyToken<IRefreshToken>(refreshToken, TokenTypeEnum.REFRESH);
        const [accessToken, newRefreshToken] = await this.generateAuthTokens(user, domain, tokenId);

        return {
            user,
            accessToken,
            refreshToken: newRefreshToken,
        };
    }

    generateRandomToken(length = 32): string {
        return crypto.randomBytes(length).toString('hex');
    }

    isTokenExpired(token: string): boolean {
        try {
            Jwt.verify(token, process.env.CRM_ACCESS_TOKEN_SECRET);
            return false;
        } catch (err) {
            return true;
        }
    }
}
