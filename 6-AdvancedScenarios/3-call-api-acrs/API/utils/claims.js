const authConfig = require('../authConfig');

const isClientCapableOfClaimsChallenge = (accessTokenClaims) => {
    if (accessTokenClaims['xms_cc'] && accessTokenClaims['xms_cc'].includes('CP1')) {
        return true;
    }

    return false;
}

const checkForRequiredAuthContext = (req, res, next, accessRule) => {
    if (!req.authInfo['acrs'] || !req.authInfo['acrs'].includes(accessRule.claims)) {
        if (isClientCapableOfClaimsChallenge(req.authInfo)) {
            
            const claimsChallenge = generateClaimsChallenge(accessRule);

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

const generateClaimsChallenge = (accessRule) => {
    const clientId = authConfig.credentials.clientID;
    
    const statusCode = 401;
    
    const challenge = {
        access_token: {
            acrs: {
                essential: true,
                value: accessRule.claims
            }
        }
    };

    const base64str = Buffer.from(JSON.stringify(challenge)).toString('base64');
    const headers = ["www-authenticate", "Bearer realm=\"\", authorization_uri=\"https://login.microsoftonline.com/common/oauth2/v2.0/authorize\", client_id=\"" + clientId + "\", error=\"insufficient_claims\", claims=\"" + base64str + "\", cc_type=\"authcontext\""];
    const message = "The presented access tokens had insufficient claims. Please request for claims designated in the WWW-Authentication header and try again.";

    return {
        headers,
        statusCode,
        message
    }
}

module.exports = checkForRequiredAuthContext