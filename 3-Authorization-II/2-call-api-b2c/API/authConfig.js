const passportConfig = {
    credentials: {
        tenantName: 'pasopoc.onmicrosoft.com',
        clientID: 'eb9ff10a-3fa2-4989-96a1-0cbaebb85bfb',
    },
    policies: {
        policyName: 'B2C_1_paso_susi',
    },
    metadata: {
        b2cDomain: 'pasopoc.b2clogin.com',
        authority: 'login.microsoftonline.com',
        discovery: '.well-known/openid-configuration',
        version: 'v2.0',
    },
    settings: {
        isB2C: true,
        validateIssuer: false,
        passReqToCallback: true,
        loggingLevel: 'info',
        loggingNoPII: false,
    },
    protectedRoutes: {
        todolist: {
            endpoint: '/api/todolist',
            delegatedPermissions: {
                read: ['tasks.read'],
                write: ['tasks.write'],
            },
        },
    },
};

module.exports = passportConfig;

