const lowdb = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('./data/db.json');
const db = lowdb(adapter);

exports.getTodo = (req, res) => {
    const id = req.params.id;
    const owner = req.authInfo['preferred_username'];

    const todo = db.get('todos')
        .filter({owner: owner})
        .find({id: id})
        .value();

    if (todo) {
        res.status(200).send(todo);
    } else {
        res.status(404).send('Task not found.');
    }
}

exports.getTodos = (req, res) => {
    const owner = req.authInfo['preferred_username'];

    const todos = db.get('todos')
        .filter({owner: owner})
        .value();

    res.status(200).send(todos);
}

exports.postTodo = (req, res) => {
    db.get('todos').push(req.body).write();
    res.status(200).json({message: "success"});
}

exports.updateTodo = (req, res) => {
    const id = req.params.id;
    const owner = req.authInfo['preferred_username'];

    db.get('todos')
        .find({owner: owner, id: id})
        .assign(req.body)
        .write();

    res.status(200).json({message: "success"});
}

exports.deleteTodo = (req, res) => {
    const id = req.params.id;
    const owner = req.authInfo['preferred_username'];

    db.get('todos')
        .remove({owner: owner, id: id})
        .write();

    res.status(200).json({message: "success"});
}