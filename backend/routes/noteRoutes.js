import express from 'express';
import {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote
} from '../controllers/noteController.js';

const router = express.Router();

// GET /api/notes and POST /api/notes
router.route('/')
  .get(getNotes)
  .post(createNote);

// GET /api/notes/:id, PUT /api/notes/:id, and DELETE /api/notes/:id
router.route('/:id')
  .get(getNoteById)
  .put(updateNote)
  .delete(deleteNote);

export default router;
