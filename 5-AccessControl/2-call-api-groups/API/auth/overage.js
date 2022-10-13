/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

const msal = require('@azure/msal-node');

const { getFilteredGroups } = require('../utils/graphClient');
const { requestHasRequiredAttributes } = require("./permissionUtils");

const config = require('../authConfig.json');

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

    try {
        const oboToken = await getOboToken(accessToken);
        res.locals.groups = await getFilteredGroups(oboToken, config.accessMatrix.todolist.groups);
        return checkAccess(req, res, next);
    } catch (error) {
        console.log(error);
        next(error);
    }
};

const checkAccess = (req, res, next) => {
    if (!requestHasRequiredAttributes(config.accessMatrix, req.path, req.method, res.locals.groups)) {
        return res.status(403).json({ error: 'User does not have the group, method or path' });
    }
    next();
};

module.exports = handleOverage;
