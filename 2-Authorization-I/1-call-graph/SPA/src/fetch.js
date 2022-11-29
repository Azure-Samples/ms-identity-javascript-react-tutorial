/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { msalInstance } from './authConfig';
import { msalConfig } from '../src/authConfig';
import { addClaimsToStorage } from './utils/storageUtils';
import { parseChallenges } from './utils/claimUtils';

/**
 * This method inspects the HTTPS response from a fetch call for the "www-authenticate header"
 * If present, it grabs the claims challenge from the header and store it in the localStorage
 * For more information, visit: https://docs.microsoft.com/en-us/azure/active-directory/develop/claims-challenge#claims-challenge-header-format
 * @param {object} response
 * @returns response
 */
export const handleClaimsChallenge = async (response, apiEndpoint) => {
    if (response.status === 200) {
        return response.json();
    } else if (response.status === 401) {
        if (response.headers.get('www-authenticate')) {
            const account = msalInstance.getActiveAccount();
            const authenticateHeader = response.headers.get('www-authenticate');
            const claimsChallenge = parseChallenges(authenticateHeader);

            /**
             * This method stores the claim challenge to the session storage in the browser to be used when acquiring a token.
             * To ensure that we are fetching the correct claim from the storage, we are using the clientId
             * of the application and oid (user’s object id) as the key identifier of the claim with schema
             * cc.<clientId>.<oid>.<resource.hostname>
             */
            addClaimsToStorage(
                claimsChallenge.claims,
                `cc.${msalConfig.auth.clientId}.${account.idTokenClaims.oid}.${new URL(apiEndpoint).hostname}`
            );
            return { error: 'claims_challenge_occurred', payload: claimsChallenge.claims };
        }

        throw new Error(`Unauthorized: ${response.status}`);
    } else {
        throw new Error(`Something went wrong with the request: ${response.status}`);
    }
};
