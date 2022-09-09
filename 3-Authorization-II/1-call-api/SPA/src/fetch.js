/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { msalInstance } from "./index";
import { protectedResources } from "./authConfig";

const getToken = async (scopes) => {
    const account = msalInstance.getActiveAccount();

    if (!account) {
        throw Error("No active account! Verify a user has been signed in and setActiveAccount has been called.");
    }

    const response = await msalInstance.acquireTokenSilent({
        account: account,
        scopes: scopes
    });

    return response.accessToken;
}

export const getTasks = async () => {
    const accessToken = await getToken(protectedResources.apiTodoList.scopes.read);

    const headers = new Headers();
    const bearer = `Bearer ${accessToken}`;

    headers.append("Authorization", bearer);

    const options = {
        method: "GET",
        headers: headers
    };

    return fetch(protectedResources.apiTodoList.endpoint, options)
        .then(response => response.json())
        .catch(error => console.log(error));
}

export const getTask = async (id) => {
    const accessToken = await getToken(protectedResources.apiTodoList.scopes.read);

    const headers = new Headers();
    const bearer = `Bearer ${accessToken}`;

    headers.append("Authorization", bearer);

    const options = {
        method: "GET",
        headers: headers
    };

    return fetch(protectedResources.apiTodoList.endpoint + `/${id}`, options)
        .then(response => response.json())
        .catch(error => console.log(error));
}

export const postTask = async (task) => {
    const accessToken = await getToken(protectedResources.apiTodoList.scopes.write);

    const headers = new Headers();
    const bearer = `Bearer ${accessToken}`;

    headers.append("Authorization", bearer);
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
    const accessToken = await getToken(protectedResources.apiTodoList.scopes.write);

    const headers = new Headers();
    const bearer = `Bearer ${accessToken}`;

    headers.append("Authorization", bearer);

    const options = {
        method: "DELETE",
        headers: headers
    };

    return fetch(protectedResources.apiTodoList.endpoint + `/${id}`, options)
        .then(response => response.json())
        .catch(error => console.log(error));
}

export const editTask = async (id, task) => {
    const accessToken = await getToken(protectedResources.apiTodoList.scopes.write);

    const headers = new Headers();
    const bearer = `Bearer ${accessToken}`;

    headers.append("Authorization", bearer);
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
