/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { InteractionRequiredAuthError, AuthenticationScheme } from '@azure/msal-browser';

import { protectedResources } from "./authConfig";
import { msalInstance } from "./index";


const getToken = async (method, query) => {
    const account = msalInstance.getActiveAccount();

    if (!account) {
        throw Error("No active account! Verify a user has been signed in and setActiveAccount has been called.");
    }

    const tokenRequest = {
        scopes: [...protectedResources.apiTodoList.scopes],
        authenticationScheme: AuthenticationScheme.POP,
        resourceRequestMethod: method,
        resourceRequestUri: query ? protectedResources.apiTodoList.endpoint + query : protectedResources.apiTodoList.endpoint,
    }

    try {
        const response = await msalInstance.acquireTokenSilent({
            account: account,
            ...tokenRequest
        });
    
        return response.accessToken;
    } catch (error) {
        if (InteractionRequiredAuthError.isInteractionRequiredError(error.errorCode)) {
            const response = await this.authService.acquireTokenPopup(tokenRequest);
            return response.accessToken;
        }
    }
}

export const getTasks = async () => {
    const accessToken = await getToken("GET");

    const headers = new Headers();
    const pop = `PoP ${accessToken}`;

    headers.append("Authorization", pop);

    const options = {
        method: "GET",
        headers: headers
    };

    return fetch(protectedResources.apiTodoList.endpoint, options)
        .then(response => response.json())
        .catch(error => console.log(error));
}

export const getTask = async (id) => {
    const accessToken = await getToken("GET", `/${id}`);

    const headers = new Headers();
    const pop = `PoP ${accessToken}`;

    headers.append("Authorization", pop);

    const options = {
        method: "GET",
        headers: headers
    };

    return fetch(protectedResources.apiTodoList.endpoint + `/${id}`, options)
        .then(response => response.json())
        .catch(error => console.log(error));
}

export const postTask = async (task) => {
    const accessToken = await getToken("POST");

    const headers = new Headers();
    const pop = `PoP ${accessToken}`;

    headers.append("Authorization", pop);
    headers.append('Content-Type', 'application/json');

    const options = {
        method: "POST",
        headers: headers,
        body: JSON.stringify(task)
    };

    return fetch(protectedResources.apiTodoList.endpoint, options)
        .then(response => response.json())
        .catch(error => console.log(error));
}

export const deleteTask = async (id) => {
    const accessToken = await getToken("DELETE", `/${id}`);

    const headers = new Headers();
    const pop = `PoP ${accessToken}`;

    headers.append("Authorization", pop);

    const options = {
        method: "DELETE",
        headers: headers
    };

    return fetch(protectedResources.apiTodoList.endpoint + `/${id}`, options)
        .then(response => response.json())
        .catch(error => console.log(error));
}

export const editTask = async (id, task) => {
    const accessToken = await getToken("PUT", `/${task.id}`);

    const headers = new Headers();
    const pop = `PoP ${accessToken}`;

    headers.append("Authorization", pop);
    headers.append('Content-Type', 'application/json');

    const options = {
        method: "PUT",
        headers: headers,
        body: JSON.stringify(task)
    };

    return fetch(protectedResources.apiTodoList.endpoint + `/${id}`, options)
        .then(response => response.json())
        .catch(error => console.log(error));
}