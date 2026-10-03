import React, { useEffect, useState } from 'react';
import { CalendarDays, Check, Plus, Target, Trash2 } from 'lucide-react';
import { Habit, HabitSection, UnoFlipColor } from '../types';
import { sanitizeHabits } from '../utils/calendarUtils';

const STORAGE_KEY = 'solomon_habits';
const colors: Record<UnoFlipColor, { card: string; dot: string; label: string }> = {
  red: { card: 'border-red-300/70 bg-red-950 text-red-100', dot: 'bg-red-300', label: 'Red' },
  orange: { card: 'border-orange-300/70 bg-orange-950 text-orange-100', dot: 'bg-orange-300', label: 'Orange' },
  yellow: { card: 'border-yellow-200/70 bg-yellow-950 text-yellow-100', dot: 'bg-yellow-200', label: 'Yellow' },
  green: { card: 'border-green-300/70 bg-green-950 text-green-100', dot: 'bg-green-300', label: 'Green' },
  blue: { card: 'border-sky-300/70 bg-blue-950 text-sky-100', dot: 'bg-sky-300', label: 'Blue' },
  purple: { card: 'border-purple-300/70 bg-purple-950 text-purple-100', dot: 'bg-purple-300', label: 'Purple' },
};
const rainbow: UnoFlipColor[] = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];
const today = () => new Date().toISOString().slice(0, 10);

const HabitTracker: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [draft, setDraft] = useState<{ title: string; section: HabitSection; date: string }>({ title: '', section: 'bucket', date: '' });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setHabits(sanitizeHabits(JSON.parse(saved)));
    } catch (error) {
      console.error('Failed to load habits', error);
    }
  }, []);
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(habits)); window.dispatchEvent(new Event('solomon-habits-updated')); }, [habits]);

  const save = () => {
    if (!draft.title.trim()) return;
    setHabits((current) => [...current, { id: `habit-${Date.now()}`, title: draft.title.trim(), section: draft.section, color: rainbow[current.length % rainbow.length], date: draft.date || undefined, completedOn: undefined }]);
    setDraft({ title: '', section: 'bucket', date: '' });
    setIsAdding(false);
  };
  const toggle = (id: string) => setHabits((current) => current.map((habit) => habit.id === id ? { ...habit, completedOn: habit.completedOn === today() ? undefined : today() } : habit));
  const remove = (id: string) => setHabits((current) => current.filter((habit) => habit.id !== id));
  const renderSection = (section: HabitSection) => {
    const entries = habits.filter((habit) => habit.section === section);
    return <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5"><div className="mb-4 flex items-center gap-3"><div className="rounded-xl bg-slate-800 p-2 text-indigo-300">{section === 'bucket' ? <Target className="h-5 w-5" /> : <CalendarDays className="h-5 w-5" />}</div><div><h3 className="text-lg font-black text-white">{section === 'bucket' ? 'Bucket List' : 'Future Goals'}</h3><p className="text-xs text-slate-500">{section === 'bucket' ? 'Daily dreams to check off each day.' : 'Goals appear on Calendar only when dated.'}</p></div></div>{entries.length ? <div className="space-y-3">{entries.map((habit) => { const completed = habit.completedOn === today(); return <div key={habit.id} className={`flex items-center gap-3 rounded-2xl border p-4 ${colors[habit.color].card} ${completed ? 'opacity-55' : ''}`}><button onClick={() => toggle(habit.id)} className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 ${completed ? 'border-white bg-white text-slate-900' : 'border-current/50'}`} aria-label={`Mark ${habit.title} complete today`}>{completed && <Check className="h-4 w-4" />}</button><div className="min-w-0 flex-1"><p className={`font-bold ${completed ? 'line-through' : ''}`}>{habit.title}</p>{habit.date && <p className="mt-1 flex items-center gap-2 text-xs opacity-75"><CalendarDays className="h-3.5 w-3.5" />{habit.date}</p>}</div><span className={`h-3 w-3 rounded-full ${colors[habit.color].dot}`} title={colors[habit.color].label} /><button onClick={() => remove(habit.id)} className="text-current/60 hover:text-white" aria-label={`Delete ${habit.title}`}><Trash2 className="h-4 w-4" /></button></div>; })}</div> : <p className="rounded-2xl border border-dashed border-slate-700 p-8 text-center text-sm text-slate-500">Nothing here yet.</p>}</section>;
  };

  return <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="flex items-center gap-2 text-2xl font-black text-white"><Target className="h-6 w-6 text-sky-300" />My Dreams</h2><p className="mt-1 text-sm text-slate-400">Dreams use daily check-ins and a rainbow of UNO-inspired colors.</p></div><button onClick={() => setIsAdding(true)} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-500 via-yellow-400 to-blue-500 px-4 py-2 text-sm font-black text-slate-950 hover:brightness-110"><Plus className="h-4 w-4" />New Dream</button></div>{isAdding && <div className="rounded-3xl border border-sky-400/25 bg-slate-900 p-5"><div className="grid gap-4 md:grid-cols-2"><label className="text-xs font-bold uppercase tracking-widest text-slate-500">Dream description<input autoFocus value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white" placeholder="Read, travel, build..." /></label><label className="text-xs font-bold uppercase tracking-widest text-slate-500">Section<select value={draft.section} onChange={(e) => setDraft({ ...draft, section: e.target.value as HabitSection })} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white"><option value="bucket">Bucket List</option><option value="goal">Future Goals</option></select></label><label className="text-xs font-bold uppercase tracking-widest text-slate-500">Date (optional)<input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white" /></label></div><div className="mt-5 flex gap-3"><button onClick={() => setIsAdding(false)} className="flex-1 rounded-xl bg-slate-800 py-3 font-bold text-slate-300">Cancel</button><button onClick={save} className="flex-1 rounded-xl bg-gradient-to-r from-red-500 via-yellow-400 to-blue-500 py-3 font-black text-slate-950">Save Dream</button></div></div>}<div className="grid gap-6 lg:grid-cols-2">{renderSection('bucket')}{renderSection('goal')}</div></div>;
};

export default HabitTracker;
