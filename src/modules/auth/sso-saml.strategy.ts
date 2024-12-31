import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as SamlStrategy, VerifyWithoutRequest } from 'passport-saml';
import * as Saml2Js from 'saml2-js';
@Injectable()
export class SsoSamlStrategy extends PassportStrategy(SamlStrategy, 'saml') {
    constructor() {
        super({
            entryPoint: process.env.OKTA_ENTRY_POINT, // Okta SSO URL from metadata 'https://<okta-domain>/sso/saml'
            issuer: process.env.OKTA_ISSUER, //'urn:your-app', // SP Entity ID
            callbackUrl: process.env.OKTA_CALLBACK_URL,
            cert: process.env.OKTA_CERT, //`<Okta Certificate>`, // Okta-provided certificate
            identifierFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified',
            // privateCert: process.env.PRIVATE_KEY,
            signatureAlgorithm: 'sha256',
            // authnRequestBinding: 'HTTP-Redirect',
            authnContext: [
                'urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport', // Example value
            ],
            passReqToCallback: false,
            // acceptedClockSkewMs: -1,
            // validateInResponseTo: true,
            // disableRequestedAuthnContext: true,
        });
    }

    validate(profile: any, done: Function) {
        try {
            const user = {
                id: profile.nameID,
                email: profile.email,
                app_id: 88,
                firstName: profile.firstName,
                lastName: profile.lastName,
            };
            done(null, user);
        } catch (err) {
            done(err, false);
        }
    }
}

// const config = {
//     authRequired: false,
//     auth0Logout: true,
//     secret: 'a long, randomly-generated string stored in env',
//     baseURL: 'http://localhost:3000',
//     clientID: '5PjVig0QNc4OTOKiwkXWJKzl2EOIjiXE',
//     issuerBaseURL: 'https://dev-6xtwqqsv4j2h02u0.us.auth0.com'
//   };
