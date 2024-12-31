import { BadRequestException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { SignUpDto } from 'src/common/Dto/auth/signUp.dto';
import { CommonService } from 'src/common/common.service';
import { TokenTypeEnum } from 'src/jwt/enums/auth-token.enum';
import { JwtService } from 'src/jwt/jwt.service';
// import { UserService } from 'src/modules/userAdmin/user/user.service';
import * as argon2 from 'argon2';
import { IAuthResult } from './auth-result.interface';
import { IRefreshToken } from 'src/jwt/interfaces/refresh-token.interface';
import { IMessage } from 'src/common/interfaces/message.interface';
import { ResetPasswordDto, sendTokenDto } from 'src/common/Dto/auth/authToken.dto';
// import { EmailService } from 'src/modules/Email/email.service';
import * as crypto from 'crypto';
import * as Jwt from 'jsonwebtoken';
import * as Saml2Js from 'saml2-js';

@Injectable()
export class AuthService {
    private samlValidator: Saml2Js.ServiceProvider;
    constructor(
        private readonly jwtService: JwtService,
        // private readonly userService: UserService,
        private readonly common: CommonService, // private EmailService: EmailService,
    ) {
        this.samlValidator = new Saml2Js.ServiceProvider({
            entity_id: 'process.env.EMAIL_URL',
            assert_endpoint: 'http://localhost:3000/v1/api/callback', // The callback endpoint for SAML responses
            private_key: null,
            certificate: null,
        });
    }

    /**
     * Validate the SAML Response sent by OKTA
     * @param samlResponse Base64-encoded SAML Response
     * @returns Decoded user information from SAML assertion
     */
    async validateSAMLResponse(samlResponse: string) {
        const identityProvider = new Saml2Js.IdentityProvider({
            sso_login_url: process.env.OKTA_ENTRY_POINT, // OKTA SAML URL
            sso_logout_url: 'https://dev-6xtwqqsv4j2h02u0.us.auth0.com/logout', // OKTA logout URL (or placeholder)
            certificates: process.env.OKTA_CERT,
        });

        return new Promise((resolve, reject) => {
            this.samlValidator.post_assert(
                identityProvider,
                {
                    request_body: {
                        SAMLResponse: samlResponse, // The SAMLResponse is part of the request_body
                    },
                }, // Use 'response' as the property name instead of 'SAMLResponse'
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

        // check black listed token
        // await this.checkIfTokenIsBlacklisted(id, tokenId);
        // const user = await this.userService.getUserById(id);
        const [accessToken, newRefreshToken] = await this.generateAuthTokens(user, domain, tokenId);

        const result: any = {};
        result.accessToken = accessToken;
        result.refreshToken = newRefreshToken;
        return result;
    }

    // private async checkIfTokenIsBlacklisted(
    //     userId: number,
    //     tokenId: string,
    //   ): Promise<void> {
    //     const count = await this.blacklistedTokensRepository.count({
    //       user: userId,
    //       tokenId,
    //     });

    //     if (count > 0) {
    //       throw new UnauthorizedException('Token is invalid');
    //     }
    //   }

    // password recovering
    generateRandomToken(length: number = 32): string {
        // Generate a random token with the specified length
        return crypto.randomBytes(16).toString('hex');
    }

    // async sendPasswordResetEmail(data: sendTokenDto) {
    //     try {
    //         const user_ = await this.userService.getUserByEnail(data.email);
    //         if (!user_) throw new UnauthorizedException('Email does not exist');
    //         // Generate a unique reset token (you can use a library like `crypto-random-string`)

    //         // resetPasswordToken
    //         // resetPasswordSentAt
    //         // const dbHost = process.env.DB_HOST;

    //         const resetToken = this.generateRandomToken();

    //         await this.userService.updateTokenTime(data.email, resetToken);

    //         // Save the token and its expiration date in your database associated with the user's email

    //         // Send an email with a link containing the resetToken
    //         const resetLink = `${process.env.PSW_CHANGE_URL}${resetToken}`;
    //         const emailFile = 'passwordRecover';

    //         const dynamicData = {
    //             link: resetLink,
    //         };

    //         // return await this.EmailService.sendMail(mailOptions);
    //         return await this.EmailService.sendEmail(data.email, 'Password Recovery', emailFile, dynamicData);
    //     } catch (e) {
    //         console.log(e);
    //         throw new Error(e);
    //     }
    // }

    // async sendAccountConfimationEmail(resetToken: string, email: string) {
    //     try {
    //         const user_ = await this.userService.getUserByEnail(email);
    //         if (!user_) throw new UnauthorizedException('Email does not exist');

    //         // Send an email with a link containing the resetToken
    //         const resetLink = `${process.env.PSW_CHANGE_URL}${resetToken}`;
    //         const emailFile = 'emailConfirm';

    //         const dynamicData = {
    //             link: resetLink,
    //         };

    //         return await this.EmailService.sendEmail(email, 'Account Confirmation', emailFile, dynamicData);
    //     } catch (e) {
    //         throw new Error(e);
    //     }
    // }

    // async resendConfirmationEmail(email: string) {
    //     const getUser: any = await this.userService.findByEmail(email);
    //     const confirmationToken = await this.jwtService.generateToken(
    //         getUser,
    //         TokenTypeEnum.CONFIRMATION,
    //         getUser.domain,
    //     );

    //     getUser.adminToken = confirmationToken;

    //     await this.userService.updateAdminToken(getUser.id, confirmationToken);
    //     await this.sendAccountConfimationEmail(confirmationToken, getUser.email);

    //     return this.common.generateMessage('Confirmation was send');
    // }

    // update Token

    isTokenExpired(token: string): any {
        return Jwt.verify(token, process.env.CRM_ACCESS_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    return false;
                } else {
                    return false;
                }
            } else {
                console.log('Token is valid');
                // You can access the decoded information here using the `decoded` variable
                return true;
            }
        });
    }
}
