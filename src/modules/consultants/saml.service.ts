import * as saml from 'samlify';
import * as fs from 'fs';
import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class SamlService {
    private sp = saml.ServiceProvider({
        entityID: process.env.SAML_SP_ENTITY_ID,
        assertionConsumerService: [
            {
                Binding: saml.Constants.namespace.binding.post,
                Location: process.env.SAML_SP_ACS_URL,
            },
        ],
    });

    private idp = saml.IdentityProvider({
        entityID: process.env.SAML_IDP_ENTITY_ID,
        singleSignOnService: [
            {
                Binding: saml.Constants.namespace.binding.redirect,
                Location: process.env.SAML_IDP_SSO_URL,
            },
        ],
        signingCert: fs.readFileSync(process.env.SAML_IDP_CERT_PATH, 'utf-8'),
    });

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
