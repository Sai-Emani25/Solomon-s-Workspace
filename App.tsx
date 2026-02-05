
import React, { useState } from 'react';
import Navbar from './components/Navbar';
import StreakTracker from './components/StreakTracker';
import ToolGrid from './components/ToolGrid';
import Hub from './components/Hub';
import AppMaker from './components/AppMaker';
import HackathonTracker from './components/HackathonTracker';
import StudyTracker from './components/StudyTracker';
import { 
  Sparkles, 
  Globe, 
  Settings2, 
  Smartphone, 
  Trophy, 
  BookOpen, 
  X,
  ChevronRight,
  LayoutDashboard
} from 'lucide-react';
import { AppTab } from './types';

const App: React.FC = () => {
  // Set initial tab to 'hackathons' as requested
  const [activeTab, setActiveTab] = useState<AppTab>('hackathons');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { id: 'hackathons' as AppTab, label: 'Hackathon Track', icon: Trophy, color: 'text-amber-400' },
    { id: 'study' as AppTab, label: 'Study Master', icon: BookOpen, color: 'text-blue-400' },
    { id: 'hub' as AppTab, label: 'Workspace Hub', icon: Globe, color: 'text-indigo-400' },
    { id: 'tools' as AppTab, label: 'Utility Suite', icon: Settings2, color: 'text-purple-400' },
    { id: 'app-maker' as AppTab, label: 'APK Generator', icon: Smartphone, color: 'text-emerald-400' },
  ];

  const handleTabChange = (tab: AppTab) => {
    setActiveTab(tab);
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-indigo-500 selection:text-white bg-slate-950">
      <Navbar onMenuClick={() => setIsMenuOpen(true)} />
      
      {/* Sidebar Drawer Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Sidebar Drawer */}
      <aside className={`fixed top-0 left-0 bottom-0 z-[70] w-72 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ease-out shadow-2xl ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-indigo-500" />
            <span className="font-black text-white tracking-widest text-sm uppercase">Navigation</span>
          </div>
          <button 
            onClick={() => setIsMenuOpen(false)}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`w-full flex items-center justify-between p-4 rounded-xl font-bold transition-all group ${
                activeTab === item.id 
                  ? 'bg-indigo-600 text-white shadow-lg' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-white' : item.color}`} />
                <span>{item.label}</span>
              </div>
              <ChevronRight className={`w-4 h-4 transition-transform ${activeTab === item.id ? 'translate-x-0' : '-translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0'}`} />
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-800 bg-slate-900/50">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4">Quick Links</p>
          <div className="space-y-3">
             <a href="https://sai-emani25.github.io/Portfolio/" target="_blank" rel="noreferrer" className="block text-xs text-slate-400 hover:text-white transition-colors">Developer Portfolio</a>
             <a href="https://sai-emani25.github.io/Solomon-s-Order/" target="_blank" rel="noreferrer" className="block text-xs text-slate-400 hover:text-white transition-colors">Solomon's Order</a>
          </div>
        </div>
      </aside>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 py-8 md:py-12">
        {/* Header Section */}
        <section className="text-center mb-12 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/10 blur-[100px] -z-10 rounded-full" />
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">
            Solomon's <span className="text-amber-500">Daily Workspace</span>
          </h2>
          <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto">
            {menuItems.find(i => i.id === activeTab)?.label} — Personalized productivity environment.
          </p>
        </section>

        {/* Dynamic Content */}
        <div className="min-h-[500px] pb-20">
          {activeTab === 'hub' && <Hub onNavigate={handleTabChange} />}
          {activeTab === 'hackathons' && <HackathonTracker />}
          {activeTab === 'study' && <StudyTracker />}
          {activeTab === 'tools' && (
            <div className="animate-in fade-in duration-700">
              <div className="flex items-center gap-2 mb-8">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h2 className="text-2xl font-bold text-white">Utility Suite</h2>
              </div>
              <ToolGrid />
            </div>
          )}
          {activeTab === 'app-maker' && <AppMaker />}
        </div>

        {/* Streak Tracker moved to the bottom */}
        <div className="mt-12">
          <StreakTracker />
        </div>

        {/* Footer Text */}
        <footer className="text-center text-slate-500 py-12 border-t border-slate-800 mt-12">
          <p className="text-sm">© {new Date().getFullYear()} Solomon's Daily Tools. Privacy focused. Locally processed.</p>
          <p className="text-[10px] mt-2 uppercase tracking-widest opacity-50 font-black">Powered by Excellence</p>
        </footer>
      </main>
    </div>
  );
};

export default App;
