const express = require('express');

// initialize router
const router = express.Router();
const todolistController = require('../controllers/todolistController');

router.get('/todolist', todolistController.getTodos);

router.get('/todolist/:id', todolistController.getTodo);

router.post('/todolist', todolistController.postTodo);

router.put('/todolist/:id', todolistController.updateTodo);

router.delete('/todolist/:id', todolistController.deleteTodo);

module.exports = router;