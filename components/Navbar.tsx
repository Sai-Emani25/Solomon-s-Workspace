
import React, { useRef } from 'react';
import { Crown, Sparkles, Menu, Download, Upload } from 'lucide-react';

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = {
      version: '2.1',
      exportDate: new Date().toISOString(),
      hubData: localStorage.getItem('solomon_hub_v2'),
      hackathons: localStorage.getItem('solomon_hackathons'),
      studyData: localStorage.getItem('solomon_study'),
      streakData: localStorage.getItem('solomon_streak'),
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `solomon-workspace-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = e.target?.result as string;
        const data = JSON.parse(json);

        if (confirm('This will replace all current data. Continue?')) {
          if (data.hubData) localStorage.setItem('solomon_hub_v2', data.hubData);
          if (data.hackathons) localStorage.setItem('solomon_hackathons', data.hackathons);
          if (data.studyData) localStorage.setItem('solomon_study', data.studyData);
          if (data.streakData) localStorage.setItem('solomon_streak', data.streakData);

          alert('Data imported successfully! Refreshing page...');
          window.location.reload();
        }
      } catch (error) {
        alert('Failed to import data. Please check the file format.');
        console.error('Import error:', error);
      }
    };
    reader.readAsText(file);
    
    // Reset input so the same file can be selected again
    event.target.value = '';
  };

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
        <div className="flex items-center gap-2">
          {/* Export Button */}
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all active:scale-95"
            title="Export all data"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* Import Button */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all active:scale-95"
            title="Import data from file"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Import</span>
          </button>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 bg-slate-900 rounded-full border border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
          <Sparkles className="w-3 h-3 text-amber-500" />
          Daily Suite v2.1
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
