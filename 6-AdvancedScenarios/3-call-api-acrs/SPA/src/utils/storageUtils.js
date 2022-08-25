import { deleteTask, postTask, editTask } from '../fetch';

import { msalConfig } from '../authConfig';

/**
 * Stores the claim challenge to the sessionStorage in the browser to be used when acquiring a token
 * @param {String} claimsChallenge
 * @param {String} claimsChallengeId
 */
export const addClaimsToStorage = (claimsChallengeId, claimsChallenge) => {
    sessionStorage.setItem(claimsChallengeId, claimsChallenge);
};

/**
 * Retrieves the claim challenge from the sessionStorage in the browser
 * @param {String} claimsChallengeId 
 */
export const getClaimsFromStorage = (claimsChallengeId) => {
    return sessionStorage.getItem(claimsChallengeId);
};

/**
 * Clears sessionStorage of any claims challenge entry
 * @param {Object} account
 */
export const clearStorage = (account) => {
    for (var key in sessionStorage) {
        if (key.startsWith(`cc.${msalConfig.auth.clientId}.${account.idTokenClaims.oid}`)) sessionStorage.removeItem(key);
    }
};

/**
 * This method calls the API if the a access token is fetched
 * @param {Object} options
 * @param {String} id
 */
export const callEndpoint = (options, id) => {
    switch (options["method"]) {
        case "POST":
            let task = JSON.parse(options.body);
            return postTask(task)
                .then(res => res);
        case "DELETE":
            return deleteTask(id)
                .then(res => res);
        case "PUT":
            let taskItem = JSON.parse(options.body);
            return editTask(id, taskItem)
                .then(res => res)
        default:
            break;
    }
}


