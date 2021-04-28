const handleOverage = require('./overage');

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

            if (req.path.includes(accessMatrix.todolist.path)) {
                if (accessMatrix.todolist.methods.includes(req.method)) {

                    let intersection = accessMatrix.todolist.groups
                        .filter(group => groups.includes(group));

                    if (intersection.length < 1) {
                        return res.status(403).json({ error: 'User does not have the group' });
                    }
                } else {
                    return res.status(403).json({ error: 'Method not allowed' });
                }
            } else if (req.path.includes(accessMatrix.dashboard.path)) {
                if (accessMatrix.dashboard.methods.includes(req.method)) {

                    let intersection = accessMatrix.dashboard.groups
                        .filter(group => groups.includes(group));

                    if (intersection.length < 1) {
                        return res.status(403).json({ error: 'User does not have the group' });
                    }
                } else {
                    return res.status(403).json({ error: 'Method not allowed' });
                }
            } else {
                return res.status(403).json({ error: 'Unrecognized path' });
            }
        }

        next();
    }
}

module.exports = routeGuard;