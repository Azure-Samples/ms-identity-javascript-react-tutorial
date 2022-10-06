/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

const msal = require('@azure/msal-node');
const graph = require('@microsoft/microsoft-graph-client');

const { getGraphClient } = require('../utils/graphClient');
const { requestHasRequiredAttributes } = require("./permissionUtils");

const config = require('../authConfig');

const msalConfig = {
    auth: {
        clientId: config.credentials.clientID,
        authority: `https://${config.metadata.authority}/${config.credentials.tenantID}`,
        clientSecret: config.credentials.clientSecret,
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
        scopes: config.protectedResources.graphAPI.scopes,
    };

    try {
        const response = await cca.acquireTokenOnBehalfOf(oboRequest);
        return response.accessToken;
    } catch (error) {
        console.log(error);
        return error;
    }
};

const handleOverage = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const accessToken = authHeader.split(' ')[1];
    const groups = [];

    try {
        const oboToken = await getOboToken(accessToken);
        
        // Get a graph client instance for the given access token
        const graphClient = getGraphClient(oboToken);

        // Makes request to fetch mails list. Which is expected to have multiple pages of data.
        let response = await graphClient.api(config.protectedResources.graphAPI.endpoint).get();
        
        // A callback function to be called for every item in the collection. This call back should return boolean indicating whether not to continue the iteration process.
        let callback = (data) => {
            groups.push(data.id);
            return true;
        };
        
        // Creating a new page iterator instance with client a graph client instance, page collection response from request and callback
        let pageIterator = new graph.PageIterator(graphClient, response, callback);
        
        // This iterates the collection until the nextLink is drained out.
        await pageIterator.iterate();

        res.locals.groups = groups;
        return checkAccess(req, res, next);
    } catch (error) {
        console.log(error);
    }
};

const checkAccess = (req, res, next) => {
    if (!requestHasRequiredAttributes(config.accessMatrix, req.path, req.method, res.locals.groups)) {
        return res.status(403).json({ error: 'User does not have the group, method or path' });
    }
    next();
};

module.exports = handleOverage;
