import * as request from 'supertest';
import { consultantLoginData, consultantUpdateData } from '../utils/data';
import { findMissingFields } from '../utils/helper';
import axios from 'axios';

const localUrl = 'localhost:3100/v1/api';
const rubyUrl = 'https://stg-dior.chowis.cloud/api';

let localToken: string;
let rubyToken: string;

describe('Dior - Devices Module (e2e)', () => {
    beforeAll(async () => {
        const localResponse = await request(localUrl).post('/consultants/login').send(consultantLoginData);
        const rubyResponse = await request(rubyUrl).post('/consultants/login').send(consultantLoginData);

        rubyToken = rubyResponse.body.token;
        localToken = localResponse.body.token;
    });

    test('dior/devices (GET)', async () => {
        const localResponse = await request(localUrl)
            .get('/dior/devices?search=FAB01920')
            .auth(localToken, {
                type: 'bearer',
            })
            .send()
            .expect(200);

        const rubyResponse = await request(rubyUrl)
            .get('/dior/devices?search=FAB01920')
            .set('X-CHOWIS-CONSULTANT-TOKEN', rubyToken)
            .send()
            .expect(200);

        const missingFields = findMissingFields(rubyResponse.body, localResponse.body);
        expect(missingFields).toEqual([]);
    });
});
