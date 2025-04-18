// import { Injectable } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import { Strategy as SamlStrategy, VerifyWithoutRequest } from 'passport-saml';
// import * as Saml2Js from 'saml2-js';
// @Injectable()
// export class SsoSamlStrategy extends PassportStrategy(SamlStrategy, 'saml') {
//     constructor() {
//         super({
//             entryPoint: process.env.OKTA_SIGNON_URL, // Okta SSO URL from metadata 'https://<okta-domain>/sso/saml'
//             issuer: process.env.OKTA_ISSUER, //'urn:your-app', // SP Entity ID
//             callbackUrl: process.env.OKTA_CALLBACK_URL,
//             cert: process.env.OKTA_SINGING_CERTIFICATE, //`<Okta Certificate>`, // Okta-provided certificate
//             identifierFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified',
//             // privateCert: process.env.PRIVATE_KEY,
//             signatureAlgorithm: 'sha256',
//             // authnRequestBinding: 'HTTP-Redirect',
//             authnContext: [
//                 'urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport', // Example value
//             ],
//             passReqToCallback: false,
//             // acceptedClockSkewMs: -1,
//             // validateInResponseTo: true,
//             // disableRequestedAuthnContext: true,
//         });
//     }

//     validate(profile: any, done: Function) {
//         try {
//             const user = {
//                 id: profile.nameID,
//                 email: profile.email,
//                 app_id: 88,
//                 firstName: profile.firstName,
//                 lastName: profile.lastName,
//             };
//             done(null, user);
//         } catch (err) {
//             done(err, false);
//         }
//     }
// }

// // const config = {
// //     authRequired: false,
// //     auth0Logout: true,
// //     secret: 'a long, randomly-generated string stored in env',
// //     baseURL: 'http://localhost:3000',
// //     clientID: '5PjVig0QNc4OTOKiwkXWJKzl2EOIjiXE',
// //     issuerBaseURL: 'https://dev-6xtwqqsv4j2h02u0.us.auth0.com'
// //   };
// import { Injectable } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import { Strategy as SamlStrategy } from 'passport-saml';
// import * as fs from 'fs';
// import * as path from 'path';

// @Injectable()
// export class SsoSamlStrategy extends PassportStrategy(SamlStrategy, 'saml') {
//     constructor() {
//         super({
//             entryPoint: process.env.OKTA_SIGNON_URL || 'https://example.okta.com/sso/saml',
//             issuer: process.env.OKTA_ISSUER || 'urn:your-app',
//             callbackUrl: process.env.OKTA_CALLBACK_URL || 'http://localhost:3000/auth/saml/callback',
//             cert: fs.readFileSync(path.join(__dirname, process.env.SSO_CERT_PATH), 'utf-8'),
//             identifierFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified',
//             signatureAlgorithm: 'sha256',
//             authnContext: ['urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport'],
//             passReqToCallback: false,
//             validateInResponseTo: true,
//             acceptedClockSkewMs: -1,
//         });
//     }

//     validate(profile: any, done: Function) {
//         try {
//             const user = {
//                 id: profile.nameID,
//                 email: profile?.attributes?.email || '',
//                 app_id: 88,
//                 firstName: profile?.attributes?.firstName || '',
//                 lastName: profile?.attributes?.lastName || '',
//             };
//             done(null, user);
//         } catch (err) {
//             done(err, false);
//         }
//     }
// }
