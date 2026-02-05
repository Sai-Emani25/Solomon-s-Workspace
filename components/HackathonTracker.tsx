
import React, { useState, useEffect } from 'react';
import { Trophy, Calendar, ExternalLink, Plus, Trash2, Clock, AlertCircle } from 'lucide-react';
import { Hackathon } from '../types';

const HackathonTracker: React.FC = () => {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', deadline: '', link: '', platform: '' });

  useEffect(() => {
    const saved = localStorage.getItem('solomon_hackathons');
    if (saved) setHackathons(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('solomon_hackathons', JSON.stringify(hackathons));
  }, [hackathons]);

  const addHackathon = () => {
    if (!newItem.name || !newItem.deadline) return;
    const hack: Hackathon = {
      id: Date.now().toString(),
      ...newItem
    };
    setHackathons([...hackathons, hack].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()));
    setNewItem({ name: '', deadline: '', link: '', platform: '' });
    setIsAdding(false);
  };

  const deleteHackathon = (id: string) => {
    setHackathons(hackathons.filter(h => h.id !== id));
  };

  const getDaysRemaining = (deadline: string) => {
    const diff = new Date(deadline).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Trophy className="w-6 h-6 text-amber-500" />
          Hackathon Deadlines
        </h2>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-bold transition-all"
        >
          <Plus className="w-4 h-4" />
          Track Hackathon
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hackathons.map(h => {
          const days = getDaysRemaining(h.deadline);
          const isUrgent = days >= 0 && days <= 3;
          const isOver = days < 0;

          return (
            <div key={h.id} className={`bg-slate-900 border ${isUrgent ? 'border-amber-500/50' : 'border-slate-800'} rounded-2xl p-6 relative group overflow-hidden`}>
              {isUrgent && <div className="absolute top-0 right-0 p-1 bg-amber-500 text-black text-[10px] font-black uppercase px-2 rounded-bl-lg">Urgent</div>}
              
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-slate-800 rounded-xl text-amber-500">
                  <Trophy className="w-5 h-5" />
                </div>
                <button 
                  onClick={() => deleteHackathon(h.id)}
                  className="p-2 text-slate-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <h3 className="text-lg font-bold text-white mb-1 truncate" title={h.name}>{h.name}</h3>
              <p className="text-xs text-slate-500 mb-4">{h.platform || 'Unspecified Platform'}</p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  {new Date(h.deadline).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                </div>
                <div className={`flex items-center gap-2 text-sm font-bold ${isOver ? 'text-slate-600' : isUrgent ? 'text-amber-500' : 'text-emerald-500'}`}>
                  <Clock className="w-4 h-4" />
                  {isOver ? 'Ended' : `${days} Days Left`}
                </div>
              </div>

              {h.link && (
                <a 
                  href={h.link.startsWith('http') ? h.link : `https://${h.link}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center justify-center gap-2 text-sm transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Details
                </a>
              )}
            </div>
          );
        })}

        {hackathons.length === 0 && !isAdding && (
          <div className="col-span-full py-20 bg-slate-900/30 border-2 border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center text-slate-500">
            <Trophy className="w-12 h-12 mb-4 opacity-20" />
            <p>No hackathons tracked yet. Ready to build something great?</p>
          </div>
        )}
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black text-white mb-6">Track New Hackathon</h3>
            <div className="space-y-4 mb-8">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Hackathon Name</label>
                <input 
                  autoFocus
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  value={newItem.name}
                  onChange={e => setNewItem({...newItem, name: e.target.value})}
                  placeholder="e.g., Google HashCode"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Deadline Date</label>
                <input 
                  type="date"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  value={newItem.deadline}
                  onChange={e => setNewItem({...newItem, deadline: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Platform / Organizer</label>
                <input 
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  value={newItem.platform}
                  onChange={e => setNewItem({...newItem, platform: e.target.value})}
                  placeholder="e.g., Devpost, Unstop"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Application Link</label>
                <input 
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  value={newItem.link}
                  onChange={e => setNewItem({...newItem, link: e.target.value})}
                  placeholder="https://hackathon.com"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => setIsAdding(false)}
                className="flex-1 py-3 bg-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={addHackathon}
                className="flex-1 py-3 bg-amber-600 text-white rounded-xl font-black hover:bg-amber-500 transition-colors shadow-lg shadow-amber-600/20"
              >
                Start Tracking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HackathonTracker;
