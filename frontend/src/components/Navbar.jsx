import React from 'react';
import { Menu, Calendar } from 'lucide-react';

const Navbar = ({ onMenuToggle }) => {
  // Format current date
  const getFormattedDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between w-full h-16 px-6 bg-white border-b border-brand-100 shadow-sm">
      {/* Left side: Brand Title and Mobile hamburger menu toggle */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuToggle}
          className="p-1.5 -ml-1 rounded-lg text-brand-500 hover:bg-brand-50 hover:text-brand-900 lg:hidden focus:outline-none focus:ring-2 focus:ring-brand-200"
          aria-label="Open navigation sidebar"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <div className="flex items-center gap-2">
          <span className="text-2xl" role="img" aria-label="logo">📝</span>
          <span className="text-xl font-bold tracking-tight text-brand-900">Scribble</span>
        </div>
      </div>

      {/* Right side: Current Date and Mock User Avatar */}
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-brand-600 bg-brand-50 border border-brand-100 rounded-lg">
          <Calendar className="w-3.5 h-3.5 text-brand-400" />
          <span>{getFormattedDate()}</span>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 font-bold text-xs bg-brand-100 border border-brand-200 text-brand-700 rounded-lg">
            A
          </div>
          <div className="hidden sm:block text-left">
            <h4 className="text-xs font-semibold text-brand-850 leading-none">Ayush</h4>
            <span className="text-[10px] font-medium text-brand-400">Interview Mode</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
