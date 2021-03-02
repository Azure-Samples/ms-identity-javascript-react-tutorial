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
export const callApiWithToken = async(accessToken, apiEndpoint) => {
    const headers = new Headers();
    const bearer = `Bearer ${accessToken}`;

    headers.append("Authorization", bearer);

    const options = {
        method: "GET",
        headers: headers
    };

    return fetch(apiEndpoint, options)
        .then(response => response.json())
        .catch(error => console.log(error));
}


/**
 * Makes a POST request sending token.
 * @param {string} accessToken 
 * @param {string} apiEndpoint 
 */
export const callOwnApiWithToken = async(accessToken, apiEndpoint) => {
    return fetch(apiEndpoint, {
            method: "POST",
            body: JSON.stringify({
                ssoToken: accessToken
                })
        }).then(response => response.json())
        .catch(error => console.log(error));
}