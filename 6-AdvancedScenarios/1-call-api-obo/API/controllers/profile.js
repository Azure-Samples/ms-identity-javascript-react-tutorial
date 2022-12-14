
const { getOboToken } = require('../fetch');
const { getGraphClient } = require('../util/graphClient');
const { ResponseType } = require('@microsoft/microsoft-graph-client');


exports.getProfile = async (req, res, next) => {
    const userToken = req.get('authorization');
    const [bearer, tokenValue] = userToken.split(' ');
    let accessToken;
    try {
        accessToken = await getOboToken(tokenValue);
        console.log(accessToken)
        let graphResponed = await getGraphClient(accessToken).api('/me').responseType(ResponseType.RAW).get();
        graphResponed = await graphResponed.json();
        res.json(graphResponed);
    } catch (error) {
        console.log(error);
        next(error);
    }
};