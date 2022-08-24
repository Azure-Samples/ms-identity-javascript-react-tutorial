const routeGuard = (accessMatrix) => {
    return (req, res, next) => {
        if (req.authInfo.roles === undefined) {
            return res.status(403).json({ error: 'No roles claim found!' });
        } else {
            const roles = req.authInfo['roles'];

            if (requestHasRequiredAttributes(accessMatrix, req.path, req.method, roles)) {
                return res.status(403).json({ error: 'User does not have the role, method or path' });
            }
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
    const routes = Object.keys(accessMatrix);
    let hasMethod = false;
    let hasPath = false;
    let hasRoles = false;
    routes.forEach((route) => {
        if (path.includes(accessMatrix[route].path)) {
            hasPath = true;
        } else {
            hasPath = false;
        }

        if (hasPath) {
            if (accessMatrix[route].methods.includes(method)) {
                hasMethod = true;
            } else {
                hasMethod = false;
            }
        }

        if (hasPath && hasMethod) {
            let intersection = accessMatrix[route].roles.filter((role) => roles.includes(role));
            if (intersection.length < 1) {
                hasRoles = true;
            }
        }
    });

    return hasRoles;
};

module.exports = routeGuard;
