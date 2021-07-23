/**
 * This custom middleware inspects the incoming request for client capabilities and auth context
 * @param {string} authContextId
 */
const checkForRequiredAuthContext = (req, res, next, authContextId) => {
    if (!req.authInfo['acrs'] || !req.authInfo['acrs'].includes(authContextId)) {
        if (isClientCapableOfClaimsChallenge(req.authInfo)) {
            
            const claimsChallenge = generateClaimsChallenge(authContextId);

            return res.status(claimsChallenge.statusCode)
                .set(claimsChallenge.headers[0], claimsChallenge.headers[1])
                .json({error: claimsChallenge.message});

        } else {
            return res.status(403).json({ error: 'Client is not capable' });
        }
    } else {
        next();
    }
}

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
const generateClaimsChallenge = (authContextId) => {
    const clientId = process.env.CLIENT_ID;
    
    const statusCode = 401;
    
    // claims challenge object
    const challenge = { access_token: { acrs: { essential: true, value: authContextId }}};

    // base64 encode the challenge object
    const base64str = Buffer.from(JSON.stringify(challenge)).toString('base64');
    const headers = ["www-authenticate", "Bearer realm=\"\", authorization_uri=\"https://login.microsoftonline.com/common/oauth2/v2.0/authorize\", client_id=\"" + clientId + "\", error=\"insufficient_claims\", claims=\"" + base64str + "\", cc_type=\"authcontext\""];
    const message = "The presented access tokens had insufficient claims. Please request for claims designated in the www-authentication header and try again.";

    return {
        headers,
        statusCode,
        message
    }
}

module.exports = checkForRequiredAuthContext