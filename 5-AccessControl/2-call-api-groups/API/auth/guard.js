const handleOverage = require('./overage');
const { hasRequiredGroups, hasOverageOccurred } = require('./permissionUtils');

const routeGuard = (accessMatrix, cache) => {
    return async (req, res, next) => {
        if (req.authInfo.groups === undefined) {
            if (hasOverageOccurred(req.authInfo)) {
                return handleOverage(req, res, next, cache);
            }

            return res.status(403).json({ error: 'No group claim found!' });
        } else {
            if (!hasRequiredGroups(accessMatrix, req.path, req.method, req.authInfo['groups'])) {
                return res.status(403).json({ error: 'User does not have the group, method or path' });
            }
        }

        next();
    };
};

module.exports = routeGuard;
