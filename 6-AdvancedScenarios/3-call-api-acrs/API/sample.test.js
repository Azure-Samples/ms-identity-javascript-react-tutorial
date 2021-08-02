describe('Sanitize configuration object', () => {
    beforeAll(() => {
        require('dotenv').config();
        global.config = {
            credentials:{
                clientID: process.env.CLIENT_ID,
                clientSecret: process.env.CLIENT_SECRET,
                tenantID: process.env.TENANT_ID,
            }
        };
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

    it('should not contain client secret', () => {
        const regexSecret = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{34,}$/;
        expect(regexSecret.test(config.credentials.clientSecret)).toBe(false);
    });
});