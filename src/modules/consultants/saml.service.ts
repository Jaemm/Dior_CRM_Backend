import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { resolve } from 'path';
import * as saml from 'samlify';
import { parseStringPromise } from 'xml2js';

dotenv.config();

saml.setSchemaValidator({
    validate: () => Promise.resolve('skipped'),
});

@Injectable()
export class SamlService {
    private readonly certPath = process.env.SAML_IDP_CERT_PATH;

    constructor() {
        console.log('[SAML] SAML_IDP_CERT_PATH:', this.certPath);

        if (!this.certPath) {
            throw new Error('[SAML] SAML_IDP_CERT_PATH is undefined');
        }

        const resolvedPath = resolve(this.certPath);
        console.log('[SAML] Resolved Path:', resolvedPath);

        const fileExists = fs.existsSync(resolvedPath);
        console.log('[SAML] File exists:', fileExists);

        if (!fileExists) {
            throw new Error(`[SAML] Cert file not found at ${resolvedPath}`);
        }

        const certContent = fs.readFileSync(resolvedPath, 'utf-8');
        console.log('[SAML] Cert content preview:', certContent.slice(0, 100));

        this.idp = saml.IdentityProvider({
            entityID: process.env.SAML_IDP_ENTITY_ID,
            singleSignOnService: [
                {
                    Binding: saml.Constants.namespace.binding.redirect,
                    Location: process.env.SAML_IDP_SSO_URL,
                },
            ],
            signingCert: certContent,
        });
    }

    private sp = saml.ServiceProvider({
        entityID: process.env.SAML_SP_ENTITY_ID,
        assertionConsumerService: [
            {
                Binding: saml.Constants.namespace.binding.post,
                Location: process.env.SAML_SP_ACS_URL,
            },
        ],
    });

    private idp;

    getSsoLoginUrl(): string {
        return this.idp.entityMeta.getSingleSignOnService('redirect') as string;
    }

    async extractEmailFromSaml(samlResponse: string): Promise<string> {
        const decoded = Buffer.from(samlResponse, 'base64').toString('utf-8');
        const parsed = await parseStringPromise(decoded, { explicitArray: false });

        const assertion = parsed?.['saml2p:Response']?.['saml2:Assertion'];
        const attributes = assertion?.['saml2:AttributeStatement']?.['saml2:Attribute'];
        const subject = assertion?.['saml2:Subject'];
        const rawNameID = subject?.['saml2:NameID'];
        const nameID = typeof rawNameID === 'string' ? rawNameID : rawNameID?._;

        const attributeMap: Record<string, string> = {};
        if (Array.isArray(attributes)) {
            for (const attr of attributes) {
            attributeMap[attr.$.Name] = attr['saml2:AttributeValue'];
            }
        } else if (attributes) {
            attributeMap[attributes.$.Name] = attributes['saml2:AttributeValue'];
        }

        const email =
            attributeMap['email'] ||
            attributeMap['mail'] ||
            nameID;

        if (!email) {
            console.log('decoded XML:', decoded);
            console.log('nameID:', nameID);
            console.log('attributeMap:', attributeMap);
            throw new Error('No email in SAML response');
        }

        console.log('[SAML] 입력된 이메일:', email);
        return email;
    }

}
