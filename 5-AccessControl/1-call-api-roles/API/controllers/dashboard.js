const lowdb = require('lowdb');
const FileAsync = require('lowdb/adapters/FileAsync');
const adapter = new FileAsync('./data/db.json');

const { hasDelegatedPermissions, hasApplicationPermissions } = require('../auth/permissionUtils');

const authConfig = require('../authConfig');

exports.getAllTodos = async (req, res, next) => {
    const db = await lowdb(adapter);

    if (hasDelegatedPermissions(req.authInfo, authConfig.protectedRoutes.todolist.delegatedPermissions.read)) {
        try {
            const todos = db.get('todos').value();
            res.status(200).send(todos);
        } catch (error) {
            next(error);
        }
    } else if (
        hasApplicationPermissions(req.authInfo, authConfig.protectedRoutes.todolist.applicationPermissions.read)
    ) {
        try {
            const todos = db.get('todos').value();
            res.status(200).send(todos);
        } catch (error) {
            next(error);
        }
    } else {
        next(new Error('User or application does not have the required permissions'));
    }
};
