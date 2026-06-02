import Todo from '../models/Todo.js';

// ==========================================
// 1. GET ALL TODOS (With optional status filters)
// ==========================================
export const getTodos = async (req, res) => {
  try {
    // Get filter parameter from URL (e.g. /api/todos?completed=true)
    const completed = req.query.completed;
    const query = {};

    // If query has completed parameter, filter list
    if (completed !== undefined) {
      // Convert URL string 'true'/'false' to actual Boolean true/false
      query.completed = (completed === 'true');
    }

    // Fetch todos from database sorted by newest first
    const todos = await Todo.find(query).sort({ createdAt: -1 });
    
    // Respond back to client with todos list
    res.status(200).json(todos);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching todos', error: error.message });
  }
};

// ==========================================
// 2. CREATE A NEW TODO
// ==========================================
export const createTodo = async (req, res) => {
  try {
    // Extract task text from request body
    const task = req.body.task;

    // Validate that task text is not empty
    if (!task) {
      return res.status(400).json({ message: 'Task description is required' });
    }

    // Create a new Mongoose document instance (completed defaults to false in schema)
    const newTodo = new Todo({
      task: task
    });

    // Save document to database
    const savedTodo = await newTodo.save();

    // Send back saved todo with success code 201 (Created)
    res.status(201).json(savedTodo);
  } catch (error) {
    res.status(500).json({ message: 'Error creating todo', error: error.message });
  }
};

// ==========================================
// 3. UPDATE TODO STATUS (Completed/Pending or Text)
// ==========================================
export const updateTodo = async (req, res) => {
  try {
    // Extract parameters from body
    const completed = req.body.completed;
    const task = req.body.task;

    // Build update object based on what was sent
    const updateData = {};
    if (completed !== undefined) {
      updateData.completed = completed;
    }
    if (task !== undefined) {
      updateData.task = task;
    }

    // Find todo by ID and apply changes
    const updatedTodo = await Todo.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true } // 'new: true' returns updated document
    );

    // If todo ID doesn't exist, send 404
    if (!updatedTodo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    res.status(200).json(updatedTodo);
  } catch (error) {
    res.status(500).json({ message: 'Error updating todo', error: error.message });
  }
};

// ==========================================
// 4. DELETE TODO
// ==========================================
export const deleteTodo = async (req, res) => {
  try {
    // Find todo by ID and delete from database
    const deletedTodo = await Todo.findByIdAndDelete(req.params.id);

    // If ID is not found, send 404
    if (!deletedTodo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    res.status(200).json({ message: 'Todo deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting todo', error: error.message });
  }
};
