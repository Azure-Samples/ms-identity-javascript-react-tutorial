import { CACHE_TTL_IN_MS } from '../authConfig';

/**
 * Stores the groups in session storage for the given account
 * @param {AccountInfo} account 
 * @param {Array} groups 
 */
export const setGroupsInStorage = (account, groups) => {
    const newEntry = {
        groups: groups,
        lastAccessed: Date.now(),
        expiresOn: Date.now() + CACHE_TTL_IN_MS,
        sourceTokenId: account.idTokenClaims['uti'],
    };

    sessionStorage.setItem(`gmc.${account.idTokenClaims.aud}.${account.idTokenClaims.oid}`, JSON.stringify(newEntry));
};

/**
 * Checks if the groups are in session storage and if their associated ID token is not expired
 * @param {AccountInfo} account 
 * @returns {boolean}
 */
export const checkGroupsInStorage = (account) => {
    const storageEntry = sessionStorage.getItem(`gmc.${account.idTokenClaims.aud}.${account.idTokenClaims.oid}`);
    
    if (!storageEntry) return false;

    const parsedStorageEntry = JSON.parse(storageEntry);
    return parsedStorageEntry.groups && parsedStorageEntry.expiresOn >= Date.now() && parsedStorageEntry.sourceTokenId === account.idTokenClaims['uti'];
};

/**
 * Returns the groups array from session storage
 * @param {AccountInfo} account 
 * @returns {Array}
 */
export const getGroupsFromStorage = (account) => {
    const storageEntry = sessionStorage.getItem(`gmc.${account.idTokenClaims.aud}.${account.idTokenClaims.oid}`);
    
    if (!storageEntry) return null;

    return JSON.parse(storageEntry).groups;
};

/**
 * This method clears session storage of group membership claims for the given account.
 * @param {AccountInfo} account
 */
export const clearGroupsInStorage = (account) => {
    for (var key in sessionStorage) {
        if (key.startsWith(`gmc.${account.idTokenClaims.aud}.${account.idTokenClaims.oid}`)) {
            sessionStorage.removeItem(key);
        }
    }
};
