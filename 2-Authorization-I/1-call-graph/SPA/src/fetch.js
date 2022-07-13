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
 * If present, it grabs the claims challenge from the header, then uses msal to ask Azure AD for a new access token containing the needed claims
 * If not present, then it simply returns the response as json
 * For more information, visit: https://docs.microsoft.com/en-us/azure/active-directory/develop/claims-challenge#claims-challenge-header-format
 * @param {object} response
 * @param {Array} scopes
 * @returns response
 */
const handleClaimsChallenge = async (response, scopes) => {
    if (response.status === 401) {
        if (response.headers.get('www-authenticate')) {
            let tokenResponse;
            const account = msalInstance.getActiveAccount();
            const authenticateHeader = response.headers.get('www-authenticate');

            const claimsChallenge = authenticateHeader
                .split(' ')
                .find((entry) => entry.includes('claims='))
                .split('claims="')[1]
                .split('",')[0];

            try {
                /**
                 * This method stores the claim challenge to the localStorage in the browser to be used when acquiring a token.
                 * To ensure that we are fetching the correct claim from the localStorage, we are using the clientId of the
                 * application and oid (user’s object id) as the key identifier of the claim in the localStorage.
                 */
                addClaimsToStorage(claimsChallenge, `cc.${msalConfig.auth.clientId}.${account.idTokenClaims.oid}`);

                tokenResponse = await msalInstance.acquireTokenPopup({
                    claims: window.atob(claimsChallenge), // decode the base64 string
                    scopes: scopes,
                    account: account,
                });

                if (tokenResponse) {
                    const data = await callApiWithToken(
                        tokenResponse.accessToken,
                        protectedResources.graphMe.endpoint,
                        scopes
                    );
                    return data;
                }
            } catch (error) {
                if (
                    error instanceof BrowserAuthError &&
                    (error.errorCode === 'popup_window_error' || error.errorCode === 'empty_window_error')
                ) {
                    /**
                     * This method stores the claim challenge to the localStorage in the browser to be used when acquiring a token.
                     * To ensure that we are fetching the correct claim from the localStorage, we are using the clientId
                     * of the application and oid (user’s object id) as the key identifier of the claim in the localStorage.
                     */
                    addClaimsToStorage(claimsChallenge, `cc.${msalConfig.auth.clientId}.${account.idTokenClaims.oid}`);

                    tokenResponse = await msalInstance.acquireTokenRedirect({
                        claims: window.atob(claimsChallenge),
                        scopes: protectedResources.apiTodoList.scopes,
                        account: account,
                    });
                } else {
                    throw error;
                }
            }
        }
    }

    if (response.status === 200) return response.json();
    else if (response.status === 401) return { error: 'Unauthorized' };
    else return { error: 'Something went wrong' };
};
