const lowdb = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('./data/db.json');
const db = lowdb(adapter);

const { hasDelegatedPermissions, hasApplicationPermissions } = require('../auth/permissionUtils');

const authConfig = require('../authConfig');

exports.getAllTodos = (req, res, next) => {
     if (hasDelegatedPermissions(req.authInfo, authConfig.protectedRoutes.todolist.delegatedPermissions.read)) {
        try {

            const todos = db.get('todos').value();
            res.status(200).send(todos);

        }catch(error) {
             next(error);
        }
     }else if(hasApplicationPermissions(req.authInfo, authConfig.protectedRoutes.todolist.applicationPermissions.read)) {
        try  {
             const todos = db.get('todos').value();
             res.status(200).send(todos);

        }catch(error) {
            next(error);
        }
     }else {
        next(new Error('User or application does not have the required permissions'));
     }

}