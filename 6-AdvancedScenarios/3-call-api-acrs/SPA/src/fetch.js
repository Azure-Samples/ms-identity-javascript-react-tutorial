import { msalInstance } from "./index";
import { msalConfig, protectedResources } from "./authConfig";
import { addClaimsToStorage, getClaimsFromStorage, callEndpoint } from "./utils/storageUtils";
import { parseChallenges } from "./utils/claimUtils";

const getToken = async (endpoint, scopes, method) => {
    const account = msalInstance.getActiveAccount();

    if (!account) {
        throw Error("No active account! Verify a user has been signed in and setActiveAccount has been called.");
    }

    /**
     * Create a TokenRequest object to retrieve an access token silently from the cache via acquireTokenSilent
     */
    const tokenRequest = {
        account: account,
        scopes: scopes,
        redirectUri: '/redirect',
        claims: getClaimsFromStorage(`cc.${msalConfig.auth.clientId}.${account.idTokenClaims.oid}.${new URL(endpoint).hostname}.${method}`) ?
            window.atob(getClaimsFromStorage(`cc.${msalConfig.auth.clientId}.${account.idTokenClaims.oid}.${new URL(endpoint).hostname}.${method}`)) : null
    }

    const response = await msalInstance.acquireTokenSilent(tokenRequest);
    return response.accessToken;
}

const handleResponse = async (response, endpoint, options, id = '') => {
    if (response.status === 200) {
        return response.json();
    } else if (response.status === 401) {
        if (response.headers.get('www-authenticate')) {
            return handleClaimsChallenge(response, endpoint, options, id);
        }

        throw new Error(`Unauthorized: ${response.status}`);
    } else {
        throw new Error(`Something went wrong with the request: ${response.status}`);
    }
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
const handleClaimsChallenge = async (response, endpoint, options, id = '') => {
    const account = msalInstance.getActiveAccount();

    const authenticateHeader = response.headers.get('www-authenticate');
    const claimsChallenge = parseChallenges(authenticateHeader);

    /**
     * Here we add the claims challenge to localStorage, using <cc.appId.userId.resource.method> scheme as key
     * This allows us to use the claim challenge string as a parameter in subsequent acquireTokenSilent calls
     * as MSAL will cache access tokens with different claims separately
     */
    addClaimsToStorage(
        `cc.${msalConfig.auth.clientId}.${account.idTokenClaims.oid}.${new URL(endpoint).hostname}.${options.method}`, 
        claimsChallenge.claims
    );

    try {
        const tokenResponse = await msalInstance.acquireTokenPopup({
            claims: window.atob(claimsChallenge.claims), // decode the base64 string
            scopes: protectedResources.apiTodoList.scopes,
            redirectUri: '/redirect',
        });

        if (tokenResponse.accessToken) {
            // call the API automatically with the new access token -this is purely for user experience.
            return callEndpoint(options, id);
        }

    } catch (error) {
        // catch if popups are blocked
        if (error instanceof BrowserAuthError &&
            (error.errorCode === "popup_window_error" || error.errorCode === "empty_window_error")) {

            const tokenResponse = await msalInstance.acquireTokenRedirect({
                claims: window.atob(claimsChallenge.claims),
                scopes: protectedResources.apiTodoList.scopes
            });

            if (tokenResponse.accessToken) {
                return callEndpoint(options, id);
            }

        }
    }
}

export const getTasks = async () => {
    const method = "GET";
    const accessToken = await getToken(protectedResources.apiTodoList.todoListEndpoint, protectedResources.apiTodoList.scopes, method);

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
    const accessToken = await getToken(protectedResources.apiTodoList.todoListEndpoint, protectedResources.apiTodoList.scopes, method);

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
    const accessToken = await getToken(protectedResources.apiTodoList.todoListEndpoint, protectedResources.apiTodoList.scopes, method);

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
        .then((res) => handleResponse(res, protectedResources.apiTodoList.todoListEndpoint, options))
        .catch(error => console.log(error));
}

export const deleteTask = async (id) => {
    const method = "DELETE";
    const accessToken = await getToken(protectedResources.apiTodoList.todoListEndpoint, protectedResources.apiTodoList.scopes, method);

    const headers = new Headers();
    const bearer = `Bearer ${accessToken}`;

    headers.append("Authorization", bearer);

    const options = {
        method,
        headers: headers
    };

    return fetch(protectedResources.apiTodoList.todoListEndpoint + `/${id}`, options)
        .then((res) => handleResponse(res, protectedResources.apiTodoList.todoListEndpoint, options, id))
        .catch(error => console.log(error));
}

export const editTask = async (id, task) => {
    const method = "PUT"
    const accessToken = await getToken(protectedResources.apiTodoList.todoListEndpoint, protectedResources.apiTodoList.scopes, method);

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
        .then((res) => handleResponse(res, protectedResources.apiTodoList.todoListEndpoint, options, id))
        .catch(error => console.log(error));
}
