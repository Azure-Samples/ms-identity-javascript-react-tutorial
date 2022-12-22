const authConfig = {
    credentials: {
        tenantID: 'Enter_the_Tenant_Id_Here',
        clientID: 'Enter_the_Application_Id_Here',
        clientSecret: 'Enter_the_Client_Secret_Here',
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
        loggingNoPII: true,
    },
    protectedRoutes: {
        profile: {
            endpoint: '/api/profile',
            delegatedPermissions: {
                scopes: ['access_graph_on_behalf_of_user'],
            },
        },
    },
    protectedResources: {
        graphApi: {
            endpoint: 'https://graph.microsoft.com/v1.0',
            scopes: ['User.Read', 'offline_access'],
        }
    },
};

module.exports = authConfig;
