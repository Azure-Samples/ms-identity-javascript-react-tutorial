const passportConfig = {
    credentials: {
        tenantID: 'Enter_the_Tenant_Info_Here',
        clientID: 'Enter_the_Application_Id_Here',
    },
    metadata: {
        authority: 'login.microsoftonline.com',
        discovery: '.well-known/openid-configuration',
        version: 'v2.0',
    },
    settings: {
        validateIssuer: true,
        passReqToCallback: true,
        loggingLevel: 'info',
        loggingNoPII: false,
    },
    protectedRoutes: {
        todolist: {
            endpoint: '/api',
            delegatedPermissions: {
                read: ['Todolist.Read', 'Todolist.ReadWrite'],
                write: ['Todolist.ReadWrite'],
            }
        },
    },
    accessMatrix: {
        todolist: {
            path: '/todolist',
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            roles: ['TaskUser', 'TaskAdmin'],
        },
        dashboard: {
            path: '/dashboard',
            methods: ['GET'],
            roles: ['TaskAdmin'],
        },
    },
};

module.exports = passportConfig;
