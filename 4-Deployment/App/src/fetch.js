/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
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
        .then((response) => {
            console.log(response);
            return response;
        })
        .then(response => response.json())
        .catch(error => console.log(error));
}

export const callOwnApiWithToken = async(accessToken, apiEndpoint) => {
    return fetch(apiEndpoint, {
            method: "POST",
            body: JSON.stringify({
                ssoToken: accessToken
                })
        }).then((response) => {
            console.log(response);
            return response;
        })
        .then(response => response.json())
        .catch(error => console.log(error));
}