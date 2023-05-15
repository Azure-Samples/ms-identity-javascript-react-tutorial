/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

require('dotenv').config();


const REDIRECT_URI = process.env.REDIRECT_URI || 'http://localhost:5000/admin/redirect';
const POST_LOGOUT_REDIRECT_URI = process.env.POST_LOGOUT_REDIRECT_URI || 'http://localhost:5000/admin';
const TENANT_ID = 'Enter_the_Tenant_Info_Here';
/**
 * Configuration object to be passed to MSAL instance on creation.
 * For a full list of MSAL Node configuration parameters, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-node/docs/configuration.md
 */
const msalConfig = {
    auth: {
        clientId: process.env.CLIENT_ID || 'Enter_the_Application_Id_Here', // 'Application (client) ID' of app registration in Azure portal - this value is a GUID
        authority: process.env.AUTHORITY || 'https://login.microsoftonline.com/' + (process.env.TENANT_ID || TENANT_ID), // replace "Enter_the_Tenant_Info_Here" with your tenant name, // replace "Enter_the_Tenant_Subdomain_Here" with your tenant subdomain
        clientSecret: process.env.CLIENT_SECRET || 'Enter_the_Client_Secret_Here', // Client secret generated from the app registration in Azure portal
    },
    system: {
        loggerOptions: {
            loggerCallback(loglevel, message, containsPii) {
                console.log(message);
            },
            piiLoggingEnabled: false,
            logLevel: 'Info',
        },
    },
};

const protectedResources = {
    msGraphAcrs: {
        endpoint: 'https://graph.microsoft.com/beta/identity/conditionalAccess/policies',
        scopes: ['Policy.Read.ConditionalAccess'],
    },
};

const API_REQUIRED_PERMISSION = process.env.API_REQUIRED_PERMISSION || "access_as_user";
const EXPRESS_SESSION_SECRET = process.env.EXPRESS_SESSION_SECRET || 'ENTER_YOUR_SECRET_HERE';
const CORS_ALLOWED_DOMAINS = process.env.CORS_ALLOWED_DOMAINS || 'http://localhost:3000';
const DB_CONNECTION_STRING = process.env.DB_CONNECTION_STRING || 'Enter_Database_Connection_String_Here';

module.exports = {
    msalConfig,
    REDIRECT_URI,
    POST_LOGOUT_REDIRECT_URI,
    TENANT_ID,
    API_REQUIRED_PERMISSION,
    EXPRESS_SESSION_SECRET,
    DB_CONNECTION_STRING,
    CORS_ALLOWED_DOMAINS,
    protectedResources,
};
