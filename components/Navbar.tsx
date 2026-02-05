
import React from 'react';
import { Crown, Sparkles, Menu } from 'lucide-react';

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  return (
    <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 px-4 md:px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="p-2 hover:bg-slate-900 rounded-xl text-slate-400 hover:text-white transition-all active:scale-95"
          aria-label="Open Menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <a 
          href="https://sai-emani25.github.io/Portfolio/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 group transition-all hover:opacity-80"
        >
          <Crown className="w-7 h-7 text-amber-500 fill-amber-500/20 group-hover:scale-110 transition-transform" />
          <h1 className="text-lg font-black bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent tracking-tight hidden sm:block">
            SOLOMON
          </h1>
        </a>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1 bg-slate-900 rounded-full border border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
          <Sparkles className="w-3 h-3 text-amber-500" />
          Daily Suite v2.1
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
