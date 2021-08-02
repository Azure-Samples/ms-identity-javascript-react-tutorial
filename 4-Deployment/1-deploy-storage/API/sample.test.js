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

    it('should not contain client Id', () => {
        const regexGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        expect(regexGuid.test(config.credentials.clientID)).toBe(false);
    });

    it('should not contain tenant Id', () => {
        const regexGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        expect(regexGuid.test(config.credentials.tenantID)).toBe(false);
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