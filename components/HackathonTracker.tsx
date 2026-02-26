
import React, { useState, useEffect } from 'react';
import { Trophy, Calendar, ExternalLink, Plus, Trash2, Clock, AlertCircle, Filter, Edit2, CheckCircle, Circle } from 'lucide-react';
import { Hackathon, Subtask } from '../types';

type FilterType = 'all' | 'in-person' | 'virtual';

const HackathonTracker: React.FC = () => {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [linkType, setLinkType] = useState<'submit' | 'in-person'>('submit');
  const [newItem, setNewItem] = useState({ 
    name: '', 
    deadline: '', 
    link: '', 
    platform: '', 
    type: 'virtual' as 'in-person' | 'virtual',
    isMultistage: false,
    subtasks: [] as Subtask[]
  });
  const [newSubtask, setNewSubtask] = useState({ name: '', endDate: '' });

  useEffect(() => {
    const saved = localStorage.getItem('solomon_hackathons');
    if (saved) setHackathons(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('solomon_hackathons', JSON.stringify(hackathons));
  }, [hackathons]);

  const addHackathon = () => {
    // Determine deadline used for sorting/display
    let finalDeadline = newItem.deadline;
    let subtasksToSave = newItem.subtasks;

    if (newItem.isMultistage && newItem.subtasks.length > 0) {
        // Sort subtasks by date
        subtasksToSave = [...newItem.subtasks].sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());
        
        // Find first incomplete task to set as current deadline
        const activeSubtask = subtasksToSave.find(s => !s.completed);
        const targetSubtask = activeSubtask || subtasksToSave[subtasksToSave.length - 1]; // Fallback to last if all done
        
        const targetDate = new Date(targetSubtask.endDate);
        const year = targetDate.getFullYear();
        const month = String(targetDate.getMonth() + 1).padStart(2, '0');
        const day = String(targetDate.getDate()).padStart(2, '0');
        finalDeadline = `${year}-${month}-${day}`;
    }

    if (!newItem.name || !finalDeadline) return;

    const itemToSave = { ...newItem, subtasks: subtasksToSave, deadline: finalDeadline };

    if (editingId) {
      // Update existing hackathon
      setHackathons(
        hackathons.map(h => h.id === editingId ? { ...itemToSave, id: editingId } : h)
          .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
      );
      setEditingId(null);
    } else {
      // Add new hackathon
      const hack: Hackathon = {
        id: Date.now().toString(),
        ...itemToSave
      };
      setHackathons([...hackathons, hack].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()));
    }
    setNewItem({ name: '', deadline: '', link: '', platform: '', type: 'virtual', isMultistage: false, subtasks: [] });
    setIsAdding(false);
  };

  const editHackathon = (hackathon: Hackathon) => {
    setNewItem({
      name: hackathon.name,
      deadline: hackathon.deadline,
      link: hackathon.link,
      platform: hackathon.platform,
      type: hackathon.type,
      isMultistage: hackathon.isMultistage,
      subtasks: hackathon.subtasks || []
    });
    setLinkType(hackathon.link ? 'submit' : 'in-person');
    setEditingId(hackathon.id);
    setIsAdding(true);
  };

  const deleteHackathon = (id: string) => {
    setHackathons(hackathons.filter(h => h.id !== id));
  };

  const addSubtask = () => {
    if (!newSubtask.name || !newSubtask.endDate) return;
    const subtask: Subtask = {
      id: Date.now().toString(),
      ...newSubtask,
      completed: false,
      status: 'todo'
    };
    // Auto-sort subtasks by date when adding
    const updatedSubtasks = [...newItem.subtasks, subtask].sort((a, b) => 
      new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
    );
    setNewItem({ ...newItem, subtasks: updatedSubtasks });
    setNewSubtask({ name: '', endDate: '' });
  };

  const removeSubtask = (id: string) => {
    setNewItem({ ...newItem, subtasks: newItem.subtasks.filter(s => s.id !== id) });
  };

  const completeStage = (hackathonId: string, subtaskId: string) => {
    setHackathons(prevHackathons => {
      // Find the hackathon
      const hackathon = prevHackathons.find(h => h.id === hackathonId);
      if (!hackathon || !hackathon.subtasks) return prevHackathons;

      // Remove the completed subtask
      const newSubtasks = hackathon.subtasks.filter(s => s.id !== subtaskId);

      // If no remaining tasks, delete the entire hackathon
      if (newSubtasks.length === 0) {
         return prevHackathons.filter(h => h.id !== hackathonId);
      }

      // Calculate new deadline based on next task
      const sortedSubtasks = [...newSubtasks].sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());
      const nextTask = sortedSubtasks[0];
      
      let newDeadline = hackathon.deadline;
      if (nextTask) {
           const d = new Date(nextTask.endDate);
           newDeadline = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      }

      // Return updated hackathons
      return prevHackathons.map(h => {
        if (h.id === hackathonId) {
          return {
             ...h,
             subtasks: newSubtasks,
             deadline: newDeadline
          };
        }
        return h;
      });
    });
  };

  const toggleSubtask = (hackathonId: string, subtaskId: string) => {
    setHackathons(hackathons.map(h => {
      if (h.id === hackathonId && h.subtasks) {
        const newSubtasks = h.subtasks.map(s => 
            s.id === subtaskId ? { 
              ...s, 
              completed: !s.completed,
              status: (!s.completed ? 'done' : 'todo') as 'todo' | 'done'
            } : s
          );
        
        // Recalculate deadline
        const sorted = [...newSubtasks].sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());
        const active = sorted.find(s => !s.completed) || sorted[sorted.length - 1];
         
        const d = new Date(active.endDate);
        const newDeadline = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

        return {
          ...h,
          subtasks: newSubtasks,
          deadline: newDeadline
        };
      }
      return h;
    }));
  };

  const updateSubtaskStatus = (hackathonId: string, subtaskId: string, newStatus: 'todo' | 'in-progress' | 'done') => {
    setHackathons(hackathons.map(h => {
      if (h.id === hackathonId && h.subtasks) {
        const newSubtasks = h.subtasks.map(s => 
          s.id === subtaskId ? { ...s, status: newStatus, completed: newStatus === 'done' } : s
        );

        // Recalculate deadline
        const sorted = [...newSubtasks].sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());
        const active = sorted.find(s => !s.completed) || sorted[sorted.length - 1];
         
        const d = new Date(active.endDate);
        const newDeadline = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

        return {
          ...h,
          subtasks: newSubtasks,
          deadline: newDeadline
        };
      }
      return h;
    }));
  };

  const filteredHackathons = activeFilter === 'all' 
    ? hackathons 
    : hackathons.filter(h => h.type === activeFilter);

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

      {/* Filter Section */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <Filter className="w-4 h-4" />
          <span className="font-bold">Filter:</span>
        </div>
        {(['all', 'in-person', 'virtual'] as FilterType[]).map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeFilter === filter 
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20' 
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-300'
            }`}
          >
            {filter === 'all' ? 'All' : filter.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHackathons.map(h => {
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
                <div className="flex gap-2">
                  <button 
                    onClick={() => editHackathon(h)}
                    className="p-2 text-slate-600 hover:text-blue-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => deleteHackathon(h.id)}
                    className="p-2 text-slate-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-bold text-white mb-1 truncate" title={h.name}>{h.name}</h3>
              <div className="flex items-center gap-2 mb-4">
                <p className="text-xs text-slate-500">{h.platform || 'Unspecified Platform'}</p>
                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${
                  h.type === 'in-person' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {h.type === 'in-person' ? 'In-Person' : 'Virtual'}
                </span>
                {h.isMultistage && (
                  <span className="text-[10px] font-black uppercase px-2 py-1 rounded bg-purple-500/20 text-purple-400">
                    Multi-Stage
                  </span>
                )}
              </div>

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

              {/* Subtasks Section - Only show if multistage */}
              {h.isMultistage && (
                <div className="mb-6 space-y-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Submission Stage</p>
                  {h.subtasks && h.subtasks.length > 0 ? (() => {
                    const sortedSubtasks = [...h.subtasks].sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());
                    const activeSubtask = sortedSubtasks.find(s => !s.completed);
                    const totalStages = sortedSubtasks.length;
                    const completedCount = sortedSubtasks.filter(s => s.completed).length;

                    if (!activeSubtask) return null; // Should not happen if we auto-delete, but acts as fallback

                    return (
                        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                          <div className="flex justify-between items-start mb-3">
                             <div>
                                <h4 className="font-bold text-white text-md">{activeSubtask.name}</h4>
                                <p className="text-xs text-slate-400 mt-1">Stage {completedCount + 1} of {totalStages}</p>
                             </div>
                             <div className="text-right">
                                <p className="text-xs font-bold text-amber-500">Due {new Date(activeSubtask.endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</p>
                                <p className="text-[10px] text-slate-500 mt-1">
                                  {Math.ceil((new Date(activeSubtask.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days left
                                </p>
                             </div>
                          </div>
                          
                          <button
                            onClick={() => completeStage(h.id, activeSubtask.id)}
                            className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Complete This Stage
                          </button>
                        </div>
                    );
                  })() : (
                    <div className="p-2 bg-slate-800/30 rounded-lg border border-slate-800/50">
                      <p className="text-xs text-slate-600 text-center">No stages added yet</p>
                    </div>
                  )}
                </div>
              )}

              {h.link ? (
                <a 
                  href={h.link.startsWith('http') ? h.link : `https://${h.link}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center justify-center gap-2 text-sm transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Details
                </a>
              ) : (
                <div className="w-full py-2 bg-emerald-900/20 border border-emerald-700/30 text-emerald-400 rounded-lg flex items-center justify-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  Attending In Person
                </div>
              )}


            </div>
          );
        })}

        {filteredHackathons.length === 0 && !isAdding && (
          <div className="col-span-full py-20 bg-slate-900/30 border-2 border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center text-slate-500">
            <Trophy className="w-12 h-12 mb-4 opacity-20" />
            <p>No hackathons {activeFilter !== 'all' ? `(${activeFilter})` : ''} tracked yet. Ready to build something great?</p>
          </div>
        )}
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto styled-scrollbar p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black text-white mb-6">{editingId ? 'Edit Hackathon' : 'Track New Hackathon'}</h3>
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
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Hackathon Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['in-person', 'virtual'] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setNewItem({...newItem, type})}
                      className={`px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                        newItem.type === type
                          ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {type === 'in-person' ? 'In-Person' : 'Virtual'}
                    </button>
                  ))}
                </div>
              </div>
              {!newItem.isMultistage ? (
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Deadline Date</label>
                <input 
                  type="date"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  value={newItem.deadline}
                  onChange={e => setNewItem({...newItem, deadline: e.target.value})}
                />
              </div>
              ) : (
                <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-800">
                  <p className="text-sm text-slate-400">
                    <span className="text-amber-500 font-bold">Note:</span> For multi-stage hackathons, the overall deadline will be automatically set to the date of the last submission stage.
                  </p>
                </div>
              )}
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
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Application Method</label>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <button
                    type="button"
                    onClick={() => {
                      setLinkType('submit');
                      if (linkType === 'in-person') setNewItem({...newItem, link: ''});
                    }}
                    className={`px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                      linkType === 'submit'
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    Submit Link
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLinkType('in-person');
                      setNewItem({...newItem, link: ''});
                    }}
                    className={`px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                      linkType === 'in-person'
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    Attending In Person
                  </button>
                </div>
                {linkType === 'submit' ? (
                  <input 
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newItem.link}
                    onChange={e => setNewItem({...newItem, link: e.target.value})}
                    placeholder="https://hackathon.com"
                  />
                ) : (
                  <div className="w-full bg-emerald-900/20 border border-emerald-700/30 rounded-xl px-4 py-3 text-emerald-400 text-sm font-medium text-center">
                    ✓ Will attend in person
                  </div>
                )}
              </div>

              {/* Multi-Stage Toggle - Moved to bottom */}
              <div className="border-t border-slate-800 pt-4">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Multi-Stage Hackathon</label>
                <button
                  type="button"
                  onClick={() => setNewItem({...newItem, isMultistage: !newItem.isMultistage})}
                  className={`w-full px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                    newItem.isMultistage
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  <div className={`w-12 h-6 rounded-full transition-all relative ${
                    newItem.isMultistage ? 'bg-purple-800' : 'bg-slate-700'
                  }`}>
                    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                      newItem.isMultistage ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </div>
                  {newItem.isMultistage ? 'Multiple Submission Stages' : 'Single Stage'}
                </button>
              </div>

              {/* Subtasks Section - Only show if multistage is enabled */}
              {newItem.isMultistage && (
              <div className="pt-4">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 block">Submission Deadlines (Multi-Day)</label>
                
                {/* Add Subtask Form */}
                <div className="bg-slate-800/50 rounded-xl p-4 mb-3 space-y-3">
                  <input 
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={newSubtask.name}
                    onChange={e => setNewSubtask({...newSubtask, name: e.target.value})}
                    placeholder="e.g., Proposal Submission"
                  />
                  <div className="mb-2">
                    <label className="text-[10px] text-slate-600 uppercase mb-1 block">Deadline Date</label>
                    <input 
                      type="date"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      value={newSubtask.endDate}
                      onChange={e => setNewSubtask({...newSubtask, endDate: e.target.value})}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addSubtask}
                    className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm font-bold transition-colors"
                  >
                    Add Submission
                  </button>
                </div>

                {/* Subtasks List */}
                {newItem.subtasks.length > 0 && (
                  <div className="space-y-2">
                    {newItem.subtasks.map(subtask => (
                      <div key={subtask.id} className="flex items-center gap-2 bg-slate-800 rounded-lg p-3">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">{subtask.name}</p>
                          <p className="text-xs text-slate-500">
                             Due {new Date(subtask.endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSubtask(subtask.id)}
                          className="p-2 text-slate-600 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              )}
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => {
                  setIsAdding(false);
                  setEditingId(null);
                  setLinkType('submit');
                  setNewItem({ name: '', deadline: '', link: '', platform: '', type: 'virtual', isMultistage: false, subtasks: [] });
                }}
                className="flex-1 py-3 bg-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={addHackathon}
                className="flex-1 py-3 bg-amber-600 text-white rounded-xl font-black hover:bg-amber-500 transition-colors shadow-lg shadow-amber-600/20"
              >
                {editingId ? 'Update Hackathon' : 'Start Tracking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HackathonTracker;
