const checkForRequiredAuthContext = require('./claimsManager');
const AuthContext = require('../models/authContext');

const authContextGuard = (req, res, next) => {
    const acrs = AuthContext.getAuthContexts();

    if (acrs.length === 0) {
        return next();
    } else {
        const authContext = acrs.find(ac => ac.operation === req.method && ac.tenantId === req.authInfo.tid); 

        if (authContext) {
            return checkForRequiredAuthContext(req, res, next, authContext.authContextId);
        }

        return next();
    }
}

module.exports = authContextGuard;