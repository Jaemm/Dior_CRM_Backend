import * as request from 'supertest';
import { localURL, rubyURL } from './utils/data';

describe('Test Main Routes', () => {
    it('APIs routes', async () => {
        await request(rubyURL).get('/').expect(200);
        await request(localURL).get('/health').expect(200);
    }, 50000);
});
