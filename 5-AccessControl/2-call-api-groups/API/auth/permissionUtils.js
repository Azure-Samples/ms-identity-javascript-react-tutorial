/**
 * Ensures that the access token has the specified delegated permissions.
 * @param {Object} accessTokenPayload: Parsed access token payload
 * @param {Array} requiredPermission: list of required permissions
 * @returns {boolean}
 */
 const hasRequiredDelegatedPermissions = (accessTokenPayload, requiredPermission) => {
    const normalizedRequiredPermissions = requiredPermission.map(permission => permission.toUpperCase());

    if (accessTokenPayload.hasOwnProperty('scp') && accessTokenPayload.scp.split(' ')
        .some(claim => normalizedRequiredPermissions.includes(claim.toUpperCase()))) {
        return true;
    }

    return false;
}

/**
 * This method checks if the request has the correct groups, paths and methods
 * @param {Object} accessMatrix
 * @param {String} path
 * @param {String} method
 * @param {Array} groups
 * @returns boolean
 */
const requestHasRequiredAttributes = (accessMatrix, path, method, groups) => {
    const accessRule = Object.values(accessMatrix).find((accessRule) => path.includes(accessRule.path));

    if (accessRule.methods.includes(method)) {
        const hasGroup = accessRule.groups.some((group) => groups.includes(group));

        if (hasGroup) {
            return true;
        }
    }

    return false;
};

module.exports = {
    hasRequiredDelegatedPermissions,
    requestHasRequiredAttributes,
};
