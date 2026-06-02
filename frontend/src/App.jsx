import React, { useState, useEffect } from 'react';
import { notesService, todosService } from './services/api';
import { 
  Search, Plus, Pencil, Trash2, Loader2, CheckCircle2, 
  Circle, ChevronLeft, ChevronRight, X, Calendar, ClipboardList 
} from 'lucide-react';
import Toast from './components/Toast';
import DeleteModal from './components/DeleteModal';

function App() {
  // --- STATES & STYLES ---

  // Notes States
  const [notes, setNotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [notesPage, setNotesPage] = useState(1);
  const [notesTotalPages, setNotesTotalPages] = useState(1);
  const [notesLoading, setNotesLoading] = useState(true);

  // Note Form Modal States
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteFormMode, setNoteFormMode] = useState('create'); // 'create' or 'edit'
  const [noteForm, setNoteForm] = useState({ title: '', description: '', color: 'yellow' });

  // Todos States
  const [todos, setTodos] = useState([]);
  const [newTodoText, setNewTodoText] = useState('');
  const [todoFilter, setTodoFilter] = useState('all'); // 'all', 'pending', 'completed'
  const [todosLoading, setTodosLoading] = useState(true);

  // Global Dialog states (Toast & Delete)
  const [toast, setToast] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, type: '', item: null });

  // Pastel Color mappings for Sticky Notes (Light notes with high-contrast text to look like physical paper notes)
  const colorClasses = {
    yellow: {
      card: 'bg-amber-100 border-amber-200 text-amber-950 shadow-amber-900/10',
      accent: 'border-amber-200/60',
      dot: 'bg-amber-400'
    },
    pink: {
      card: 'bg-rose-100 border-rose-200 text-rose-950 shadow-rose-900/10',
      accent: 'border-rose-200/60',
      dot: 'bg-rose-400'
    },
    green: {
      card: 'bg-emerald-100 border-emerald-200 text-emerald-950 shadow-emerald-900/10',
      accent: 'border-emerald-200/60',
      dot: 'bg-emerald-400'
    },
    blue: {
      card: 'bg-sky-100 border-sky-200 text-sky-950 shadow-sky-900/10',
      accent: 'border-sky-200/60',
      dot: 'bg-sky-400'
    },
    purple: {
      card: 'bg-purple-100 border-purple-200 text-purple-950 shadow-purple-900/10',
      accent: 'border-purple-200/60',
      dot: 'bg-purple-400'
    }
  };

  // --- ACTIONS & API HOOKS ---

  // Debounce search string for sticky notes title matching
  useEffect(() => {
    const delayTimer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setNotesPage(1); // Reset back to first page of results
    }, 300);
    return () => clearTimeout(delayTimer);
  }, [searchTerm]);

  // Load notes from Express backend
  const fetchNotes = async () => {
    try {
      setNotesLoading(true);
      const data = await notesService.getNotes(debouncedSearch, notesPage, 6);
      setNotes(data.notes);
      setNotesTotalPages(data.totalPages || 1);
    } catch (err) {
      setToast({ message: 'Failed to retrieve sticky notes.', type: 'error' });
    } finally {
      setNotesLoading(false);
    }
  };

  // Load todos from Express backend
  const fetchTodos = async () => {
    try {
      setTodosLoading(true);
      const data = await todosService.getTodos(todoFilter);
      setTodos(data);
    } catch (err) {
      setToast({ message: 'Failed to load task list.', type: 'error' });
    } finally {
      setTodosLoading(false);
    }
  };

  // Initial mount load triggers
  useEffect(() => {
    fetchNotes();
  }, [debouncedSearch, notesPage]);

  useEffect(() => {
    fetchTodos();
  }, [todoFilter]);

  // Handle Note Save (Create or Update)
  const handleNoteSubmit = async (e) => {
    e.preventDefault();

    if (!noteForm.title.trim() || !noteForm.description.trim()) {
      setToast({ message: 'Please enter both a title and description.', type: 'error' });
      return;
    }

    try {
      if (noteFormMode === 'create') {
        await notesService.createNote(noteForm.title, noteForm.description, noteForm.color);
        setToast({ message: 'Sticky note added successfully.', type: 'success' });
      } else {
        await notesService.updateNote(noteForm._id, noteForm.title, noteForm.description, noteForm.color);
        setToast({ message: 'Sticky note updated successfully.', type: 'success' });
      }

      setIsNoteModalOpen(false);
      setNoteForm({ title: '', description: '', color: 'yellow' });
      fetchNotes();
    } catch (err) {
      setToast({ message: 'Error saving sticky note details.', type: 'error' });
    }
  };

  // Handle Todo Submission
  const handleTodoSubmit = async (e) => {
    e.preventDefault();
    if (!newTodoText.trim()) {
      setToast({ message: 'Task description cannot be empty.', type: 'error' });
      return;
    }

    try {
      await todosService.createTodo(newTodoText);
      setToast({ message: 'Task added successfully.', type: 'success' });
      setNewTodoText('');
      fetchTodos();
    } catch (err) {
      setToast({ message: 'Failed to add task.', type: 'error' });
    }
  };

  // Toggle Todo completed box status
  const handleToggleTodo = async (id, currentCompleted) => {
    try {
      await todosService.toggleTodoStatus(id, !currentCompleted);
      fetchTodos();
    } catch (err) {
      setToast({ message: 'Failed to update task status.', type: 'error' });
    }
  };

  // Request deletion dialog trigger
  const requestDelete = (type, item) => {
    setDeleteConfirm({ isOpen: true, type, item });
  };

  // Confirm delete operation
  const confirmDelete = async () => {
    const { type, item } = deleteConfirm;
    if (!item) return;

    try {
      if (type === 'note') {
        await notesService.deleteNote(item._id);
        setToast({ message: 'Sticky note removed.', type: 'success' });
        // Adjust pagination page if last item of page gets deleted
        if (notes.length === 1 && notesPage > 1) {
          setNotesPage(notesPage - 1);
        } else {
          fetchNotes();
        }
      } else if (type === 'todo') {
        await todosService.deleteTodo(item._id);
        setToast({ message: 'Task removed.', type: 'success' });
        fetchTodos();
      }
    } catch (err) {
      setToast({ message: `Failed to remove ${type}.`, type: 'error' });
    } finally {
      setDeleteConfirm({ isOpen: false, type: '', item: null });
    }
  };

  // Open Edit Note mode
  const openEditNote = (note) => {
    setNoteFormMode('edit');
    setNoteForm(note);
    setIsNoteModalOpen(true);
  };

  // Open Create Note Mode
  const openCreateNote = () => {
    setNoteFormMode('create');
    setNoteForm({ title: '', description: '', color: 'yellow' });
    setIsNoteModalOpen(true);
  };

  // Helper date format generator
  const getTodayDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Calculate task counts
  const totalTodosCount = todos.length;
  const completedTodosCount = todos.filter(t => t.completed).length;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-neutral-950 via-[#0d0d0f] to-black text-slate-100">
      
      {/* 1. Navbar (Premium black blur) */}
      <header className="sticky top-0 z-30 h-16 px-6 bg-black/60 backdrop-blur-md border-b border-neutral-800/80 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Notes SVG Icon */}
          <svg className="w-5 h-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <line x1="10" y1="9" x2="8" y2="9" />
          </svg>
          {/* App Title */}
          <h1 className="text-lg font-extrabold tracking-tight">Taskflow</h1>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-semibold text-slate-350">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>{getTodayDate()}</span>
        </div>
      </header>

      {/* 2. Main Content Split Panel */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ================= NOTES SECTION (LEFT COLUMN) ================= */}
        <section className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">My Sticky Notes</h2>
            </div>
            
            <button
              onClick={openCreateNote}
              className="px-4 py-2.5 text-xs font-bold text-black bg-white hover:bg-neutral-100 rounded-xl shadow-lg flex items-center justify-center gap-1.5 self-start sm:self-auto transition-all duration-150"
            >
              <Plus className="w-4 h-4" /> Add Sticky Note
            </button>
          </div>

          {/* Search bar */}
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search sticky notes by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-full bg-neutral-900/60 border border-neutral-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-500/10 focus:border-slate-700 text-slate-100 placeholder-slate-650"
            />
          </div>

          {/* Sticky Notes Grid */}
          {notesLoading ? (
            <div className="flex items-center justify-center min-h-[250px]">
              <Loader2 className="w-6 h-6 text-slate-500 animate-spin" />
            </div>
          ) : notes.length === 0 ? (
            /* Notes Empty State */
            <div className="flex flex-col items-center justify-center py-20 text-center bg-neutral-900/40 border border-neutral-800/80 rounded-2xl shadow-inner">
              <span className="text-3xl" role="img" aria-label="empty note">📝</span>
              <h3 className="text-sm font-bold mt-3 text-slate-200">No sticky notes found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs px-4">
                {debouncedSearch 
                  ? `No sticky notes match the title "${debouncedSearch}".`
                  : "Add your first sticky note to hold reference thoughts."
                }
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Cards Grid */}
              <div className="grid gap-5 sm:grid-cols-2">
                {notes.map((note) => {
                  const style = colorClasses[note.color] || colorClasses.yellow;
                  return (
                    <div
                      key={note._id}
                      className={`relative border rounded-2xl p-5 flex flex-col justify-between min-h-[190px] shadow-sm transform hover:scale-[1.02] hover:-rotate-1 hover:shadow-md transition-all duration-200 group ${style.card}`}
                    >
                      {/* Decorative Sticky Pin Pinpoint */}
                      <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center justify-center">
                        <div className={`w-2 h-2 rounded-full shadow-inner ${style.dot}`}></div>
                      </div>

                      {/* Header Title */}
                      <div className="pt-2">
                        <h4 className="font-bold text-sm tracking-tight line-clamp-1">{note.title}</h4>
                        {/* Description Content */}
                        <p className="text-xs mt-2.5 leading-relaxed font-semibold whitespace-pre-wrap line-clamp-5">
                          {note.description}
                        </p>
                      </div>

                      {/* Bottom Footer metadata & tools */}
                      <div className={`mt-5 pt-3.5 border-t border-dashed flex items-center justify-between text-[10px] font-bold text-black/50 ${style.accent}`}>
                        <span>
                          {new Date(note.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                        
                        <div className="flex gap-1">
                          <button
                            onClick={() => openEditNote(note)}
                            className="p-1 rounded-md hover:bg-black/5 text-black/70"
                            title="Edit Note"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => requestDelete('note', note)}
                            className="p-1 rounded-md hover:bg-black/10 text-black/70"
                            title="Delete Note"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Simple notes pagination */}
              {notesTotalPages > 1 && (
                <div className="flex items-center justify-center gap-1">
                  <button
                    onClick={() => setNotesPage(prev => Math.max(prev - 1, 1))}
                    disabled={notesPage === 1}
                    className="p-1.5 border border-neutral-800 rounded-lg bg-neutral-900/60 text-slate-350 hover:bg-neutral-800 disabled:opacity-50"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-bold text-slate-200 px-3 py-1 bg-neutral-900/60 border border-neutral-800 rounded-lg">
                    {notesPage} / {notesTotalPages}
                  </span>
                  <button
                    onClick={() => setNotesPage(prev => Math.min(prev + 1, notesTotalPages))}
                    disabled={notesPage === notesTotalPages}
                    className="p-1.5 border border-neutral-800 rounded-lg bg-neutral-900/60 text-slate-350 hover:bg-neutral-800 disabled:opacity-50"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        {/* ================= TODOS CHECKLIST (RIGHT COLUMN) ================= */}
        <section className="space-y-6">
          <div className="p-6 bg-neutral-900/40 border border-neutral-800/80 rounded-2xl shadow-lg backdrop-blur-md">
            <div className="border-b border-neutral-800/80 pb-3.5 mb-4">
              <h2 className="text-base font-extrabold text-slate-100">Task Checklist</h2>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                {totalTodosCount > 0 
                  ? `${completedTodosCount} of ${totalTodosCount} tasks completed`
                  : 'Zero agenda items'
                }
              </p>
            </div>

            {/* Inline Add Todo Form */}
            <form onSubmit={handleTodoSubmit} className="flex gap-1.5 mb-5">
              <input
                type="text"
                placeholder="Add a new task..."
                value={newTodoText}
                onChange={(e) => setNewTodoText(e.target.value)}
                maxLength={80}
                className="px-3 py-2 flex-1 bg-neutral-950 border border-neutral-850 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-500/10 focus:border-neutral-700 text-slate-100 placeholder-slate-500"
                required
              />
              <button
                type="submit"
                className="px-3.5 py-2 text-xs font-bold text-black bg-white hover:bg-neutral-100 rounded-xl"
              >
                Add
              </button>
            </form>

            {/* Filter Tabs */}
            <div className="flex gap-1 bg-neutral-950 p-1 border border-neutral-850 rounded-xl mb-4 text-[10px] font-bold">
              {['all', 'pending', 'completed'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setTodoFilter(tab)}
                  className={`flex-1 py-1.5 rounded-lg capitalize transition-all focus:outline-none ${
                    todoFilter === tab
                      ? 'bg-neutral-900 text-slate-100 shadow-sm border border-neutral-800/60'
                      : 'text-slate-450 hover:text-slate-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Todo items list */}
            {todosLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
              </div>
            ) : todos.length === 0 ? (
              /* Todos Empty State */
              <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-neutral-800 rounded-xl bg-neutral-950/20">
                <ClipboardList className="w-5 h-5 text-slate-500" />
                <p className="text-[11px] font-semibold text-slate-400 mt-2">No tasks found</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {todos.map((todo) => (
                  <div
                    key={todo._id}
                    className={`flex items-center justify-between p-3 border rounded-xl transition-all duration-150 group bg-neutral-950/30 ${
                      todo.completed ? 'border-neutral-850/60 bg-neutral-950/10' : 'border-neutral-850 hover:border-neutral-750'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <button
                        type="button"
                        onClick={() => handleToggleTodo(todo._id, todo.completed)}
                        className="flex-shrink-0 text-slate-500 hover:text-slate-350 focus:outline-none"
                      >
                        {todo.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Circle className="w-4 h-4 text-neutral-600 hover:text-slate-400" />
                        )}
                      </button>
                      
                      <span className={`text-xs font-semibold truncate select-none leading-none ${
                        todo.completed ? 'line-through text-slate-500 font-medium' : 'text-slate-200'
                      }`}>
                        {todo.task}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => requestDelete('todo', todo)}
                      className="p-1 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

      </main>

      {/* ================= MODALS & OVERLAYS ================= */}

      {/* Note Creator/Editor Modal */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs" 
            onClick={() => setIsNoteModalOpen(false)}
          ></div>
          
          <div className="relative bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-6 shadow-2xl transform transition-all animate-slide-in">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-100">
                {noteFormMode === 'create' ? 'Create Sticky Note' : 'Edit Sticky Note'}
              </h3>
              <button
                onClick={() => setIsNoteModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-neutral-800 hover:text-slate-100 focus:outline-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleNoteSubmit} className="space-y-4">
              {/* Title input */}
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Title</label>
                <input
                  type="text"
                  placeholder="Sticky note topic..."
                  value={noteForm.title}
                  onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                  maxLength={60}
                  className="px-3 py-2 w-full bg-neutral-950 border border-neutral-850 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-500/10 focus:border-neutral-700 focus:bg-neutral-950 text-slate-100"
                  required
                />
              </div>

              {/* Description body */}
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Content</label>
                <textarea
                  placeholder="Jot down notes details..."
                  value={noteForm.description}
                  onChange={(e) => setNoteForm({ ...noteForm, description: e.target.value })}
                  rows={4}
                  className="px-3 py-2 w-full bg-neutral-950 border border-neutral-850 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-500/10 focus:border-neutral-700 focus:bg-neutral-950 text-slate-100 resize-none"
                  required
                ></textarea>
              </div>

              {/* Sticky Color picker */}
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">Sticky Note Color</label>
                <div className="flex gap-2.5">
                  {Object.keys(colorClasses).map((col) => {
                    // Map background dot colors
                    const dotColors = {
                      yellow: 'bg-amber-300',
                      pink: 'bg-rose-350',
                      green: 'bg-emerald-300',
                      blue: 'bg-sky-300',
                      purple: 'bg-purple-300'
                    };
                    const dotClass = dotColors[col] || 'bg-amber-300';
                    const isSelected = noteForm.color === col;
                    return (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setNoteForm({ ...noteForm, color: col })}
                        className={`w-7 h-7 rounded-full flex items-center justify-center focus:outline-none border-2 transition-all ${dotClass} ${
                          isSelected ? 'border-slate-150 scale-110 shadow-md' : 'border-transparent hover:scale-105'
                        }`}
                        title={`Select ${col} sticky note`}
                      ></button>
                    );
                  })}
                </div>
              </div>

              {/* Save actions */}
              <div className="flex justify-end gap-2.5 pt-4 border-t border-neutral-800 mt-6">
                <button
                  type="button"
                  onClick={() => setIsNoteModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-350 bg-neutral-800 hover:bg-neutral-750 border border-neutral-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-2 text-xs font-bold text-black bg-white hover:bg-neutral-100 border border-neutral-800 rounded-xl"
                >
                  {noteFormMode === 'create' ? 'Create Note' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Universal Delete Confirmation */}
      <DeleteModal
        isOpen={deleteConfirm.isOpen}
        title={`Delete ${deleteConfirm.type === 'note' ? 'Sticky Note' : 'Task'}`}
        message={`Are you sure you want to permanently delete this ${deleteConfirm.type === 'note' ? 'sticky note' : 'task'}?`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, type: '', item: null })}
      />

      {/* Global Success/Error Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default App;
