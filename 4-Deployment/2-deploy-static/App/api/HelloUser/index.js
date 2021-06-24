const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const msal = require('@azure/msal-node');
const fetch = require('node-fetch');
const UserService = require("../azure-cosmosdb-user");

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

    try {
        // get ssoToken from client request
        const ssoToken = (req.body && req.body.ssoToken);
        if (!ssoToken) throw Error({ name: "Sample-Auth", message: "no ssoToken sent from client", "status": 401 });

        // get appUser from client request
        // this isn't passed in on first request
        const appUser = (req.body && req.body.user);

        // validate client's ssoToken
        const isAuthorized = await validateAccessToken(ssoToken);
        if (!isAuthorized) throw Error({ name: "Sample-Auth", message: "can't validate access token", "status": 401 });

        // construct scope for API call - must match registered scopes
        const oboRequest = {
            oboAssertion: ssoToken,
            scopes: ['User.Read'],
        }

        // get token on behalf of user
        let response = await cca.acquireTokenOnBehalfOf(oboRequest);
        if (!response.accessToken) throw Error({ name: "Sample-Auth", message: "no access token acquired", "status": 401 });

        // call API on behalf of user
        let apiResponse = await callResourceAPI(response.accessToken, 'https://graph.microsoft.com/v1.0/me');
        if (!apiResponse) throw Error({ name: "Sample-Graph", message: "call to Graph failed", "status": 500 });

        // MongoDB (CosmosDB) connect
        const mongoDBConnected = await UserService.connect();
        if (!mongoDBConnected) throw Error({ name: "Sample-DBConnection", message: "couldn't connect to database", "status": 500 });

        let foundUser = await UserService.getUserByEmail(apiResponse.mail);

        let mongodbUser = {};
        let update = false;

        if (!foundUser) {
            // create user
            mongodbUser = {

                name: apiResponse.displayName || null,  //displayName from Graph is source of truth
                email: apiResponse.mail || null,        //email from Graph is the source of true
                favoriteColor: null
            };
            update = true;
        }
        else if (foundUser && appUser){
            // user exists and need to update
            if (appUser && appUser.email) {
                mongodbUser = {
                    name: appUser.name,
                    email: appUser.email,
                    favoriteColor: appUser.favoriteColor
                }
            }
            update=true;
        } else {
            // don't update because user not passed into API
            console.log("nothing to update in database");
        }

        // Upsert to MongoDB (CosmosDB)
        if(update){
            foundUser = await UserService.upsertByEmail(apiResponse.mail, mongodbUser);
            if (!foundUser) throw Error({ name: "Sample-DBConnection", message: "no user returned from database", "status": 500 });
        }

        // Return to client
        return context.res = {
            status: 200,
            body: {
                response: foundUser.toJSON() || null,
            },
            headers: {
                'Content-Type': 'application/json'
            }
        };

    } catch (error) {
        context.log(error);

        context.res = {
            status: error.status || 500,
            body: {
                response: error.message || JSON.stringify(error),
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