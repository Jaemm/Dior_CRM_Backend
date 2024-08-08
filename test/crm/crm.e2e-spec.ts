import * as request from 'supertest';
import { consultantLoginData, consultantUpdateData } from '../utils/data';
import { findMissingFields } from '../utils/helper';
import axios from 'axios';

const localUrl = 'localhost:3100/v1/api';
const rubyUrl = 'https://stg-dior.chowis.cloud/api';

let localToken: string;
let rubyToken: string;

describe('CRM Module (e2e)', () => {
    beforeAll(async () => {
        const localResponse = await request(localUrl).post('/consultants/login').send(consultantLoginData);
        const rubyResponse = await request(rubyUrl).post('/consultants/login').send(consultantLoginData);

        rubyToken = rubyResponse.body.token;
        localToken = localResponse.body.token;
    });

    test('crm/customers (GET)', async () => {
        const localResponse = await request(localUrl)
            .get('/crm/customers')
            .auth(localToken, {
                type: 'bearer',
            })
            .send()
            .expect(200);

        const rubyResponse = await request(rubyUrl)
            .get('/crm/customers')
            .set('X-CHOWIS-CONSULTANT-TOKEN', rubyToken)
            .send()
            .expect(200);

        const missingFields = findMissingFields(rubyResponse.body, localResponse.body);
        expect(missingFields).toEqual([]);
    });

    test('crm/customers/:id (GET)', async () => {
        const localResponse = await request(localUrl)
            .get('/crm/customers/117458')
            .auth(localToken, {
                type: 'bearer',
            })
            .send()
            .expect(200);

        const rubyResponse = await request(rubyUrl)
            .get('/crm/customers/117458')
            .set('X-CHOWIS-CONSULTANT-TOKEN', rubyToken)
            .send()
            .expect(200);

        const missingFields = findMissingFields(rubyResponse.body, localResponse.body);
        expect(missingFields).toEqual([]);
    });

    test('crm/customers/get_by_email (GET)', async () => {
        const localResponse = await request(localUrl)
            .get('/crm/customers/get_by_email?email=test%2B123%40chowis.com')
            .auth(localToken, {
                type: 'bearer',
            })
            .send()
            .expect(200);

        const rubyResponse = await request(rubyUrl)
            .get('/crm/customers/get_by_email?email=test%2B123%40chowis.com')
            .set('X-CHOWIS-CONSULTANT-TOKEN', rubyToken)
            .send()
            .expect(200);

        const missingFields = findMissingFields(rubyResponse.body, localResponse.body);
        expect(missingFields).toEqual([]);
    });
});
