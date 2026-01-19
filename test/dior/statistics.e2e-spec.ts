import * as request from 'supertest';
import { consultantLoginData, consultantUpdateData, localURL, rubyURL } from '../utils/data';
import { findMissingFields } from '../utils/helper';

const localUrl = localURL;
const rubyUrl = rubyURL;

let localToken: string;
let rubyToken: string;

describe('Dior - Statistics Module (e2e)', () => {
    beforeAll(async () => {
        const localResponse = await request(localUrl).post('/consultants/login').send(consultantLoginData);
        const rubyResponse = await request(rubyUrl).post('/consultants/login').send(consultantLoginData);

        rubyToken = rubyResponse.body.token;
        localToken = localResponse.body.token;
    });

    test('dior/statistics/overall (GET)', async () => {
        const localResponse = await request(localUrl)
            .get('/dior/statistics/overall')
            .auth(localToken, {
                type: 'bearer',
            })
            .send()
            .expect(200);

        const rubyResponse = await request(rubyUrl)
            .get('/dior/statistics/overall')
            .set('X-CHOWIS-CONSULTANT-TOKEN', rubyToken)
            .send()
            .expect(200);

        const missingFields = findMissingFields(rubyResponse.body, localResponse.body);
        expect(missingFields).toEqual([]);
    });

    test('dior/statistics/overall_details (GET)', async () => {
        const localResponse = await request(localUrl)
            .get('/dior/statistics/overall_details')
            .auth(localToken, {
                type: 'bearer',
            })
            .send()
            .expect(200);

        const rubyResponse = await request(rubyUrl)
            .get('/dior/statistics/overall_details')
            .set('X-CHOWIS-CONSULTANT-TOKEN', rubyToken)
            .send()
            .expect(200);

        const missingFields = findMissingFields(rubyResponse.body, localResponse.body);
        expect(missingFields).toEqual([]);
    }, 30000);

    test('dior/statistics/overall_per_country (GET)', async () => {
        const localResponse = await request(localUrl)
            .get('/dior/statistics/overall_per_country')
            .auth(localToken, {
                type: 'bearer',
            })
            .send()
            .expect(200);

        const rubyResponse = await request(rubyUrl)
            .get('/dior/statistics/overall_per_country')
            .set('X-CHOWIS-CONSULTANT-TOKEN', rubyToken)
            .send()
            .expect(200);

        const missingFields = findMissingFields(rubyResponse.body, localResponse.body);
        expect(missingFields).toEqual([]);
    }, 30000);

    test('dior/statistics/overall_by_date (GET)', async () => {
        const localResponse = await request(localUrl)
            .get('/dior/statistics/overall_by_date')
            .auth(localToken, {
                type: 'bearer',
            })
            .send()
            .expect(200);

        const rubyResponse = await request(rubyUrl)
            .get('/dior/statistics/overall_by_date')
            .set('X-CHOWIS-CONSULTANT-TOKEN', rubyToken)
            .send()
            .expect(200);

        const missingFields = findMissingFields(rubyResponse.body, localResponse.body);
        expect(missingFields).toEqual([]);
    }, 30000);

    test('dior/statistics/overall_by_date (GET)', async () => {
        const localResponse = await request(localUrl)
            .get('/dior/statistics/overall_by_date')
            .auth(localToken, {
                type: 'bearer',
            })
            .send()
            .expect(200);

        const rubyResponse = await request(rubyUrl)
            .get('/dior/statistics/overall_by_date')
            .set('X-CHOWIS-CONSULTANT-TOKEN', rubyToken)
            .send()
            .expect(200);

        const missingFields = findMissingFields(rubyResponse.body, localResponse.body);
        expect(missingFields).toEqual([]);
    }, 30000);

    test('dior/statistics/stat_details (GET)', async () => {
        const localResponse = await request(localUrl)
            .get('/dior/statistics/stat_details?stat_type=consultations')
            .auth(localToken, {
                type: 'bearer',
            })
            .send()
            .expect(200);

        const rubyResponse = await request(rubyUrl)
            .get('/dior/statistics/stat_details?stat_type=consultations')
            .set('X-CHOWIS-CONSULTANT-TOKEN', rubyToken)
            .send()
            .expect(200);

        const missingFields = findMissingFields(rubyResponse.body, localResponse.body);
        expect(missingFields).toEqual([]);
    }, 30000);

    test('dior/statistics/infograph_stat_details (GET)', async () => {
        const localResponse = await request(localUrl)
            .get('/dior/statistics/infograph_stat_details?stat_type=stores')
            .auth(localToken, {
                type: 'bearer',
            })
            .send()
            .expect(200);

        const rubyResponse = await request(rubyUrl)
            .get('/dior/statistics/infograph_stat_details?stat_type=stores')
            .set('X-CHOWIS-CONSULTANT-TOKEN', rubyToken)
            .send()
            .expect(200);

        const missingFields = findMissingFields(rubyResponse.body, localResponse.body);
        expect(missingFields).toEqual([]);
    }, 30000);

    test('dior/statistics/get_stat_details_country_wise (GET)', async () => {
        const localResponse = await request(localUrl)
            .get('/dior/statistics/get_stat_details_country_wise?stat_type=stores&country_name=Japan')
            .auth(localToken, {
                type: 'bearer',
            })
            .send()
            .expect(200);

        const rubyResponse = await request(rubyUrl)
            .get('/dior/statistics/get_stat_details_country_wise?stat_type=stores&country_name=Japan')
            .set('X-CHOWIS-CONSULTANT-TOKEN', rubyToken)
            .send()
            .expect(200);

        const missingFields = findMissingFields(rubyResponse.body, localResponse.body);
        expect(missingFields).toEqual([]);
    }, 30000);
});
