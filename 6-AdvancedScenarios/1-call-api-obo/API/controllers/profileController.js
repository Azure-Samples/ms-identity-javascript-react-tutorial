const { ResponseType } = require('@microsoft/microsoft-graph-client');
const { getOboToken } = require('../auth/onBehalfOfClient');
const { getGraphClient } = require('../util/graphClient');

const authConfig = require('../authConfig');

const {
    isAppOnlyToken,
    hasRequiredDelegatedPermissions,
} = require('../auth/permissionUtils');

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

            const response = await graphResponse.json();
            res.json(response);
        } catch (error) {
            next(error);
        }
    } else {
        next(new Error('User does not have the required permissions'));
    }
};
