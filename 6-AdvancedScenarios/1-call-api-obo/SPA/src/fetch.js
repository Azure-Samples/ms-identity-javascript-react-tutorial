/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

export const callApiWithToken = async (accessToken, apiEndpoint) => {
    const headers = new Headers();
    const bearer = `Bearer ${accessToken}`;

    headers.append("Authorization", bearer);

    const options = {
        method: "GET",
        headers: headers
    };

    return fetch(apiEndpoint, options)
        .then(response => response.json())
        .then(response => {
            return new Promise((resolve, reject) => {
                // check for any errors
                if (response['error_codes']) {

                    /**
                     * Conditional access MFA requirement throws an AADSTS50076 error.
                     * If the user has not enrolled in MFA, an AADSTS50079 error will be thrown instead.
                     * If this occurs, sample middle-tier API will propagate this to client
                     * For more, visit: https://docs.microsoft.com/azure/active-directory/develop/v2-conditional-access-dev-guide
                     */
                    if (response['error_codes'].includes(50076) || response['error_codes'].includes(50079)) {

                        // stringified JSON claims challenge
                        reject(response['claims']);

                    /**
                     * If the user has not consented to the required scopes, 
                     * an AADSTS65001 error will be thrown.
                     */
                    } else if (response['error_codes'].includes(65001)) {
                        reject();
                    }
                } else {
                    resolve(response);
                }
            })
        });
}