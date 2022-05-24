const Todo = require('../models/todo');

exports.getTodo = async(req, res) => {
    const id = req.params.id;

    try {
        const todo = await Todo.getTodo(id);
        res.status(200).send(todo);
    } catch (error) {
        console.log(error);
        next(error);
    }
}

exports.getTodos = async(req, res) => {
    const owner = req.authInfo['preferred_username'];

    try {
        const todos = await Todo.getTodos(owner);
        res.status(200).send(todos);
    } catch (error) {
        console.log(error);
        next(error);
    }
}

exports.postTodo = async(req, res, next) => {
    const id = req.body.id;
    const name = req.body.name;
    const owner = req.authInfo['preferred_username'];
    const completed = req.body.completed;

    const newTodo = new Todo(id, name, owner, completed);

    try {
        let todoItem = await Todo.postTodo(newTodo);
        res.status(200).json({ message: "success", id: todoItem.insertedId });
    } catch (error) {
        console.log(error);
        next(error);
    }
}

exports.updateTodo = async(req, res, next) => {
    const id = req.params.id;

    try {
        await Todo.updateTodo(id, req.body)
        res.status(200).json({ message: "success" });
    } catch (error) {
        console.log(error);
        next(error);
    }
}

exports.deleteTodo = async(req, res, next) => {
    const id = req.params.id;
    try {
        await Todo.deleteTodo(id);
        res.status(200).json({ message: "success" });
    } catch (error) {
        console.log(error);
        next(error);
    }
}
