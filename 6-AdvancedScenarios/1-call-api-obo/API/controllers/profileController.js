const { getOboToken } = require('../MsalOnBehalfOfClient');
const { getGraphClient } = require('../util/graphClient');
const { ResponseType } = require('@microsoft/microsoft-graph-client');
const authConfig = require('../authConfig');

const {
    hasRequiredDelegatedPermissions,
} = require('../auth/permissionUtils');

exports.getProfile = async (req, res, next) => {
    const userToken = req.get('authorization');
    const [bearer, tokenValue] = userToken.split(' ');

    let accessToken;
    if (hasRequiredDelegatedPermissions(req.authInfo, authConfig.resources.middleTierAPI.delegatedPermissions.scopes)) {
        try {
            accessToken = await getOboToken(tokenValue);
            let graphResponse = await getGraphClient(accessToken).api('/me').responseType(ResponseType.RAW).get();
            graphResponse = await graphResponse.json();
            res.json(graphResponse);
        } catch (error) {
            next(error);
        }
    } else {
        next(new Error('User does not have the required permissions'));
    }
};
