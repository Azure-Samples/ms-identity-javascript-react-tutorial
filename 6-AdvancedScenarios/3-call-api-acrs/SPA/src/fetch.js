import { BrowserAuthError } from "@azure/msal-browser";

import { msalInstance } from "./index";
import { msalConfig, protectedResources } from "./authConfig";
import { addClaimsToStorage, callAPI } from "./utils/storageUtils";

const getToken = async (method) => {
    const account = msalInstance.getActiveAccount();

    if (!account) {
        throw Error("No active account! Verify a user has been signed in and setActiveAccount has been called.");
    }

    /**
     * Create a TokenRequest object to retrieve an access token silently from the cache via acquireTokenSilent
     */
    const tokenRequest = {
        account: account,
        scopes: protectedResources.apiTodoList.scopes,
        claims: localStorage.getItem(`cc.${msalConfig.auth.clientId}.${account.idTokenClaims.oid}.${method}`) ?
            window.atob(localStorage.getItem(`cc.${msalConfig.auth.clientId}.${account.idTokenClaims.oid}.${method}`)) : null
    }

    const response = await msalInstance.acquireTokenSilent(tokenRequest);
    console.log(response);
    return response.accessToken;
}

/**
 * This method inspects the HTTP response from a fetch call for the "www-authenticate header"
 * If present, it grabs the claims challenge from the header, then uses msal to ask Azure AD for a new access token containing the needed claims
 * If not present, then it simply returns the response as json
 * For more information, visit: https://docs.microsoft.com/en-us/azure/active-directory/develop/claims-challenge#claims-challenge-header-format
 * @param {Object} response: HTTP response
 * @param {options} options: task options
 * @param {String} id: task id
 */
const handleClaimsChallenge = async (response, options, id = "") => {
    if (response.status === 401) {
        const account = msalInstance.getActiveAccount();

        if (response.headers.get('www-authenticate')) {
            let token;
            const authenticateHeader = response.headers.get("www-authenticate");
            const claimsChallenge = authenticateHeader.split(" ")
                .find(entry => entry.includes("claims=")).split('claims="')[1].split('",')[0];

            try {
                /**
                 * Here we add the claims challenge to localStorage, using <cc.appId.userId.method> scheme as key
                 * This allows us to use the claim challenge string as a parameter in subsequent acquireTokenSilent calls
                 * as MSAL will cache access tokens with different claims separately
                 */
                addClaimsToStorage(`cc.${msalConfig.auth.clientId}.${account.idTokenClaims.oid}.${options["method"]}`, claimsChallenge)

                const response = await msalInstance.acquireTokenPopup({
                    claims: window.atob(claimsChallenge), // decode the base64 string
                    scopes: protectedResources.apiTodoList.scopes
                });

                if (response.accessToken) {
                    /**
                     * Call the API automatically with the new access token
                     * This is purely for user experience.
                     */
                    return callAPI(options, id);
                }

            } catch (error) {
                // catch if popups are blocked
                if (error instanceof BrowserAuthError &&
                    (error.errorCode === "popup_window_error" || error.errorCode === "empty_window_error")) {

                    // add claims challenge to localStorage
                    addClaimsToStorage(claimsChallenge, options["method"])

                    const response = await msalInstance.acquireTokenRedirect({
                        claims: window.atob(claimsChallenge),
                        scopes: protectedResources.apiTodoList.scopes
                    });

                    if (response.accessToken) {
                        /**
                         * Call the API automatically with the new access token
                         * This is purely for user experience.
                         */
                        return callAPI(options, id);
                    }

                }
            }
        } else {
            return { error: "unknown header" }
        }
    }

    return response.json();
}

export const getTasks = async () => {
    const method = "GET";
    const accessToken = await getToken();

    const headers = new Headers();
    const bearer = `Bearer ${accessToken}`;

    headers.append("Authorization", bearer);

    const options = {
        method,
        headers: headers
    };

    return fetch(protectedResources.apiTodoList.todoListEndpoint, options)
        .then(response => response.json())
        .catch(error => console.log(error));
}

export const getTask = async (id) => {
    const method = "GET";
    const accessToken = await getToken();

    const headers = new Headers();
    const bearer = `Bearer ${accessToken}`;

    headers.append("Authorization", bearer);

    const options = {
        method,
        headers: headers
    };

    return fetch(protectedResources.apiTodoList.todoListEndpoint + `/${id}`, options)
        .then(response => response.json())
        .catch(error => console.log(error));
}

export const postTask = async (task) => {
    const method = "POST"
    const accessToken = await getToken(method);

    const headers = new Headers();
    const bearer = `Bearer ${accessToken}`;

    headers.append("Authorization", bearer);
    headers.append('Content-Type', 'application/json');

    const options = {
        method,
        headers: headers,
        body: JSON.stringify(task)
    };

    return fetch(protectedResources.apiTodoList.todoListEndpoint, options)
        .then((res) => handleClaimsChallenge(res, options))
        .catch(error => console.log(error));
}

export const deleteTask = async (id) => {
    const method = "DELETE";
    const accessToken = await getToken(method);

    const headers = new Headers();
    const bearer = `Bearer ${accessToken}`;

    headers.append("Authorization", bearer);

    const options = {
        method,
        headers: headers
    };

    return fetch(protectedResources.apiTodoList.todoListEndpoint + `/${id}`, options)
        .then((res) => handleClaimsChallenge(res, options, id))
        .catch(error => console.log(error));
}

export const editTask = async (id, task) => {
    const method = "PUT"
    const accessToken = await getToken(method);

    const headers = new Headers();
    const bearer = `Bearer ${accessToken}`;

    headers.append("Authorization", bearer);
    headers.append('Content-Type', 'application/json');

    const options = {
        method,
        headers: headers,
        body: JSON.stringify(task)
    };

    return fetch(protectedResources.apiTodoList.todoListEndpoint + `/${id}`, options)
        .then((res) => handleClaimsChallenge(res, options, id))
        .catch(error => console.log(error));
}
