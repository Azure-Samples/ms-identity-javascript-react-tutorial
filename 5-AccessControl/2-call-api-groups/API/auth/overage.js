/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

const msal = require('@azure/msal-node');

const { hasRequiredGroups } = require("./permissionUtils");
const { getFilteredGroups } = require('../utils/graphClient');

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

const handleOverage = async (req, res, next, cacheProvider) => {
    const authHeader = req.headers.authorization;
    const accessToken = authHeader.split(' ')[1];

    const { oid } = req.authInfo;

    // check if the user has an entry in the cache
    if (cacheProvider.has(oid)) {
        const { groups, sourceTokenId } = cacheProvider.get(oid);

        if (sourceTokenId === accessToken['uti']) {
            res.locals.groups = groups;
            return checkAccess(req, res, next);
        }
    }

    try {
        const oboToken = await getOboToken(accessToken);
        res.locals.groups = await getFilteredGroups(oboToken, config.accessMatrix.todolist.groups);

        // cache the groups and the source token id
        cacheProvider.set(oid, {
            groups: res.locals.groups,
            sourceTokenId: accessToken['uti']
        });

        return checkAccess(req, res, next);
    } catch (error) {
        console.log(error);
        next(error);
    }
};

const checkAccess = (req, res, next) => {
    if (!hasRequiredGroups(config.accessMatrix, req.path, req.method, res.locals.groups)) {
        return res.status(403).json({ error: 'User does not have the group, method or path' });
    }
    next();
};

module.exports = handleOverage;
