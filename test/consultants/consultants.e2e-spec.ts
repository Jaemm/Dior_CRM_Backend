import * as request from 'supertest';
import {
    consultantLoginData,
    consultantRegisterData,
    consultantRubyRegisterData,
    consultantUpdateData,
    localURL,
    rubyURL,
} from '../utils/data';
import { findMissingFields } from '../utils/helper';

describe('Consultant Module (e2e)', () => {
    const user = {
        rubyToken: '',
        localToken: '',
    };
    it('/consultants/login (POST)', async () => {
        const localResponse = await request(localURL).post('/consultants/login').send(consultantLoginData).expect(200);
        const rubyResponse = await request(rubyURL)
            .post('/consultants/login')
            .send({ email: 'paul@chowistest.com', password: 'Production2024@', app_id: 44 })
            .expect(200);

        user.rubyToken = rubyResponse.body.token;
        user.localToken = localResponse.body.token;

        const missingFields = findMissingFields(rubyResponse.body, localResponse.body);
        expect(missingFields).toEqual([]);
    }, 50000);

    it('/consultants/update (PUT)', async () => {
        const localResponse = await request(localURL)
            .put('/consultants/update')
            .set('X-CHOWIS-CONSULTANT-TOKEN', user.localToken)
            .send(consultantUpdateData)
            .expect(200);
        const rubyResponse = await request(rubyURL)
            .put('/consultants/update')
            .set('X-CHOWIS-CONSULTANT-TOKEN', user.rubyToken)
            .send(consultantUpdateData)
            .expect(200);

        const missingFields = findMissingFields(rubyResponse.body, localResponse.body);
        expect(missingFields).toEqual([]);
    }, 50000);

    it('/consultants/me GET', async () => {
        const localResponse = await request(localURL)
            .get('/consultants/me')
            .set('X-CHOWIS-CONSULTANT-TOKEN', user.localToken)
            .expect(200);
        const rubyResponse = await request(rubyURL)
            .get('/consultants/me')
            .set('X-CHOWIS-CONSULTANT-TOKEN', user.rubyToken)
            .expect(200);

        const missingFields = findMissingFields(rubyResponse.body, localResponse.body);
        expect(missingFields).toEqual([]);
    }, 50000);

    // it('/consultants/products/enter POST', async () => {}, 50000);

    it('/consultants/register POST', async () => {
        const localResponse = await request(localURL)
            .post('/consultants/register')
            .send(consultantRegisterData)
            .expect(200);
        const rubyResponse = await request(rubyURL)
            .post('/consultants/register')
            .send(consultantRubyRegisterData)
            .expect(200);

        const missingFields = findMissingFields(rubyResponse.body, localResponse.body);
        expect(missingFields).toEqual([]);
    }, 50000);

    it('/consultants/logout POST', async () => {
        const localResponse = await request(localURL)
            .post('/consultants/logout')
            .set('X-CHOWIS-CONSULTANT-TOKEN', user.localToken)
            .expect(200);

        const loginResponse = await request(rubyURL).post('/consultants/login').send(consultantLoginData).expect(200);
        user.rubyToken = loginResponse.body.token;

        const rubyResponse = await request(rubyURL)
            .post('/consultants/logout')
            .set('X-CHOWIS-CONSULTANT-TOKEN', user.rubyToken)
            .expect(200);

        user.localToken = '';
        user.rubyToken = '';

        const missingFields = findMissingFields(rubyResponse.body, localResponse.body);
        expect(missingFields).toEqual([]);
    }, 50000);
});
