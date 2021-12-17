const Todo = require('../models/todo');

exports.getTodo = (req, res) => {
    const id = req.params.id;
    const owner = req.authInfo['preferred_username'];

    try {
        const todo = Todo.getTodo(owner, id);
        res.status(200).send(todo);
    } catch (error) {
        console.log(error);
        next(error);
    }
}

exports.getTodos = (req, res) => {
    const owner = req.authInfo['preferred_username'];

    try {
        const todos = Todo.getTodos(owner);
        res.status(200).send(todos);
    } catch (error) {
        console.log(error);
        next(error);
    }
}

exports.postTodo = (req, res) => {
    const id = req.body.id;
    const name = req.body.name;
    const owner = req.authInfo['preferred_username'];
    const completed = req.body.completed;

    const newTodo = new Todo(id, name, owner, completed);

    try {
        Todo.postTodo(newTodo);
        res.status(200).json({ message: "success" });   
    } catch (error) {
        console.log(error);
        next(error);
    }
}

exports.updateTodo = (req, res) => {
    const id = req.params.id;
    const owner = req.authInfo['preferred_username'];

    try {
        Todo.updateTodo(owner, id, req.body)
        res.status(200).json({ message: "success" });   
    } catch (error) {
        console.log(error);
        next(error);
    }
}

exports.deleteTodo = (req, res) => {
    const id = req.params.id;;
    const owner = req.authInfo['preferred_username'];

    try {
        Todo.deleteTodo(id, owner);
        res.status(200).json({ message: "success" });   
    } catch (error) {
        console.log(error);
        next(error);
    }
}