const checkForRequiredAuthContext = require('./claimsManager');
const AuthContext = require('../models/authContext');

const authContextGuard = (req, res, next) => {
    const acrs = AuthContext.getAuthContexts();
    const isPut = req.method === "PUT";

    
    // if there is no auth context in the db, let the request through
    const authContext = acrs
        .filter(ac => ac.tenantId === req.authInfo.tid)
        .find(ac => isPut ? ac.operation === 'UPDATE' : ac.operation === req.method)

    

    if (!!authContext) {
        // if found, check the request for the required claims
        return checkForRequiredAuthContext(req, res, next, authContext.authContextId);
    }

    next();
    
}

module.exports = authContextGuard;