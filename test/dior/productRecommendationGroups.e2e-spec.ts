import * as request from 'supertest';
import { consultantLoginData, consultantUpdateData, localURL, rubyURL } from '../utils/data';
import { findMissingFields } from '../utils/helper';

const localUrl = localURL;
const rubyUrl = rubyURL;

let localToken: string;
let rubyToken: string;

describe('Dior - Product Recommendations Groups (e2e)', () => {
    beforeAll(async () => {
        const localResponse = await request(localUrl).post('/consultants/login').send(consultantLoginData);
        const rubyResponse = await request(rubyUrl).post('/consultants/login').send(consultantLoginData);

        rubyToken = rubyResponse.body.token;
        localToken = localResponse.body.token;
    });

    test('dior/product_recommendation_groups/list (GET)', async () => {
        const localResponse = await request(localUrl)
            .get('/dior/product_recommendation_groups/list')
            .auth(localToken, {
                type: 'bearer',
            })
            .send()
            .expect(200);

        const rubyResponse = await request(rubyUrl)
            .get('/dior/product_recommendation_groups/list')
            .set('X-CHOWIS-CONSULTANT-TOKEN', rubyToken)
            .send()
            .expect(200);

        const missingFields = findMissingFields(rubyResponse.body, localResponse.body);
        expect(missingFields).toEqual([]);
    });

    // test('dior/product_recommendation_groups (GET)', async () => {
    //     const localResponse = await request(localUrl)
    //         .get('/dior/product_recommendation_groups')
    //         .auth(localToken, {
    //             type: 'bearer',
    //         })
    //         .send()
    //         .expect(200);

    //     const rubyResponse = await request(rubyUrl)
    //         .get('/dior/product_recommendation_groups')
    //         .set('X-CHOWIS-CONSULTANT-TOKEN', rubyToken)
    //         .send()
    //         .expect(200);

    //     const missingFields = findMissingFields(rubyResponse.body, localResponse.body);
    //     expect(missingFields).toEqual([]);
    // });
});
