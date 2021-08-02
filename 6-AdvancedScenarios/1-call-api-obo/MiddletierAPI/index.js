const express = require("express");
const morgan = require("morgan");
const passport = require("passport");
const fetch = require('node-fetch');
const config = require('./config.json');

const BearerStrategy = require('passport-azure-ad').BearerStrategy;

const options = {
    identityMetadata: `https://${config.metadata.authority}/${config.credentials.tenantID}/${config.metadata.version}/${config.metadata.discovery}`,
    issuer: `https://${config.metadata.authority}/${config.credentials.tenantID}/${config.metadata.version}`,
    clientID: config.credentials.clientID,
    validateIssuer: config.settings.validateIssuer,
    audience: config.credentials.clientID,
    loggingLevel: config.settings.loggingLevel,
    passReqToCallback: config.settings.passReqToCallback,
};

const bearerStrategy = new BearerStrategy(options, (token, done) => {
    done(null, {}, token);
});

const app = express();

app.use(morgan('dev'));

app.use(passport.initialize());

passport.use(bearerStrategy);

// Enable CORS (for local testing only -remove in production/deployment)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// This is where your API methods are exposed
app.get('/api', passport.authenticate('oauth-bearer', { session: false }),
    async (req, res) => {
        console.log('Validated claims: ', JSON.stringify(req.authInfo));

        // the access token the user sent
        const userToken = req.get('authorization');
        let tokenObj;

        try {
            // request new token and use it to call resource API on user's behalf
            tokenObj = await getNewAccessToken(userToken);

            // check for errors
            if (tokenObj['error_codes']) {
                
                /**
                 * Conditional access MFA requirement throws an AADSTS50076 error.
                 * If the user has not enrolled in MFA, an AADSTS50079 error will be thrown instead.
                 * If the user has not consented to required scopes, an AADSTS65001 error will be thrown instead.
                 * In either case, sample middle-tier API will propagate the error back to the client.
                 * For more, visit: https://docs.microsoft.com/azure/active-directory/develop/v2-conditional-access-dev-guide
                 */
                if (tokenObj['error_codes'].includes(50076) || tokenObj['error_codes'].includes(50079) || tokenObj['error_codes'].includes(65001)) {
                    return res.status(403).json(tokenObj);
                }
            }

            try {
                // access the resource with the token
                let apiResponse = await callResourceAPI(tokenObj['access_token'], config.resources.downstreamAPI.resourceUri);
                return res.status(200).json(apiResponse);
            } catch (error) {
                console.log(error);
                return res.status(403).json(error);
            }
            
        } catch (error) {
            console.log(error);
            return res.status(403).json(error);
        }
    }
);

// present the token sent from client to AAD in order to receive a new token
async function getNewAccessToken(userToken) {

    const [bearer, tokenValue] = userToken.split(' ');

    // AAD token endpoint
    const tokenEndpoint = `https://${config.metadata.authority}/${config.credentials.tenantID}/oauth2/${config.metadata.version}/token`;

    let myHeaders = new fetch.Headers();
    myHeaders.append('Content-Type', 'application/x-www-form-urlencoded');

    let urlencoded = new URLSearchParams();
    urlencoded.append('grant_type', 'urn:ietf:params:oauth:grant-type:jwt-bearer');
    urlencoded.append('client_id', config.credentials.clientID);
    urlencoded.append('client_secret', config.credentials.clientSecret);
    urlencoded.append('assertion', tokenValue);
    urlencoded.append('scope', ...config.resources.downstreamAPI.resourceScopes);
    urlencoded.append('requested_token_use', 'on_behalf_of');

    let options = {
        method: 'POST',
        headers: myHeaders,
        body: urlencoded,
    };

    let response = await fetch(tokenEndpoint, options);
    let json = response.json();

    return json;
}

async function callResourceAPI(newTokenValue, resourceURI) {
    
    let options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${newTokenValue}`,
            'Content-type': 'application/json',
            'Accept': 'application/json',
            'Accept-Charset': 'utf-8'
        },
    };
    
    let response = await fetch(resourceURI, options);
	let json = await response.json();
    return json;
}

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log("Listening on port " + port);
});

module.exports = app;