const express = require('express');

// initialize router
const router = express.Router();
const todolist = require('../controllers/todolist');
const dashboard = require('../controllers/dashboard');

router.get('/dashboard', dashboard.getAllTodos);

router.get('/todolist', todolist.getTodos);

router.get('/todolist/:id', todolist.getTodo);

router.post('/todolist', todolist.postTodo);

router.put('/todolist/:id', todolist.updateTodo);

router.delete('/todolist/:id', todolist.deleteTodo);

module.exports = router;