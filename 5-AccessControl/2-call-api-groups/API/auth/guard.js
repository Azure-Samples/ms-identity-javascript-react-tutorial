const handleOverage = require('./overage');
const { requestHasRequiredAttributes } = require('../utils/permissionUtils');

const routeGuard = (accessMatrix) => {
    return async (req, res, next) => {
        if (req.authInfo.groups === undefined) {
            if (req.authInfo['_claim_names'] || req.authInfo['_claim_sources']) {
                return handleOverage(req, res, next);
            } else {
                return res.status(403).json({ error: 'No group claim found!' });
            }
        } else {
            const groups = req.authInfo['groups'];

            if (!requestHasRequiredAttributes(accessMatrix, req.path, req.method, groups)) {
                return res.status(403).json({ error: 'User does not have the group, method or path' });
            }
        }

        next();
    };
};

module.exports = routeGuard;
