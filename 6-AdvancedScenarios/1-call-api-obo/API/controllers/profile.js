
const { getOboToken } = require('../fetch');
const { getGraphClient } = require('../util/graphClient');
const { ResponseType } = require('@microsoft/microsoft-graph-client');
const  authConfig  = require('../authConfig');

const {
    isAppOnlyToken,
    hasRequiredDelegatedPermissions,
    hasRequiredApplicationPermissions,
} = require('../auth/permissionUtils');


exports.getProfile = async (req, res, next) => {
    if (isAppOnlyToken(req.authInfo)) {
        if (
            hasRequiredApplicationPermissions(
                req.authInfo,
                authConfig.resources.middleTierAPI.applicationPermissions.scopes
            )
        ) {
            try {
                 accessToken = await getOboToken(tokenValue);
                 let graphResponse = await getGraphClient(accessToken).api('/me').responseType(ResponseType.RAW).get();
                 graphResponse = await graphResponse.json();
                 res.status(200).send(graphResponse);
             } catch (error) {
                 console.log(error);
                 next(error);
             }
        }else {
             next(new Error('Application does not have the required permissions'));
        }
    } else {
        const userToken = req.get('authorization');
        const [bearer, tokenValue] = userToken.split(' ');
        let accessToken;
        if (
            hasRequiredDelegatedPermissions(
                req.authInfo,
                authConfig.resources.middleTierAPI.delegatedPermissions.scopes
            )
        ) {
            try {
                accessToken = await getOboToken(tokenValue);
                let graphResponse = await getGraphClient(accessToken).api('/me').responseType(ResponseType.RAW).get();
                graphResponse = await graphResponse.json();
                res.json(graphResponse);
            } catch (error) {
                console.log(error);
                next(error);
            }
        } else {
            next(new Error('User does not have the required permissions'));
        }
        
    } 
};