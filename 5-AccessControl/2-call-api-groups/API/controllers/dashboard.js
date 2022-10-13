const lowdb = require('lowdb');
const FileAsync = require('lowdb/adapters/FileAsync');
const adapter = new FileAsync('./data/db.json');

const { hasRequiredDelegatedPermissions } = require('../auth/permissionUtils');

const authConfig = require('../authConfig');

exports.getAllTodos = async (req, res, next) => {
    const db = await lowdb(adapter);

    if (hasRequiredDelegatedPermissions(req.authInfo, authConfig.protectedRoutes.todolist.scopes)) {
        try {
            const todos = db.get('todos').value();
            res.status(200).send(todos);
        } catch (error) {
            next(error);
        }
    } else {
        next(new Error('User does not have the required permissions'));
    }
};
