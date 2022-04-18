const msal = require('@azure/msal-node');
const appSettings = require('./appSettings.js');

const msalInstance = new msal.ConfidentialClientApplication({
    auth: {
        clientId: appSettings.appCredentials.clientId,
        authority: `https://login.microsoftonline.com/${appSettings.appCredentials.tenantId}`,
        clientSecret: appSettings.appCredentials.clientSecret
    },
    system: {
        loggerOptions: {
            loggerCallback: (loglevel, message, containsPii) => {
                console.log(message);
            },
            piiLoggingEnabled: false,
            logLevel: msal.LogLevel.Verbose,
        }
    }
});

module.exports = msalInstance;