import mongoose from 'mongoose';

// Todo Schema definition
const todoSchema = new mongoose.Schema({
  task: {
    type: String,
    required: [true, 'Please add a task description'],
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Todo = mongoose.model('Todo', todoSchema);

export default Todo;
