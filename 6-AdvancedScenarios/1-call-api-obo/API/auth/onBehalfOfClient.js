const msal = require('@azure/msal-node');
const config = require('../authConfig');

const msalConfig = {
    auth: {
        clientId: config.credentials.clientID,
        authority: `https://${config.metadata.authority}/${config.credentials.tenantID}`,
        clientSecret: config.credentials.clientSecret,
        clientCapabilities: ['CP1'],
    },
    system: {
        loggerOptions: {
            loggerCallback(loglevel, message, containsPii) {
                console.log(message);
            },
            piiLoggingEnabled: false,
            logLevel: msal.LogLevel.Info,
        },
    },
};

// Create msal application object
const cca = new msal.ConfidentialClientApplication(msalConfig);

const getOboToken = async (oboAssertion) => {
    const oboRequest = {
        oboAssertion: oboAssertion,
        scopes: config.protectedResources.graphApi.scopes
    };

    try {
        const response = await cca.acquireTokenOnBehalfOf(oboRequest);
        return response.accessToken;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    getOboToken,
};