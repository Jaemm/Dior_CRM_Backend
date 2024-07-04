import * as request from 'supertest';
import { findMissingFields } from '../utils/helper';
import {
    customerLoginData,
    customerRegisterData,
    customerRubyRegisterData,
    customerUpdateData,
    localURL,
    rubyURL,
} from '../utils/data';

describe('Customers Module (e2e)', () => {
    const user = {
        rubyToken: '',
        localToken: '',
        localTokenId: 0,
        rubyTokenId: 0,
    };
    it('/customer/login (POST)', async () => {
        const localResponse = await request(localURL).post('/customers/login').send(customerLoginData).expect(200);
        const rubyResponse = await request(rubyURL).post('/customers/login').send(customerLoginData).expect(200);

        user.rubyToken = rubyResponse.body.token;
        user.localToken = localResponse.body.token;
        user.localTokenId = localResponse.body.id;
        user.rubyTokenId = rubyResponse.body.id;

        const missingFields = findMissingFields(rubyResponse.body, localResponse.body);
        expect(missingFields).toEqual([]);
    }, 50000);

    it('/customers/update (PUT)', async () => {
        const localResponse = await request(localURL)
            .put('/customers/update')
            .set('X-CHOWIS-TOKEN', user.localToken)
            .send(customerUpdateData)
            .expect(200);
        const rubyResponse = await request(rubyURL)
            .put('/customers/update')
            .set('X-CHOWIS-TOKEN', user.rubyToken)
            .send(customerUpdateData)
            .expect(200);

        const missingFields = findMissingFields(rubyResponse.body, localResponse.body);
        expect(missingFields).toEqual([]);
    }, 50000);

    it('/customers/me GET', async () => {
        const localResponse = await request(localURL)
            .get('/customers/me')
            .set('X-CHOWIS-TOKEN', user.localToken)
            .expect(200);

        const rubyResponse = await request(rubyURL)
            .get('/customers/me')
            .set('X-CHOWIS-TOKEN', user.rubyToken)
            .expect(200);

        const missingFields = findMissingFields(rubyResponse.body, localResponse.body);
        expect(missingFields).toEqual([]);
    }, 50000);

    it('/customers/logout POST', async () => {
        const localResponse = await request(localURL)
            .post('/customers/logout')
            .set('X-CHOWIS-TOKEN', user.localToken)
            .expect(200);

        const loginResponse = await request(rubyURL).post('/customers/login').send(customerLoginData).expect(200);
        user.rubyToken = loginResponse.body.token;

        const rubyResponse = await request(rubyURL)
            .post('/logout')
            .set('X-CHOWIS-TOKEN', user.rubyToken)
            .set('X-CHOWIS-LOCALE', 'en')
            .expect(200); //

        const missingFields = findMissingFields(rubyResponse.body, localResponse.body);
        expect(missingFields).toEqual([]);
    }, 50000);

    // it('/customers/products/enter POST', async () => {}, 50000);

    it('/customers/register POST', async () => {
        const localResponse = await request(localURL)
            .post('/customers/register')
            .send(customerRegisterData)
            .expect(200);
        const rubyResponse = await request(rubyURL)
            .post('/customers/register')
            .send(customerRubyRegisterData)
            .expect(200);

        const missingFields = findMissingFields(rubyResponse.body, localResponse.body);
        expect(missingFields).toEqual([]);
    }, 50000);
});
