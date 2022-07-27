import { msalConfig } from '../authConfig';

/**
 *  This method stores the claim challenge to the localStorage in the browser to be used when acquiring a token
 * @param {String} claimsChallenge
 */
export const addClaimsToStorage = (claimsChallenge, claimsChallengeId) => {
    if (!sessionStorage.getItem(claimsChallengeId)) {
        sessionStorage.setItem(claimsChallengeId, claimsChallenge);
    }
};

export const getClaimsFronStrorage = (claimsChallengeId) => {
    return sessionStorage.getItem(claimsChallengeId);
};

/**
 * This method clears localStorage of any claims challenge entry
 * @param {Object} account
 */
export const clearStorage = (account) => {
    for (var key in sessionStorage) {
        if (key === `cc.${msalConfig.auth.clientId}.${account.idTokenClaims.oid}`) sessionStorage.removeItem(key);
    }
};

export const addSessionTimeoutToStorage = (SessionExpiry, SessionId)  => {
    localStorage.setItem(SessionId, SessionExpiry);
}

export const removeSessionTimeoutFromStorage = (account) => {
    for (var key in localStorage) {
        if (key === `ss.${msalConfig.auth.clientId}.${account.idTokenClaims.oid}`) localStorage.removeItem(key);
    }
}

