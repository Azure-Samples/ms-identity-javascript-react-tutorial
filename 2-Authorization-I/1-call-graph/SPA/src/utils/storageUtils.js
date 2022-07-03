import { msalConfig } from '../authConfig';

/**
 *  This method stores the claim challenge to the localStorage in the browser to be used when acquiring a token
 * @param {String} claimsChallenge
 */
export const addClaimsToStorage = (claimsChallenge, claimsChallengeId) => {
    if (!localStorage.getItem(claimsChallengeId)) {
        localStorage.setItem(claimsChallengeId, claimsChallenge);
    }
};

/**
 * This method clears localStorage of any claims challenge entry
 * @param {Object} account
 */
export const clearStorage = (account) => {
    for (var key in localStorage) {
        if (key === `cc.${msalConfig.auth.clientId}.${account.idTokenClaims.oid}`) localStorage.removeItem(key);
    }
};
