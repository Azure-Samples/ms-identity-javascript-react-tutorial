const routeGuard = (accessMatrix) => {
    return (req, res, next) => {
        if (!req.authInfo.hasOwnProperty('roles')) {
            return res.status(403).json({ error: 'No roles claim found!' });
        }

        const roles = req.authInfo['roles'];

        if (!requestHasRequiredAttributes(accessMatrix, req.path, req.method, roles)) {
            return res.status(403).json({ error: 'User does not have the role, method or path' });
        }

        next();
    };
};

/**
 * This method checks if the request has the correct roles, paths and methods
 * @param {Object} accessMatrix
 * @param {String} path
 * @param {String} method
 * @param {Array} roles
 * @returns boolean
 */
const requestHasRequiredAttributes = (accessMatrix, path, method, roles) => {
    const accessRules = Object.values(accessMatrix);

    const accessRule = accessRules
        .find((accessRule) => path.includes(accessRule.path));

    if (accessRule.methods.includes(method)) {

        const hasRole = accessRule.roles
            .some((role) => roles.includes(role));

        if (hasRole) {
            return true
        }
    }


    return false;
};

module.exports = routeGuard;
