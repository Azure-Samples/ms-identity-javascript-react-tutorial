/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

const { default: axios } = require('axios');
const msal = require('@azure/msal-node');

const config = require('../authConfig');

const msalConfig = {
    auth: {
        clientId: config.credentials.clientID,
        authority: `https://${config.metadata.authority}/${config.credentials.tenantID}`,
        clientSecret: config.credentials.clientSecret
    },
    system: {
        loggerOptions: {
            loggerCallback(loglevel, message, containsPii) {
                console.log(message);
            },
            piiLoggingEnabled: false,
            logLevel: msal.LogLevel.Info,
        }
    }
};

// Create msal application object
const cca = new msal.ConfidentialClientApplication(msalConfig);

const getOboToken = async (oboAssertion) => {
    const oboRequest = {
        oboAssertion: oboAssertion,
        scopes: config.protectedResources.graphAPI.scopes,
    }

    try {
        const response = await cca.acquireTokenOnBehalfOf(oboRequest);
        return response.accessToken;
    } catch (error) {
        console.log(error);
        return error;
    }
}

const callGraph = async (oboToken, endpoint) => {

    const options = {
        headers: {
            Authorization: `Bearer ${oboToken}`
        }
    };

    console.log('request made to web API at: ' + new Date().toString());

    try {
        const response = await axios.default.get(endpoint, options);
        return response.data;
    } catch (error) {
        console.log(error)
        return error;
    }
}

const handlePagination = async (oboToken, nextPage, userGroups) => {

    try {
        const graphResponse = await callGraph(oboToken, nextPage);

        graphResponse.value.map((v) => userGroups.push(v.id));

        if (graphResponse['@odata.nextLink']) {
            return await handlePagination(oboToken, graphResponse['@odata.nextLink'], userGroups)
        } else {
            return userGroups
        }
    } catch (error) {
        console.log(error);
    }

}

const checkAccess = (req, res, next) => {
    const accessMatrix = config.accessMatrix;
    const groups = res.locals.groups;

    if (req.path.includes(accessMatrix.todolist.path)) {
        if (accessMatrix.todolist.methods.includes(req.method)) {

            let intersection = accessMatrix.todolist.groups
                .filter(group => groups.includes(group));

            if (intersection.length < 1) {
                return res.status(403).json({ error: 'User does not have the group' });
            } else {
                return next();
            }
        } else {
            return res.status(403).json({ error: 'Method not allowed' });
        }
    } else if (req.path.includes(accessMatrix.dashboard.path)) {
        if (accessMatrix.dashboard.methods.includes(req.method)) {

            let intersection = accessMatrix.dashboard.groups
                .filter(group => groups.includes(group));

            if (intersection.length < 1) {
                return res.status(403).json({ error: 'User does not have the group' });
            } else {
                return next();
            }
        } else {
            return res.status(403).json({ error: 'Method not allowed' });
        }
    } else {
        return res.status(403).json({ error: 'Unrecognized path' });
    }
}

const handleOverage = async (req, res, next) => {
    console.log('going through overage');
    const authHeader = req.headers.authorization;
    const accessToken = authHeader.split(' ')[1]

    const userGroups = [];

    try {
        const oboToken = await getOboToken(accessToken);
        const graphResponse = await callGraph(oboToken, config.protectedResources.graphAPI.endpoint);

        /**
         * Some queries against Microsoft Graph return multiple pages of data either due to server-side paging 
         * or due to the use of the $top query parameter to specifically limit the page size in a request. 
         * When a result set spans multiple pages, Microsoft Graph returns an @odata.nextLink property in 
         * the response that contains a URL to the next page of results. Learn more at https://docs.microsoft.com/graph/paging
         */
        if (graphResponse['@odata.nextLink']) {
            graphResponse.value.map((v) => userGroups.push(v.id));

            try {
                res.locals.groups = await handlePagination(oboToken, graphResponse['@odata.nextLink'], userGroups);
                return checkAccess(req, res, next);
            } catch (error) {
                console.log(error);
            }
        } else {
            res.locals.groups = graphResponse.value.map((v) => v.id);
            return checkAccess(req, res, next);
        }
    } catch (error) {
        console.log(error);
    }
}

module.exports = handleOverage;