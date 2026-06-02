import React, { useEffect } from 'react';
import { CheckCircle2, XCircle, AlertCircle, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    // Auto close toast after duration
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  // Dark-theme specific styles and icons
  const styles = {
    success: {
      bg: 'bg-[#064e3b]/90 border-emerald-800 text-emerald-100 shadow-emerald-950/20',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />
    },
    error: {
      bg: 'bg-[#7f1d1d]/90 border-rose-800 text-rose-100 shadow-rose-950/20',
      icon: <XCircle className="w-5 h-5 text-rose-400" />
    },
    info: {
      bg: 'bg-[#0c4a6e]/90 border-sky-800 text-sky-100 shadow-sky-950/20',
      icon: <AlertCircle className="w-5 h-5 text-sky-400" />
    }
  };

  const activeStyle = styles[type] || styles.success;

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-slide-in">
      <div className={`flex items-center gap-3 px-4 py-3.5 border rounded-xl shadow-2xl backdrop-blur-sm ${activeStyle.bg} min-w-[280px] max-w-sm`}>
        <div className="flex-shrink-0">{activeStyle.icon}</div>
        <p className="flex-1 text-sm font-semibold leading-relaxed">{message}</p>
        <button 
          onClick={onClose}
          className="flex-shrink-0 p-0.5 rounded-lg text-slate-400 hover:bg-white/10 hover:text-slate-100 focus:outline-none"
          aria-label="Close Toast"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
