import axios from 'axios';

// Create pre-configured Axios client instance
const API = axios.create({
  // In production, we'll set VITE_API_URL to point to Render
  // In local dev, it falls back to empty string and uses the Vite proxy
  baseURL: import.meta.env.VITE_API_URL || '', 
  headers: {
    'Content-Type': 'application/json'
  }
});

// Services related to Notes
export const notesService = {
  // Get notes with search and pagination
  getNotes: async (search = '', page = 1, limit = 6) => {
    const response = await API.get('/api/notes', {
      params: { search, page, limit }
    });
    return response.data;
  },

  // Get single note by ID
  getNoteById: async (id) => {
    const response = await API.get(`/api/notes/${id}`);
    return response.data;
  },

  // Create a note
  createNote: async (title, description, color) => {
    const response = await API.post('/api/notes', { title, description, color });
    return response.data;
  },

  // Update a note
  updateNote: async (id, title, description, color) => {
    const response = await API.put(`/api/notes/${id}`, { title, description, color });
    return response.data;
  },

  // Delete a note
  deleteNote: async (id) => {
    const response = await API.delete(`/api/notes/${id}`);
    return response.data;
  },
};

// Services related to Todos
export const todosService = {
  // Get all todos (with optional completed filter query)
  getTodos: async (filter = 'all') => {
    const params = {};
    if (filter === 'completed') {
      params.completed = true;
    } else if (filter === 'pending') {
      params.completed = false;
    }
    
    const response = await API.get('/api/todos', { params });
    return response.data;
  },

  // Create a todo task
  createTodo: async (task) => {
    const response = await API.post('/api/todos', { task });
    return response.data;
  },

  // Update todo completed status
  toggleTodoStatus: async (id, completed) => {
    const response = await API.put(`/api/todos/${id}`, { completed });
    return response.data;
  },

  // Delete a todo
  deleteTodo: async (id) => {
    const response = await API.delete(`/api/todos/${id}`);
    return response.data;
  },
};

export default API;
