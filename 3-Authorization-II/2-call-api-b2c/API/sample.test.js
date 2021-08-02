/**
 * @jest-environment jsdom
 */

const request = require('supertest');

const app = require('./index.js');

describe('Sanitize configuration object', () => {
    beforeAll(() => {
        global.config = require('./config.json');
    });

    it('should define the config object', () => {
        expect(config).toBeDefined();
    });

    it('should contain client Id', () => {
        const regexGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        expect(regexGuid.test(config.credentials.clientID)).toBe(true);
    });

    it('should contain tenant name', () => {
        const regexUri = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;
        expect(regexUri.test(config.credentials.tenantName)).toBe(true);
    });
});

describe('Ensure pages served', () => {

    beforeAll(() => {
        process.env.NODE_ENV = 'test';
    });

    it('should protect hello endpoint', async () => {
        const res = await request(app)
            .get('/hello');

        expect(res.statusCode).toEqual(401);
    });
});