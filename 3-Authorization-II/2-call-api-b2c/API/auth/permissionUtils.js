/**
 * Ensures that the access token has the specified delegated permissions.
 * @param {Object} accessTokenPayload: Parsed access token payload
 * @param {Array} requiredPermission: list of required permissions
 * @returns {boolean}
 */
const hasRequiredDelegatedPermissions = (accessTokenPayload, requiredPermission) => {
    const normalizedRequiredPermissions = requiredPermission.map((permission) => permission.toUpperCase());
    
    if (accessTokenPayload.hasOwnProperty('scp') && accessTokenPayload.scp.split(' ')
        .some(claim => normalizedRequiredPermissions.includes(claim.toUpperCase()))) {
        return true;
    }
    return false;
    
};

module.exports = {
    hasRequiredDelegatedPermissions
}; 