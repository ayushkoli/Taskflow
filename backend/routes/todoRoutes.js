import express from 'express';
import {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo
} from '../controllers/todoController.js';

const router = express.Router();

// GET /api/todos and POST /api/todos
router.route('/')
  .get(getTodos)
  .post(createTodo);

// PUT /api/todos/:id and DELETE /api/todos/:id
router.route('/:id')
  .put(updateTodo)
  .delete(deleteTodo);

export default router;
