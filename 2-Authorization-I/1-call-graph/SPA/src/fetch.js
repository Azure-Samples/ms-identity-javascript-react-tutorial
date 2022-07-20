/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { BrowserAuthError } from '@azure/msal-browser';

import { msalInstance } from './index';
import { protectedResources, msalConfig } from '../src/authConfig';
import { addClaimsToStorage } from './utils/storageUtils';

/**
 * Makes a GET request using authorization header. For more, visit:
 * https://tools.ietf.org/html/rfc6750
 * @param {string} accessToken
 * @param {string} apiEndpoint
 */
export const callApiWithToken = async (accessToken, apiEndpoint, scopes) => {
    const headers = new Headers();
    const bearer = `Bearer ${accessToken}`;

    headers.append('Authorization', bearer);

    const options = {
        method: 'GET',
        headers: headers,
    };

    return fetch(apiEndpoint, options)
        .then((response) => handleClaimsChallenge(response, scopes))
        .catch((error) => error);
};

/**
 * This method inspects the HTTPS response from a fetch call for the "www-authenticate header"
 * If present, it grabs the claims challenge from the header and store it in the localStorage
 * For more information, visit: https://docs.microsoft.com/en-us/azure/active-directory/develop/claims-challenge#claims-challenge-header-format
 * @param {object} response
 * @param {Array} scopes
 * @returns response
 */
const handleClaimsChallenge = async (response) => {
    if (response.status === 401) {
        if (response.headers.get('www-authenticate')) {
            const account = msalInstance.getActiveAccount();
            const authenticateHeader = response.headers.get('www-authenticate');

            const claimsChallenge = authenticateHeader
                .split(' ')
                .find((entry) => entry.includes('claims='))
                .split('claims="')[1]
                .split('",')[0];

            addClaimsToStorage(claimsChallenge, `cc.${msalConfig.auth.clientId}.${account.idTokenClaims.oid}`);
        }
    }

    if (response.status === 200) return response.json();
    else if (response.status === 401) return { error: 'Unauthorized' };
    else return { error: 'Something went wrong' };
};
