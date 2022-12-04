/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { LogLevel } from '@azure/msal-browser';
import { PublicClientApplication } from '@azure/msal-browser';

/**
 * Configuration object to be passed to MSAL instance on creation.
 * For a full list of MSAL.js configuration parameters, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/configuration.md
 */
export const msalConfig = {
    auth: {
        clientId: 'Enter_the_Application_Id_Here', // This is the ONLY mandatory field that you need to supply.
        authority: 'https://login.microsoftonline.com/Enter_the_Tenant_Info_Here', // Defaults to "https://login.microsoftonline.com/common"
        redirectUri: '/', // You must register this URI on Azure Portal/App Registration. Defaults to window.location.origin
        postLogoutRedirectUri: '/', // Indicates the page to navigate after logout.
        navigateToLoginRequestUrl: false, // If "true", will navigate back to the original request location before processing the auth code response.
    },
    cache: {
        cacheLocation: 'sessionStorage', // Configures cache location. "sessionStorage" is more secure, but "localStorage" gives you SSO between tabs.
        storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
    },
    system: {
        loggerOptions: {
            loggerCallback: (level, message, containsPii) => {
                if (containsPii) {
                    return;
                }
                switch (level) {
                    case LogLevel.Error:
                        console.error(message);
                        return;
                    case LogLevel.Info:
                        console.info(message);
                        return;
                    case LogLevel.Verbose:
                        console.debug(message);
                        return;
                    case LogLevel.Warning:
                        console.warn(message);
                        return;
                    default:
                        return;
                }
            },
        },
    },
};

/**
 * Add here the endpoints and scopes when obtaining an access token for protected web APIs. For more information, see:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/resources-and-scopes.md
 */
export const protectedResources = {
    apiTodoList: {
        todoListEndpoint: 'http://localhost:5000/api/todolist',
        dashboardEndpoint: 'http://localhost:5000/api/dashboard',
        scopes: ['api://Enter_the_Application_Id_Here/access_via_group_assignments'],
    },
    apiGraph: {
        endpoint: 'https://graph.microsoft.com/v1.0/me/checkMemberGroups',
        scopes: ['User.Read', 'GroupMember.Read.All'],
    },
};

/**
 * Scopes you add here will be prompted for user consent during sign-in.
 * By default, MSAL.js will add OIDC scopes (openid, profile, email) to any login request.
 * For more information about OIDC scopes, visit:
 * https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-permissions-and-consent#openid-connect-scopes
 */
export const loginRequest = {
    scopes: [...protectedResources.apiTodoList.scopes],
};

export const groups = {
    groupAdmin: 'Enter_the_Object_Id_of_GroupAdmin_Group_Here',
    groupMember: 'Enter_the_Object_Id_of_GroupMember_Group_Here',
};

/**
 * IMPORTANT: In case of overage, group list is cached for 1 hr by default, and thus cached groups 
 * will miss any changes to a users group membership for this duration. For capturing real-time 
 * changes to a user's group membership, consider implementing Microsoft Graph change notifications. 
 * For more information, visit: https://learn.microsoft.com/graph/api/resources/webhooks
 */
export const CACHE_TTL_IN_MS = 60 * 60 * 1000; // 1 hour in milliseconds