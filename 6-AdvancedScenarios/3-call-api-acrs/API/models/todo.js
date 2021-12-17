const lowdb = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('./data/db.json');
const db = lowdb(adapter);

class Todo {

    id;
    name;
    owner;
    completed;

    constructor(id, name, owner, completed) {
        this.id = id;
        this.name = name;
        this.owner = owner;
        this.completed = completed;
    }

    static getAllTodos() {
        return db.get('todos')
            .value();
    }

    static getTodos(owner) {
        return db.get('todos')
            .filter({ owner: owner })
            .value();
    }

    static getTodo(owner, id) {
        return db.get('todos')
        .filter({owner: owner})
        .find({id: id})
        .value();
    }

    static updateTodo(owner, id, todo) {
        db.get('todos')
            .find({owner: owner, id: id})
            .assign(todo)
            .write();
    }

    static postTodo(newTodo) {
        db.get('todos').push(newTodo).write();
    }

    static deleteTodo(id, owner) {
        db.get('todos')
            .remove({ owner: owner, id: id })
            .write();
    }
}

module.exports = Todo;