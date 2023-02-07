const msal = require('@azure/msal-node');
const { ResponseType } = require('@microsoft/microsoft-graph-client');

const { getOboToken } = require('../auth/onBehalfOfClient');
const { getGraphClient } = require('../utils/graphClient');
const { isAppOnlyToken, hasRequiredDelegatedPermissions } = require('../auth/permissionUtils');
const { isClientCapableOfClaimsChallenge, generateClaimsChallenge } = require('../auth/claimUtils');

const authConfig = require('../authConfig');

exports.getProfile = async (req, res, next) => {
    if (isAppOnlyToken(req.authInfo)) {
        return next(new Error('This route requires a user token'));
    }

    const userToken = req.get('authorization');
    const [bearer, tokenValue] = userToken.split(' ');

    if (hasRequiredDelegatedPermissions(req.authInfo, authConfig.protectedRoutes.profile.delegatedPermissions.scopes)) {
        try {
            const accessToken = await getOboToken(tokenValue);

            const graphResponse = await getGraphClient(accessToken)
                .api('/me')
                .responseType(ResponseType.RAW)
                .get();

            if (graphResponse.status === 401) {
                if (graphResponse.headers.get('WWW-Authenticate')) {

                    if (isClientCapableOfClaimsChallenge(req.authInfo)) {
                        /**
                         * Append the WWW-Authenticate header from the Microsoft Graph response to the response to 
                         * the client app. To learn more, visit: https://learn.microsoft.com/azure/active-directory/develop/app-resilience-continuous-access-evaluation
                         */
                        return res.status(401)
                            .set('WWW-Authenticate', graphResponse.headers.get('WWW-Authenticate').toString())
                            .json({ errorMessage: 'Continuous access evaluation resulted in claims challenge' });
                    }

                    return res.status(401).json({ errorMessage: 'Continuous access evaluation resulted in claims challenge but the client is not capable. Please enable client capabilities and try again' });
                }

                throw new Error('Unauthorized');
            }

            const graphData = await graphResponse.json();
            res.status(200).json(graphData);
        } catch (error) {
            if (error instanceof msal.InteractionRequiredAuthError) {
                if (error.claims) {
                    const claimsChallenge = generateClaimsChallenge(error.claims);

                    return res.status(401)
                        .set(claimsChallenge.headers[0], claimsChallenge.headers[1])
                        .json({ errorMessage: error.errorMessage });
                }

                return res.status(401).json(error);
            }

            next(error);
        }
    } else {
        next(new Error('User does not have the required permissions'));
    }
};
