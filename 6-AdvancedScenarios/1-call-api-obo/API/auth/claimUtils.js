
const authConfig = require('../authConfig');

/**
 * xms_cc claim in the access token indicates that the client app of user is capable of
 * handling claims challenges. See for more: https://docs.microsoft.com/en-us/azure/active-directory/develop/claims-challenge#client-capabilities
 * @param {Object} accessTokenClaims: 
 */
const isClientCapableOfClaimsChallenge = (accessTokenClaims) => {
    if (accessTokenClaims['xms_cc'] && accessTokenClaims['xms_cc'].includes('CP1')) {
        return true;
    }

    return false;
}

/**
 * Generates www-authenticate header and claims challenge for a given authentication context id. For more information, see: 
 * https://docs.microsoft.com/en-us/azure/active-directory/develop/claims-challenge#claims-challenge-header-format
 */
const generateClaimsChallenge = (claims) => {
    const clientId = authConfig.credentials.clientID;

    // base64 encode the challenge object
    let bufferObj = Buffer.from(claims, 'utf8');
    let base64str = bufferObj.toString('base64');
    const headers = ["WWW-Authenticate", "Bearer realm=\"\", authorization_uri=\"https://login.microsoftonline.com/common/oauth2/v2.0/authorize\", client_id=\"" + clientId + "\", error=\"insufficient_claims\", claims=\"" + base64str + "\""];

    return {
        headers
    };
}

module.exports = {
    isClientCapableOfClaimsChallenge,
    generateClaimsChallenge
}