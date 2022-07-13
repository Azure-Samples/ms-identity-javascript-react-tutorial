/**
 * Ensures that the access token has at least one allowed permission.
 * @param {Object} accessTokenPayload: Parsed access token payload
 * @param {Array} allowedPermissions: list of allowed permissions i.e. delegated + application
 * @returns {boolean}
 */
exports.requiredScopeOrAppPermission = (accessTokenPayload, allowedPermissions) => {
    /**
     * Access tokens that have neither the 'scp' (for delegated permissions) or
     * 'roles' (for application permissions) claim are not to be honored.
     *
     * An access token issued by Azure AD will have at least one of the two claims.
     * To determine whether an access token was issued to a user (i.e delegated) or an application
     * more easily, we recommend enabling the optional claim 'idtyp'. For more information, see:
     * https://docs.microsoft.com/azure/active-directory/develop/access-tokens#user-and-application-tokens
     */

    if (!accessTokenPayload.hasOwnProperty('scp') && !accessTokenPayload.hasOwnProperty('roles')) {
        return false;
    } else if (accessTokenPayload.hasOwnProperty('scp')) {
        return accessTokenPayload.scp.split(' ').some((scope) => allowedPermissions.includes(scope));
    } else if (accessTokenPayload.hasOwnProperty('roles')) {
        return accessTokenPayload.roles.some((role) => allowedPermissions.includes(role));
    }
};

/**
 * Ensures that the access token has the required delegated permissions.
 * @param {Object} accessTokenPayload: Parsed access token payload
 * @param {Array} requiredPermission: list of required permissions
 * @returns {boolean}
 */
exports.hasDelegatedPermissions = (accessTokenPayload, requiredPermission) => {
    if (!accessTokenPayload.hasOwnProperty('scp')) {
        console.log('Access token does not have scp claim');
        return false;
    }

    if (accessTokenPayload.scp.split(' ').some((claim) => requiredPermission.includes(claim))) {
        return true;
    }

    return false;
};

/**
 * Ensures that the access token has the required application permissions.
 * @param {Object} accessTokenPayload: Parsed access token payload
 * @param {Array} requiredPermission: list of required permissions
 * @returns {boolean}
 */
exports.hasApplicationPermissions = (accessTokenPayload, requiredPermission) => {
    if (!accessTokenPayload.hasOwnProperty('roles')) {
        console.log('Access token does not have roles claim');
        return false;
    }

    if (accessTokenPayload.roles.some((claim) => requiredPermission.includes(claim))) {
        return true;
    }

    return false;
};
