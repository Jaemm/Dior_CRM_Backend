import * as request from 'supertest';
import { consultantLoginData, consultantUpdateData } from '../utils/data';
import { findMissingFields } from '../utils/helper';

const localUrl = 'localhost:3100/v1/api';
const rubyUrl = 'https://stg-dior.chowis.cloud/api';

if (!localUrl || !rubyUrl) {
    throw new Error();
}

let localToken: string;
let rubyToken: string;

beforeAll(async () => {});

describe('Consultants Module ( E2E )', () => {
    test('consultant/login (POST)', async () => {
        const localResponse = await request(localUrl).post('/consultants/login').send(consultantLoginData).expect(200);

        const rubyResponse = await request(rubyUrl).post('/consultants/login').send(consultantLoginData).expect(200);

        rubyToken = rubyResponse.body.token;
        localToken = localResponse.body.token;

        expect(rubyToken).toBeTruthy();
        expect(localToken).toBeTruthy();

        const missingFields = findMissingFields(rubyResponse.body, localResponse.body);
        expect(missingFields).toEqual([]);
    });

    test('consultants/me (GET)', async () => {
        const localResponse = await request(localUrl)
            .get('/consultants/me')
            .auth(localToken, {
                type: 'bearer',
            })
            .send(consultantLoginData)
            .expect(200);

        const rubyResponse = await request(rubyUrl)
            .get('/consultants/me')
            .set('X-CHOWIS-CONSULTANT-TOKEN', rubyToken)
            .send(consultantLoginData)
            .expect(200);

        const missingFields = findMissingFields(rubyResponse.body, localResponse.body);
        expect(missingFields).toEqual([]);
    });

    test('consultants/update (PUT)', async () => {
        const localResponse = await request(localUrl)
            .put('/consultants/update')
            .auth(localToken, {
                type: 'bearer',
            })
            .send(consultantUpdateData)
            .expect(200);
        const rubyResponse = await request(rubyUrl)
            .put('/consultants/update')
            .set('X-CHOWIS-CONSULTANT-TOKEN', rubyToken)
            .send(consultantUpdateData)
            .expect(200);

        const missingFields = findMissingFields(rubyResponse.body, localResponse.body);
        expect(missingFields).toEqual([]);
    });
});
