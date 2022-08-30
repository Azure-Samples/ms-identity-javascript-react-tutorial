const checkForRequiredAuthContext = require('./claimsManager');
const AuthContext = require('../models/authContext');

const authContextGuard = async (req, res, next) => {
    const acrs = await AuthContext.getAuthContexts();
    const authContext = acrs
        .filter(ac => ac.tenantId === req.authInfo.tid)
        .find(ac => ac.operation === req.method)

    if (!!authContext) {
        // if found, check the request for the required claims
        return checkForRequiredAuthContext(req, res, next, authContext.authContextId);
    }

    // if there is no auth context in the db, let the request through
    next();
}

module.exports = authContextGuard;
