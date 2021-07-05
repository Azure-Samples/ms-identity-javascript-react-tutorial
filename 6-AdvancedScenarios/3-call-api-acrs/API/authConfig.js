const authConfig = {
    credentials: {
        tenantID: "Enter_the_Tenant_Info_Here",
        clientID: "Enter_the_Application_Id_Here",
        clientSecret: "Enter_the_Client_Secret_Here",
        redirectUri: "Enter_the_Redirect_Uri_Here"
    },
    metadata: {
        authority: "login.microsoftonline.com",
        discovery: ".well-known/openid-configuration",
        version: "v2.0"
    },
    settings: {
        validateIssuer: true,
        passReqToCallback: false,
        loggingLevel: "info"
    }
}

module.exports = authConfig;



