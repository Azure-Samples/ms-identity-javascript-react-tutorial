const { ResponseType } = require('@microsoft/microsoft-graph-client');
const { getOboToken } = require('../auth/onBehalfOfClient');
const { getGraphClient } = require('../util/graphClient');
const msal = require('@azure/msal-node');

const authConfig = require('../authConfig');

const {
    isAppOnlyToken,
    hasRequiredDelegatedPermissions,
} = require('../auth/permissionUtils');
const { handleClaimsChallenge } = require("../util/claimUtils");

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
            
            const graphData = await handleClaimsChallenge(graphResponse);
            if (graphData && graphData.errorMessage === 'claims_challenge_occurred') {
                throw graphData;
            }
            res.status(200).json(graphData);
        } catch (error) {
            if(error instanceof msal.InteractionRequiredAuthError) {
                res.status(403).json(error);
            } else if (error.message === "claims_challenge_occurred") {
                res.status(401).json(error);
            } else {
                next(error);
            }
        }
    } else {
        next(new Error('User does not have the required permissions'));
    }
};
