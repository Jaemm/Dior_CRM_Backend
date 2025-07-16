import * as request from 'supertest';
import { consultantLoginData, consultantUpdateData, localURL, rubyURL } from '../utils/data';
import { findMissingFields } from '../utils/helper';

const localUrl = localURL;
const rubyUrl = rubyURL;

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

    test('dior/devices/connect-reset (POST)', async () => {
        const localResponse = await request(localUrl)
            .post('/dior/devices/connect-reset')
            .auth(localToken, {
                type: 'bearer',
            })
            .send({
                device_id: '1580',
            })
            .expect(200);

        const rubyResponse = await request(rubyUrl)
            .post('/dior/devices/connect-reset')
            .set('X-CHOWIS-CONSULTANT-TOKEN', rubyToken)
            .send({
                device_id: '1580',
            })
            .expect(200);

        const missingFields = findMissingFields(rubyResponse.body, localResponse.body);
        expect(missingFields).toEqual([]);
    });
});
