
/**
 * 
 * Verifies that the web API is called with the right permissions i.e. the presented 
 * access token contains at least one permission that this web API requires. 
 * Also Verifies if the client and API have the same clientId because they are tightly coupled.
 * @param {Object} accessTokenPayload: Parsed access token payload
 * @param {Array} listOfPermissions: list of allowed permissions i.e. delegated + application
 * @param {String} clientId: application ID
 * @returns {boolean}
 */
const hasRequiredPermissions = (accessTokenPayload, listOfPermissions, clientId) => {
    if (hasRequiredScopes(accessTokenPayload, listOfPermissions) && hasRequiredClientId(accessTokenPayload, clientId)) {
        return true;
    }
    return false;
};

/**
 *Verifies that the web API is called with the right permissions i.e. the presented 
 *access token contains at least one permission that this web API requires. 
 * @param {Object} accessTokenPayload: Parsed access token payload
 * @param {Array} allowedPermissions: list of allowed permissions i.e. delegated + application
 * @returns {boolean}
 */
 const hasRequiredScopes = (accessTokenPayload, listOfPermissions) => {
     /**
      * Access tokens that have neither the 'scp' (for delegated permissions)
      *
      * An access token issued by Azure AD will have at least one of the two claims. Access tokens
      * issued to a user will have the 'scp' claim. Access tokens issued to an application will have
      * the roles claim. Access tokens that contain both claims are issued only to users, where the scp
      * claim designates the delegated permissions, while the roles claim designates the user's roles.
      */
     if (!accessTokenPayload.hasOwnProperty('scp')) {
         return false;
     } else {
         return hasRequiredDelegatedPermissions(accessTokenPayload, listOfPermissions);
     }
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
 * Ensures that the client and API have the same clientId because they are tightly coupled.
 * @param {Object} accessTokenPayload: Parsed access token payload
 * @param {Object} clientId: application ID
 */
const hasRequiredClientId = (accessTokenPayload, clientId) => {
    if (accessTokenPayload.azp != clientId) {
        return false;
    }
    return true;
};


module.exports = {
    hasRequiredDelegatedPermissions,
    hasRequiredPermissions,
};