const checkForRequiredAuthContext = require('./claims');

const authContextGuard = (accessMatrix) => {
    return (req, res, next) => {
        const accessRule = Object.values(accessMatrix)
            .find(rule => req.path.includes(rule.path));

        if (accessRule) {
            if (accessRule.methods.includes(req.method)) {
                return checkForRequiredAuthContext(req, res, next, accessRule);
            }

            next();
        } else {
            return res.status(403).json({ error: 'No associated access rule was found for this route' });
        }
    }
}

module.exports = authContextGuard;