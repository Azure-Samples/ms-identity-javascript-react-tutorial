const passportConfig = {
    credentials: {
        tenantName: 'fabrikamb2c.onmicrosoft.com',
        clientID: 'e29ac359-6a90-4f9e-b31c-8f64e1ac20cb',
    },
    policies: {
        policyName: 'B2C_1_susi_v2',
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
        passReqToCallback: true,
        loggingLevel: 'info',
        loggingNoPII: false,
    },
    protectedRoutes: {
        todolist: {
            endpoint: '/api/todolist',
            delegatedPermissions: {
                read: ['ToDoList.Read', 'ToDoList.ReadWrite'],
                write: ['ToDoList.ReadWrite'],
            },
        },
    },
};

module.exports = passportConfig;

