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
        .then(response => response.json())
        .catch(error => console.log(error));
}


export const callApiToLogin = () => {
    return fetch("/api/login")
            .then(response => response.json())
            .catch(error => console.log(error))
}

export const callApiToLogout = () => {
    return fetch("/api/logout")
            .then(response => response.json())
            .catch(error => console.log(error))
}

export const callApiToGetSpaCode = () => {
    return  fetch("/api/fetchCode")
                .then(response => response.json())
                .catch(error => console.log(error))
}


