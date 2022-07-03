import { BrowserAuthError } from '@azure/msal-browser';
import { msalInstance } from './index';
import { protectedResources, msalConfig } from '../src/authConfig';
import { addClaimsToStorage } from './utils/storageUtils';

/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Makes a GET request using authorization header. For more, visit:
 * https://tools.ietf.org/html/rfc6750
 * @param {string} accessToken
 * @param {string} apiEndpoint
 */
export const callApiWithToken = async (accessToken, apiEndpoint, scopes, isImage = false) => {
    const headers = new Headers();
    const bearer = `Bearer ${accessToken}`;

    headers.append('Authorization', bearer);

    const options = {
        method: 'GET',
        headers: headers,
    };

    return fetch(apiEndpoint, options)
        .then((response) => handleClaimsChallenge(response, scopes, isImage))
        .catch((error) => console.log(error));
};

/**
 * This method inspects the HTTPS response from a fetch call for the "www-authenticate header"
 * If present, it grabs the claims challenge from the header, then uses msal to ask Azure AD for a new access token containing the needed claims
 * If not present, then it simply returns the response as json
 * For more information, visit: https://docs.microsoft.com/en-us/azure/active-directory/develop/claims-challenge#claims-challenge-header-format
 * @param {object} response 
 * @param {Array} scopes 
 * @param {boolean} isImage 
 * @returns response
 */
const handleClaimsChallenge = async (response, scopes, isImage) => { 
    console.log(response.status, "res status")
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
                addClaimsToStorage(claimsChallenge, `cc.${msalConfig.auth.clientId}.${account.idTokenClaims.oid}`);
                tokenResponse = await msalInstance.acquireTokenPopup({
                    claims: localStorage.getItem(`cc.${msalConfig.auth.clientId}.${account.idTokenClaims.oid}`)
                        ? window.atob(
                              localStorage.getItem(`cc.${msalConfig.auth.clientId}.${account.idTokenClaims.oid}`)
                          )
                        : null, // decode the base64 string
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

    if( response.status ===  200 & isImage) return response.blob()
    if( response.status ===  200) return response.json();
    throw response.json();
};


/**
 * This method fetches contacts profile images from Graph API and adds them to the contact object. 
 * For more information about how to fetch a contact profile image, 
 * please visit: https://docs.microsoft.com/en-us/graph/api/profilephoto-get?view=graph-rest-1.0
 * @param {Object} contacts 
 * @param {String} accessToken 
 */
export const getImageForContact = async (contacts, accessToken) => {
     await Promise.all(
         contacts.value.map(async (contact) => {
             let res = await callApiWithToken(
                 accessToken,
                 `${protectedResources.graphContacts.endpoint}/${contact.id}/photo/$value `,
                 protectedResources.graphContacts.scopes,
                 true
             );

             if (res) {
                 const urlEncodedImage = URL.createObjectURL(res);
                 contact.image = urlEncodedImage;
             }

             return contact;
         })
     );
}
