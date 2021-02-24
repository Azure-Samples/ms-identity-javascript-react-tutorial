const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const msal = require('@azure/msal-node');
const fetch = require('node-fetch');

// Before running the sample, you will need to replace the values in the .env file, 
const config = {
    auth: {
        clientId: process.env['CLIENT_ID'],
        authority: `https://login.microsoftonline.com/${process.env['TENANT_INFO']}`,
        clientSecret: process.env['CLIENT_SECRET'],
    }
};

// Create msal application object
const cca = new msal.ConfidentialClientApplication(config);

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    const ssoToken = (req.body && req.body.ssoToken);

    try {
        const isAuthorized = await validateAccessToken(ssoToken);

        if (isAuthorized) {
            const oboRequest = {
                oboAssertion: ssoToken,
                scopes: ['User.Read'],
            }

            try {
                let response = await cca.acquireTokenOnBehalfOf(oboRequest);

                if (response.accessToken) {
                    try {
                        let apiResponse = await callResourceAPI(response.accessToken, 'https://graph.microsoft.com/v1.0/me');

                        return context.res = {
                            status: 200,
                            body: {
                                response: apiResponse,
                            },
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        };
                    } catch (error) {
                        context.log(error);

                        return context.res = {
                            status: 401,
                            body: {
                                response: "No access token"
                            }
                        };
                    }
                }
            } catch (error) {
                context.log(error);

                return context.res = {
                    status: 500,
                    body: {
                        response: JSON.stringify(error),
                    }
                };
            }
        } else {
            context.res = {
                status: 401,
                body: {
                    response: "Invalid token"
                }
            };
        }
    } catch (error) {
        context.log(error);

        context.res = {
            status: 500,
            body: {
                response: JSON.stringify(error),
            }
        };
    }
}

/**
 * Makes an authorization bearer token request 
 * to given resource endpoint.
 */
callResourceAPI = async (newTokenValue, resourceURI) => {
    let options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${newTokenValue}`,
            'Content-type': 'application/json',
        },
    };

    let response = await fetch(resourceURI, options);
    let json = await response.json();
    return json;
}

/**
 * Validates the access token for signature 
 * and against a predefined set of claims
 */
validateAccessToken = async (accessToken) => {
    if (!accessToken || accessToken === "" || accessToken === "undefined") {
        console.log('No tokens found');
        return false;
    }

    // we will first decode to get kid parameter in header
    let decodedToken;

    try {
        decodedToken = jwt.decode(accessToken, { complete: true });
    } catch (error) {
        console.log('Token cannot be decoded');
        console.log(error);
        return false;
    }

    // obtains signing keys from discovery endpoint
    let keys;

    try {
        keys = await getSigningKeys(decodedToken.header);
    } catch (error) {
        console.log('Signing keys cannot be obtained');
        console.log(error);
        return false;
    }

    // verify the signature at header section using keys
    let verifiedToken;

    try {
        verifiedToken = jwt.verify(accessToken, keys);
    } catch (error) {
        console.log('Token cannot be verified');
        console.log(error);
        return false;
    }

    /**
     * Validates the token against issuer, audience, scope
     * and timestamp, though implementation and extent vary. For more information, visit:
     * https://docs.microsoft.com/azure/active-directory/develop/access-tokens#validating-tokens
     */

    const now = Math.round((new Date()).getTime() / 1000); // in UNIX format

    const checkTimestamp = verifiedToken["iat"] <= now && verifiedToken["exp"] >= now ? true : false;
    const checkAudience = verifiedToken['aud'] === process.env['CLIENT_ID'] || verifiedToken['aud'] === 'api://' + process.env['CLIENT_ID'] ? true : false;
    const checkScope = verifiedToken['scp'] === process.env['EXPECTED_SCOPES'] ? true : false;
    const checkIssuer = verifiedToken['iss'].includes(process.env['TENANT_INFO']) ? true : false;

    if (checkTimestamp && checkAudience && checkScope && checkIssuer) {
        return true;
    }
    return false;
}

/**
 * Fetches signing keys of an access token 
 * from the authority discovery endpoint
 */
getSigningKeys = async (header) => {
    // In single-tenant apps, discovery keys endpoint will be specific to your tenant
    const jwksUri = `https://login.microsoftonline.com/${process.env['TENANT_INFO']}/discovery/v2.0/keys`
    console.log(jwksUri);

    const client = jwksClient({
        jwksUri: jwksUri
    });

    return (await client.getSigningKeyAsync(header.kid)).getPublicKey();
};