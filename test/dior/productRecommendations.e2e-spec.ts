import * as request from 'supertest';
import { consultantLoginData, consultantUpdateData } from '../utils/data';
import { findMissingFields } from '../utils/helper';
import axios from 'axios';

const localUrl = 'localhost:3100/v1/api';
const rubyUrl = 'https://stg-dior.chowis.cloud/api';

let localToken: string;
let rubyToken: string;

describe('Dior - Product Recommendations Module (e2e)', () => {
    beforeAll(async () => {
        const localResponse = await request(localUrl).post('/consultants/login').send(consultantLoginData);
        const rubyResponse = await request(rubyUrl).post('/consultants/login').send(consultantLoginData);

        rubyToken = rubyResponse.body.token;
        localToken = localResponse.body.token;
    });

    // test('dior/product_recommendations (GET)', async () => {
    //     const localResponse = await request(localUrl)
    //         .get('/dior/product_recommendations')
    //         .auth(localToken, {
    //             type: 'bearer',
    //         })
    //         .send()
    //         .expect(200);

    //     const rubyResponse = await request(rubyUrl)
    //         .get('/dior/product_recommendations')
    //         .set('X-CHOWIS-CONSULTANT-TOKEN', rubyToken)
    //         .send()
    //         .expect(200);

    //     const missingFields = findMissingFields(rubyResponse.body, localResponse.body);
    //     expect(missingFields).toEqual([]);
    // });

    test('dior/product_recommendations/get_automatic_product_by_batch_id (GET)', async () => {
        const localResponse = await request(localUrl)
            .get(
                '/dior/product_recommendations/get_automatic_product_by_batch_id?answers=B%2CC%2CB%2CA%2CB%2CB&batch_id=69950&market=Korea&routine_recommendation=5&skin_tone=0.5N',
            )
            .auth(localToken, {
                type: 'bearer',
            })
            .send()
            .expect(200);

        const rubyResponse = await request(rubyUrl)
            .get(
                '/dior/product_recommendations/get_automatic_product_by_batch_id?answers=B%2CC%2CB%2CA%2CB%2CB&batch_id=69950&market=Korea&routine_recommendation=5&skin_tone=0.5N',
            )
            .set('X-CHOWIS-CONSULTANT-TOKEN', rubyToken)
            .send()
            .expect(200);

        const missingFields = findMissingFields(rubyResponse.body, localResponse.body);
        expect(missingFields).toEqual([]);
    });

    test('dior/product_recommendations/get_new_automatic_product_by_batch_id (GET)', async () => {
        const localResponse = await request(localUrl)
            .get(
                '/dior/product_recommendations/get_new_automatic_product_by_batch_id?answers=B%2CC%2CB%2CA%2CB%2CB&batch_id=69950&market=Korea&routine_recommendation=5&skin_tone=0.5N',
            )
            .auth(localToken, {
                type: 'bearer',
            })
            .send()
            .expect(200);

        const rubyResponse = await request(rubyUrl)
            .get(
                '/dior/product_recommendations/get_new_automatic_product_by_batch_id?answers=B%2CC%2CB%2CA%2CB%2CB&batch_id=69950&market=Korea&routine_recommendation=5&skin_tone=0.5N',
            )
            .set('X-CHOWIS-CONSULTANT-TOKEN', rubyToken)
            .send()
            .expect(200);

        const missingFields = findMissingFields(rubyResponse.body, localResponse.body);
        expect(missingFields).toEqual([]);
    });

    test('dior/product_recommendations/:id (GET)', async () => {
        const localResponse = await request(localUrl)
            .get('/dior/product_recommendations/864')
            .auth(localToken, {
                type: 'bearer',
            })
            .send()
            .expect(200);

        const rubyResponse = await request(rubyUrl)
            .get('/dior/product_recommendations/864')
            .set('X-CHOWIS-CONSULTANT-TOKEN', rubyToken)
            .send()
            .expect(200);

        const missingFields = findMissingFields(rubyResponse.body, localResponse.body);
        expect(missingFields).toEqual([]);
    });

    // test('dior/product_recommendations/get_category (GET)', async () => {
    //     const localResponse = await request(localUrl)
    //         .get('/dior/product_recommendations/get_category?routine=Skincare')
    //         .auth(localToken, {
    //             type: 'bearer',
    //         })
    //         .send()
    //         .expect(200);

    //     const rubyResponse = await request(rubyUrl)
    //         .get('/dior/product_recommendations/get_category?routine=Skincare')
    //         .set('X-CHOWIS-CONSULTANT-TOKEN', rubyToken)
    //         .send()
    //         .expect(200);

    //     const missingFields = findMissingFields(rubyResponse.body, localResponse.body);
    //     expect(missingFields).toEqual([]);
    // });

    // test('dior/product_recommendations/get_collection (GET)', async () => {
    //     const localResponse = await request(localUrl)
    //         .get('/dior/product_recommendations/get_collection?routine=Skincare')
    //         .auth(localToken, {
    //             type: 'bearer',
    //         })
    //         .send()
    //         .expect(200);

    //     const rubyResponse = await request(rubyUrl)
    //         .get('/dior/product_recommendations/get_collection?routine=Skincare')
    //         .set('X-CHOWIS-CONSULTANT-TOKEN', rubyToken)
    //         .send()
    //         .expect(200);

    //     const missingFields = findMissingFields(rubyResponse.body, localResponse.body);
    //     expect(missingFields).toEqual([]);
    // });
});
