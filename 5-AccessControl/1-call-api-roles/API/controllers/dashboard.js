const lowdb = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('./data/db.json');
const db = lowdb(adapter);

exports.getAllTodos = (req, res) => {
    const owner = req.authInfo['preferred_username'];
    const domain = owner.split('@')[1];

    const todos = db.get('todos')
        .value();

    const filteredTodos = todos.filter(todo => todo.owner.includes(domain));

    res.status(200).send(filteredTodos);
}