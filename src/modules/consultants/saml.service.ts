import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { resolve } from 'path';
import * as saml from 'samlify';
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
        const parsed = await this.sp.parseLoginResponse(this.idp, 'post', {
            body: { SAMLResponse: samlResponse },
        });
        const email = parsed.extract.attributes?.email;
        if (!email) throw new Error('No email in SAML response');
        return email.toLowerCase();
    }
}
