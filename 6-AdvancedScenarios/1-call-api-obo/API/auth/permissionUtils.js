/**
 * Indicates whether the access token was issued to a user or an application.
 * @param {Object} accessTokenPayload 
 * @returns {boolean}
 */
const isAppOnlyToken = (accessTokenPayload) => {
    /**
     * An access token issued by Azure AD will have at least one of the two claims. Access tokens
     * issued to a user will have the 'scp' claim. Access tokens issued to an application will have
     * the roles claim. Access tokens that contain both claims are issued only to users, where the scp
     * claim designates the delegated permissions, while the roles claim designates the user's role.
     *
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
};

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

    if (accessTokenPayload.hasOwnProperty('roles') && accessTokenPayload.roles
        .some(claim => normalizedRequiredPermissions.includes(claim.toUpperCase()))) {
        return true;
    }

    return false;
}

module.exports = {
    isAppOnlyToken,
    hasRequiredDelegatedPermissions,
    hasRequiredApplicationPermissions,
}
