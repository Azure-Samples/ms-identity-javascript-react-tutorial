const passportConfig = {
    credentials: {
        tenantName: 'fabrikamb2c.onmicrosoft.com',
        clientID: 'e29ac359-6a90-4f9e-b31c-8f64e1ac20cb',
    },
    policies: {
        policyName: 'B2C_1_susi',
    },
    metadata: {
        b2cDomain: 'fabrikamb2c.b2clogin.com',
        authority: 'login.microsoftonline.com',
        discovery: '.well-known/openid-configuration',
        version: 'v2.0',
    },
    settings: {
        isB2C: true,
        validateIssuer: false,
        passReqToCallback: false,
        loggingLevel: 'info',
    },
    protectedRoutes: {
        todolist: {
            endpoint: '/api/todolist',
            delegatedPermissions: {
                read: ['Todolist.Read'],
                write: ['Todolist.ReadWrite'],
            },
        },
    },
};

module.exports = passportConfig;

