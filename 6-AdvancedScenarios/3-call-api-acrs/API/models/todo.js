const mongodb = require('mongodb');
const mongoHelper = require('../utils/mongoHelper');

class Todo {

    _id;
    name;
    owner;
    completed;

    constructor(id, name, owner, completed) {
        this._id = id;
        this.name = name;
        this.owner = owner;
        this.completed = completed;
    }

    static async getAllTodos() {
        const data = await mongoHelper.getDB().collection('todo').find().toArray()
        return data;
    }

    static async getTodos(owner) {
        const data = await mongoHelper.getDB().collection('todo').find({ owner: owner }).toArray()
        return data;
    }

    static async getTodo(id) {
        const data = await mongoHelper.getDB().collection('todo').find({ _id: id });
        return data;
    }

    static async updateTodo(id, todo) {
        return (await mongoHelper.getDB().collection('todo')
            .updateOne({ _id: new mongodb.ObjectId(id) }, { $set: { name: todo.name, completed: todo.completed } }));
    }

    static async postTodo(newTodo) {
        return (await mongoHelper.getDB().collection('todo').insertOne(newTodo));
    }

    static async deleteTodo(id) {
        return (await mongoHelper.getDB().collection('todo').deleteOne({ _id: new mongodb.ObjectId(id) }));
    }
}

module.exports = Todo;
