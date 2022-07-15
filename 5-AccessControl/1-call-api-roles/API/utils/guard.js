const { hasApplicationPermissions }  = require('../auth/permissionUtils');

const routeGuard = (accessMatrix, applicationPermissions) => {
    return (req, res, next) => {
        if (req.authInfo.roles === undefined) {
            return res.status(403).json({error: 'No roles claim found!'});
        }
        else {
            const roles = req.authInfo['roles'];
            
            if (req.path.includes(accessMatrix.todolist.path)) {
                if (accessMatrix.todolist.methods.includes(req.method)) {

                    if (hasApplicationPermissions(req.authInfo , applicationPermissions)) {
                        next();
                    }else {
                         let intersection = accessMatrix.todolist.roles.filter((role) => roles.includes(role));

                         if (intersection.length < 1) {
                             return res.status(403).json({ error: 'User does not have the role' });
                         }
                    }
                } else {
                    return res.status(403).json({error: 'Method not allowed'});
                }
            } else if (req.path.includes(accessMatrix.dashboard.path)) {
                if (accessMatrix.dashboard.methods.includes(req.method)) {

                    if (hasApplicationPermissions(req.authInfo , applicationPermissions)) {
                        next();
                    }else {

                        let intersection = accessMatrix.dashboard.roles.filter((role) => roles.includes(role));

                        if (intersection.length < 1) {
                             return res.status(403).json({ error: 'User does not have the role' });
                        }  
                    } 
                } else {
                    return res.status(403).json({error: 'Method not allowed'});
                }
            } else {
                return res.status(403).json({error: 'Unrecognized path'});
            }
        }
    
        next();
    }
}


module.exports = routeGuard;