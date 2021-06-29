const authConfig = {
    credentials: {
        tenantID: "cbaf2168-de14-4c72-9d88-f5f05366dbef",
        clientID: "7d9f32a3-5a06-4183-9aa0-da01bc2928f6",
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
    },
    protectedRoutes: {
        todolist: {
            endpoint: "/api",
            scopes: ["access_as_user"]
        }
    },
    accessMatrix: {
        todolist: {
            path: "/todolist",
            methods: ["DELETE"],
            claims: "c1"
        },
    }
}

module.exports = authConfig;