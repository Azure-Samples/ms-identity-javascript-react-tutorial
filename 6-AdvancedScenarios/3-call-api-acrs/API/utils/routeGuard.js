const checkForRequiredAuthContext = require('./claimsManager');
const AuthContext = require('../models/authContext');

const authContextGuard = (req, res, next) => {
    const acrs = AuthContext.getAuthContexts();

    // if there is no auth context in the db, let the request through
    if (acrs.length === 0) {
        return next();
    } else {
        const authContext = acrs.find(ac => ac.operation === req.method && ac.tenantId === req.authInfo.tid); 

        if (authContext) {
            // if found, check the request for the required claims
            return checkForRequiredAuthContext(req, res, next, authContext.authContextId);
        }

        next();
    }
}

module.exports = authContextGuard;