import * as request from 'supertest';
import { consultantLoginData, consultantUpdateData, localURL, rubyURL } from '../utils/data';
import { findMissingFields } from '../utils/helper';

const localUrl = localURL;
const rubyUrl = rubyURL;

let localToken: string;
let rubyToken: string;

describe('Dior - Company Consultants (e2e)', () => {
    beforeAll(async () => {
        const localResponse = await request(localUrl).post('/consultants/login').send(consultantLoginData);
        const rubyResponse = await request(rubyUrl).post('/consultants/login').send(consultantLoginData);

        rubyToken = rubyResponse.body.token;
        localToken = localResponse.body.token;
    });

    test('dior/company_consultants (GET)', async () => {
        const localResponse = await request(localUrl)
            .get('/dior/company_consultants')
            .auth(localToken, {
                type: 'bearer',
            })
            .send()
            .expect(200);

        const rubyResponse = await request(rubyUrl)
            .get('/dior/company_consultants')
            .set('X-CHOWIS-CONSULTANT-TOKEN', rubyToken)
            .send()
            .expect(200);

        const missingFields = findMissingFields(rubyResponse.body, localResponse.body);
        expect(missingFields).toEqual([]);
    });
});
