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
            .send()
            .expect(200);

        const rubyResponse = await request(rubyUrl)
            .get('/consultants/me')
            .set('X-CHOWIS-CONSULTANT-TOKEN', rubyToken)
            .send()
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

    test('consultants/request_callback_url (POST)', async () => {
        const localResponse = await request(localUrl)
            .post('/consultants/request_callback_url')
            .auth(localToken, {
                type: 'bearer',
            })
            .send({
                batch_ids: [
                    {
                        analysis_type: 'CNDP Skin',
                        batch_id: 43818,
                    },
                ],
            })
            .expect(200);

        const rubyResponse = await request(rubyUrl)
            .post('/consultants/request_callback_url')
            .set('X-CHOWIS-CONSULTANT-TOKEN', rubyToken)
            .send({
                batch_ids: [
                    {
                        analysis_type: 'CNDP Skin',
                        batch_id: 43818,
                    },
                ],
            })
            .expect(200);

        const missingFields = findMissingFields(rubyResponse.body, localResponse.body);
        expect(missingFields).toEqual([]);
    }, 50000);

    test('consultants/products/enter (POST)', async () => {
        const localResponse = await request(localUrl)
            .post('/consultants/products/enter')
            .auth(localToken, {
                type: 'bearer',
            })
            .send({
                optic_number: 'FC101490',
                password: 'CH7950',
                application_id: 88,
                mac_address: 'CNDV3UC-N4-00010',
                first_use_date: '2022-02-02',
                lat: '37.564',
                lng: '26.6963',
            })
            .expect(200);

        const rubyResponse = await request(rubyUrl)
            .post('/consultants/products/enter')
            .set('X-CHOWIS-CONSULTANT-TOKEN', rubyToken)
            .send({
                optic_number: 'FC101490',
                password: 'CH7950',
                application_id: 88,
                mac_address: 'CNDV3UC-N4-00010',
                first_use_date: '2022-02-02',
                lat: '37.564',
                lng: '26.6963',
            })
            .expect(200);

        const missingFields = findMissingFields(rubyResponse.body, localResponse.body);
        expect(missingFields).toEqual([]);
    });

    test('consultants/notifications (GET)', async () => {
        const localResponse = await request(localUrl)
            .get('/consultants/notifications')
            .auth(localToken, {
                type: 'bearer',
            })
            .send()
            .expect(200);

        const rubyResponse = await request(rubyUrl)
            .get('/consultants/notifications')
            .set('X-CHOWIS-CONSULTANT-TOKEN', rubyToken)
            .send()
            .expect(200);

        const missingFields = findMissingFields(rubyResponse.body, localResponse.body);
        expect(missingFields).toEqual([]);
    });

    test('consultants/product_recommendations (GET)', async () => {
        const localResponse = await request(localUrl)
            .get('/consultants/product_recommendations')
            .auth(localToken, {
                type: 'bearer',
            })
            .send()
            .expect(200);

        const rubyResponse = await request(rubyUrl)
            .get('/consultants/product_recommendations')
            .set('X-CHOWIS-CONSULTANT-TOKEN', rubyToken)
            .send()
            .expect(200);

        const missingFields = findMissingFields(rubyResponse.body, localResponse.body);
        expect(missingFields).toEqual([]);
    });

    test('consultants/health_tips (GET)', async () => {
        const localResponse = await request(localUrl)
            .get('/consultants/health_tips')
            .auth(localToken, {
                type: 'bearer',
            })
            .send()
            .expect(200);

        const rubyResponse = await request(rubyUrl)
            .get('/consultants/health_tips')
            .set('X-CHOWIS-CONSULTANT-TOKEN', rubyToken)
            .send()
            .expect(200);

        const missingFields = findMissingFields(rubyResponse.body, localResponse.body);
        expect(missingFields).toEqual([]);
    });

    test('consultants/by_company?company_id=213&app_id=88 (GET)', async () => {
        const localResponse = await request(localUrl)
            .get('/consultants/health_tips/by_company?company_id=213&app_id=88')
            .auth(localToken, {
                type: 'bearer',
            })
            .send()
            .expect(200);

        const rubyResponse = await request(rubyUrl)
            .get('/consultants/health_tips/by_company?company_id=213&app_id=88')
            .set('X-CHOWIS-CONSULTANT-TOKEN', rubyToken)
            .send()
            .expect(200);

        const missingFields = findMissingFields(rubyResponse.body, localResponse.body);
        expect(missingFields).toEqual([]);
    });

    test('consultants/login/social (POST)', async () => {
        const localResponse = await request(localUrl)
            .post('/consultants/login/social')
            .auth(localToken, {
                type: 'bearer',
            })
            .send({
                app_id: 88,
                email: 'e2e_test@chowistest.com',
                social_provider: 'twitter',
                social_id: 'abc1234',
            })
            .expect(200);

        const rubyResponse = await request(rubyUrl)
            .post('/consultants/login/social')
            .set('X-CHOWIS-CONSULTANT-TOKEN', rubyToken)
            .send({
                app_id: 88,
                email: 'e2e_test@chowistest.com',
                social_provider: 'twitter',
                social_id: 'abc1234',
            })
            .expect(200);

        const missingFields = findMissingFields(rubyResponse.body, localResponse.body);
        expect(missingFields).toEqual([]);
    });

    test('consultants/fetch_sales_connection (GET)', async () => {
        const localResponse = await request(localUrl)
            .get('/consultants/fetch_sales_connection')
            .auth(localToken, {
                type: 'bearer',
            })
            .send()
            .expect(200);

        const rubyResponse = await request(rubyUrl)
            .get('/consultants/fetch_sales_connection')
            .set('X-CHOWIS-CONSULTANT-TOKEN', rubyToken)
            .send()
            .expect(200);

        const missingFields = findMissingFields(rubyResponse.body, localResponse.body);
        expect(missingFields).toEqual([]);
    });
});
