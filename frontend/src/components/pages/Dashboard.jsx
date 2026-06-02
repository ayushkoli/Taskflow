import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { notesService, todosService } from '../services/api';
import { FileText, CheckSquare, CheckCircle2, AlertCircle, Plus, Loader2, ArrowRight } from 'lucide-react';
import Toast from '../components/Toast';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalNotes: 0,
    totalTodos: 0,
    completedTodos: 0,
    pendingTodos: 0
  });
  const [recentNotes, setRecentNotes] = useState([]);
  const [pendingTodos, setPendingTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const navigate = useNavigate();

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch notes list (request limit=3, page=1 to get recent items and totalNotes count)
      const notesData = await notesService.getNotes('', 1, 3);
      // Fetch all todos to calculate task metrics
      const todosData = await todosService.getTodos('all');

      const completedCount = todosData.filter(t => t.completed).length;
      const pendingCount = todosData.filter(t => !t.completed).length;

      setStats({
        totalNotes: notesData.totalNotes,
        totalTodos: todosData.length,
        completedTodos: completedCount,
        pendingTodos: pendingCount
      });

      setRecentNotes(notesData.notes);
      setPendingTodos(todosData.filter(t => !t.completed).slice(0, 3));
    } catch (error) {
      setToast({ message: 'Failed to retrieve dashboard statistics.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleToggleTodo = async (id, currentCompleted) => {
    try {
      await todosService.toggleTodoStatus(id, !currentCompleted);
      setToast({ message: 'Task status updated.', type: 'success' });
      // Reload stats
      loadDashboardData();
    } catch (error) {
      setToast({ message: 'Failed to update task status.', type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-brand-900 animate-spin" />
      </div>
    );
  }

  const statItems = [
    {
      label: 'Total Notes',
      value: stats.totalNotes,
      icon: FileText,
      style: 'bg-sky-50 border-sky-100 text-sky-600',
      description: 'Quick notes written'
    },
    {
      label: 'Total Tasks',
      value: stats.totalTodos,
      icon: CheckSquare,
      style: 'bg-brand-50 border-brand-100 text-brand-600',
      description: 'Tasks in your queue'
    },
    {
      label: 'Completed Tasks',
      value: stats.completedTodos,
      icon: CheckCircle2,
      style: 'bg-emerald-50 border-emerald-100 text-emerald-600',
      description: 'Finished work items'
    },
    {
      label: 'Pending Tasks',
      value: stats.pendingTodos,
      icon: AlertCircle,
      style: 'bg-amber-50 border-amber-100 text-amber-600',
      description: 'Outstanding todos'
    }
  ];

  return (
    <div className="space-y-8 animate-slide-in">
      {/* Top Banner */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-brand-900">Workspace Dashboard</h2>
        <p className="text-sm text-brand-500 mt-1">Get an overview of your workspace activities and notes.</p>
      </div>

      {/* Grid of Stats Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statItems.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div 
              key={idx}
              className="p-5 bg-white border border-brand-100 rounded-2xl shadow-xs flex items-center justify-between hover:shadow-md transition-shadow duration-205"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-brand-400 uppercase tracking-wider">{stat.label}</span>
                <h3 className="text-2xl font-black text-brand-900 leading-none">{stat.value}</h3>
                <p className="text-xs text-brand-500">{stat.description}</p>
              </div>
              <div className={`p-3 rounded-xl ${stat.style}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Split Details Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Notes Widget */}
        <div className="p-6 bg-white border border-brand-100 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-brand-900">Recent Notes</h3>
            <Link 
              to="/notes" 
              className="text-xs font-semibold text-brand-650 hover:text-brand-900 flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {recentNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-6 text-center border border-dashed border-brand-200 rounded-xl bg-brand-50/30">
              <span className="text-2xl">📝</span>
              <p className="text-sm font-semibold text-brand-700 mt-2">No notes found</p>
              <p className="text-xs text-brand-450 mt-0.5">Start jotting down thoughts in the Notes tab.</p>
              <button 
                onClick={() => navigate('/notes')} 
                className="mt-4 px-3 py-1.5 text-xs font-semibold text-white bg-brand-900 hover:bg-brand-850 rounded-lg flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Create Note
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentNotes.map((note) => (
                <div 
                  key={note._id}
                  className="p-4 bg-brand-50/20 border border-brand-100 rounded-xl hover:bg-brand-50/50 transition-colors"
                >
                  <h4 className="text-sm font-bold text-brand-800 truncate">{note.title}</h4>
                  <p className="text-xs text-brand-500 line-clamp-2 mt-1">{note.description}</p>
                  <span className="block text-[9px] text-brand-400 mt-2 font-medium">
                    {new Date(note.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Todos Widget */}
        <div className="p-6 bg-white border border-brand-100 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-brand-900">Pending Tasks</h3>
            <Link 
              to="/todos" 
              className="text-xs font-semibold text-brand-650 hover:text-brand-900 flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {pendingTodos.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-6 text-center border border-dashed border-brand-200 rounded-xl bg-brand-50/30">
              <span className="text-2xl">🎉</span>
              <p className="text-sm font-semibold text-brand-700 mt-2">All tasks completed!</p>
              <p className="text-xs text-brand-450 mt-0.5">Nothing pending in your agenda.</p>
              <button 
                onClick={() => navigate('/todos')} 
                className="mt-4 px-3 py-1.5 text-xs font-semibold text-white bg-brand-900 hover:bg-brand-850 rounded-lg flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Add Task
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingTodos.map((todo) => (
                <div 
                  key={todo._id}
                  className="flex items-center justify-between p-3.5 bg-brand-50/20 border border-brand-100 rounded-xl hover:bg-brand-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <input 
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => handleToggleTodo(todo._id, todo.completed)}
                      className="w-4 h-4 rounded text-brand-900 border-brand-300 focus:ring-brand-900 cursor-pointer"
                    />
                    <span className="text-sm font-semibold text-brand-700 truncate">{todo.task}</span>
                  </div>
                  <span className="flex-shrink-0 px-2 py-0.5 text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-100 rounded-full">
                    Pending
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Render feedback toasts if any */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
};

export default Dashboard;
