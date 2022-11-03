const request = require('supertest');

const app = require('./app.js');

describe('Sanitize configuration object', () => {
    beforeAll(() => {
        global.config = require('./authConfig.js');
    });

    it('should define the config object', () => {
        expect(config).toBeDefined();
    });

    it('should contain client Id', () => {
        const regexGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        expect(regexGuid.test(config.credentials.clientID)).toBe(true);
    });

    it('should not contain tenant Id', () => {
        const regexGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        expect(regexGuid.test(config.credentials.tenantId)).toBe(false);
    });
});

describe('Ensure routes served', () => {
    beforeAll(() => {
        process.env.NODE_ENV = 'test';
    });

    it('should protect todolist endpoint', async () => {
        const res = await request(app).get('/api');

        expect(res.statusCode).toEqual(401);
    });
});