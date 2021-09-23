import { BrowserAuthError } from "@azure/msal-browser";
import { protectedResources } from "./authConfig";
import { msalInstance } from "./index";

const getToken = async () => {
    const account = msalInstance.getActiveAccount();

    if (!account) {
        throw Error("No active account! Verify a user has been signed in and setActiveAccount has been called.");
    }

    const response = await msalInstance.acquireTokenSilent({
        account: account,
        scopes: protectedResources.apiTodoList.scopes
    });

    return response.accessToken;
}

/**
 * This method inspects the HTTP response from a fetch call for the "www-authenticate header"
 * If present, it grabs the claims challenge from the header, then uses msal to ask Azure AD for a new access token containing the needed claims
 * If not present, then it simply returns the response as json
 * For more information, visit: https://docs.microsoft.com/en-us/azure/active-directory/develop/claims-challenge#claims-challenge-header-format
 * @param {Object} response: HTTP response
 */
const handleClaimsChallenge = async (response) => {
    if (response.status === 401) {
        if (response.headers.get('www-authenticate')) {
            
            const authenticateHeader = response.headers.get("www-authenticate");
            const claimsChallenge = authenticateHeader.split(" ")
                .find(entry => entry.includes("claims=")).split('claims="')[1].split('",')[0];

            try {
                await msalInstance.acquireTokenPopup({
                    claims: window.atob(claimsChallenge), // decode the base64 string
                    scopes: protectedResources.apiTodoList.scopes
                });
            } catch (error) {
                // catch if popups are blocked
                if (error instanceof BrowserAuthError && 
                    (error.errorCode === "popup_window_error" || error.errorCode === "empty_window_error")) {

                    await msalInstance.acquireTokenRedirect({
                        claims: window.atob(claimsChallenge),
                        scopes: protectedResources.apiTodoList.scopes
                    });
                }
            }
        } else {
            return { error: "unknown header" }
        }
    }

    return response.json();
}

export const getTasks = async () => {
    const accessToken = await getToken();

    const headers = new Headers();
    const bearer = `Bearer ${accessToken}`;

    headers.append("Authorization", bearer);

    const options = {
        method: "GET",
        headers: headers
    };

    return fetch(protectedResources.apiTodoList.todoListEndpoint, options)
        .then(response => response.json())
        .catch(error => console.log(error));
}

export const getTask = async (id) => {
    const accessToken = await getToken();

    const headers = new Headers();
    const bearer = `Bearer ${accessToken}`;

    headers.append("Authorization", bearer);

    const options = {
        method: "GET",
        headers: headers
    };

    return fetch(protectedResources.apiTodoList.todoListEndpoint + `/${id}`, options)
        .then(response => response.json())
        .catch(error => console.log(error));
}

export const postTask = async (task) => {
    const accessToken = await getToken();

    const headers = new Headers();
    const bearer = `Bearer ${accessToken}`;

    headers.append("Authorization", bearer);
    headers.append('Content-Type', 'application/json');

    const options = {
        method: "POST",
        headers: headers,
        body: JSON.stringify(task)
    };

    return fetch(protectedResources.apiTodoList.todoListEndpoint, options)
        .then(handleClaimsChallenge)
        .catch(error => console.log(error));
}

export const deleteTask = async (id) => {
    const accessToken = await getToken();

    const headers = new Headers();
    const bearer = `Bearer ${accessToken}`;

    headers.append("Authorization", bearer);

    const options = {
        method: "DELETE",
        headers: headers
    };

    return fetch(protectedResources.apiTodoList.todoListEndpoint + `/${id}`, options)
        .then(handleClaimsChallenge)
        .catch(error => console.log(error));
}

export const editTask = async (id, task) => {
    const accessToken = await getToken();

    const headers = new Headers();
    const bearer = `Bearer ${accessToken}`;

    headers.append("Authorization", bearer);
    headers.append('Content-Type', 'application/json');

    const options = {
        method: "PUT",
        headers: headers,
        body: JSON.stringify(task)
    };

    return fetch(protectedResources.apiTodoList.todoListEndpoint + `/${id}`, options)
        .then(handleClaimsChallenge)
        .catch(error => console.log(error));
}