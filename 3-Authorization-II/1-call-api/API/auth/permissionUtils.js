/**
 * Verifies that the web API is called with the right permissions i.e. the presented
 * access token contains at least one permission that this web API requires.
 * @param {Object} accessTokenPayload: Parsed access token payload
 * @param {Array} allowedPermissions: list of allowed permissions i.e. delegated + application
 * @returns {boolean}
 */
const requiredScopesOrAppPermissions = (accessTokenPayload, listOfPermissions) => {
    /**
     * Access tokens that have neither the 'scp' (for delegated permissions) nor
     * 'roles' (for application permissions) claim are not to be honored.
     *
     * An access token issued by Azure AD will have at least one of the two claims. Access tokens
     * issued to a user will have the 'scp' claim. Access tokens issued to an application will have
     * the roles claim. Access tokens that contain both claims are issued only to users, where the scp
     * claim designates the delegated permissions, while the roles claim designates the user's roles.
     */

    if (!accessTokenPayload.hasOwnProperty('scp') && !accessTokenPayload.hasOwnProperty('roles')) {
        return false;
    } else if (isAppOnlyToken(accessTokenPayload)) {
        return hasRequiredApplicationPermissions(accessTokenPayload, listOfPermissions);
    } else {
        return hasRequiredDelegatedPermissions(accessTokenPayload, listOfPermissions);
    }
}

/**
 * This method determines if the access token was issued to an application or to a user.
 * @param {Object} accessTokenPayload: Parsed access token payload
 * @returns {boolean}
 */
const isAppOnlyToken = (accessTokenPayload) => {
    /**
     * To determine whether an access token was issued to a user (i.e delegated) or an application
     * more easily, we recommend enabling the optional claim 'idtyp'. For more information, see:
     * https://docs.microsoft.com/azure/active-directory/develop/access-tokens#user-and-application-tokens
     */
    if (!accessTokenPayload.hasOwnProperty('idtyp')) {
        if (accessTokenPayload.hasOwnProperty('scp')) {
            return false;
        } else if (!accessTokenPayload.hasOwnProperty('scp') && accessTokenPayload.hasOwnProperty('roles')) {
            return true;
        }
    }

    return accessTokenPayload.idtyp === 'app';
}

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
 * Ensures that the access token has the specified application permissions.
 * @param {Object} accessTokenPayload: Parsed access token payload
 * @param {Array} requiredPermission: list of required permissions
 * @returns {boolean}
 */
const hasRequiredApplicationPermissions = (accessTokenPayload, requiredPermission) => {
    const normalizedRequiredPermissions = requiredPermission.map(permission => permission.toUpperCase());

    if (accessTokenPayload.hasOwnProperty('roles') && accessTokenPayload.roles.some(claim => normalizedRequiredPermissions.includes(claim.toUpperCase()))) {
        return true;
    }

    return false;
}

module.exports = {
    requiredScopesOrAppPermissions,
    hasRequiredDelegatedPermissions,
    hasRequiredApplicationPermissions
}
