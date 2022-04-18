const appSettings = {

    appCredentials: {
        clientId: "Enter_the_Application_Id_Here",
        tenantId: "Enter_the_Tenant_Info_Here",
        clientSecret: "Enter_the_Client_Secret_Here",
        redirectUri: "http://localhost:5000/redirect",
        enableSpaAuthorizationCode: true
    },
    protectedRoutes: {
        hello: {
            endpoint: "/hello",
            scopes: ["access_as_user"]
        }
    }
}


module.exports = appSettings;
