import React, { useEffect, useState } from 'react';
import { CheckCircle2, Circle, ListTodo } from 'lucide-react';
import { CalendarItem } from '../types';
import { CALENDAR_STORAGE_KEY, formatDateInput, sanitizeCalendarItems, sortCalendarItems } from '../utils/calendarUtils';

const colors: Record<CalendarItem['color'], string> = {
  rose: 'border-rose-500/35 bg-rose-500/10 text-rose-200', amber: 'border-amber-500/35 bg-amber-500/10 text-amber-200', emerald: 'border-emerald-500/35 bg-emerald-500/10 text-emerald-200', blue: 'border-sky-500/35 bg-sky-500/10 text-sky-200', slate: 'border-slate-700 bg-slate-800 text-slate-200',
};

const DailyTodo: React.FC = () => {
  const [items, setItems] = useState<CalendarItem[]>([]);
  const today = formatDateInput(new Date());
  const load = () => { try { const saved = localStorage.getItem(CALENDAR_STORAGE_KEY); setItems(saved ? sanitizeCalendarItems(JSON.parse(saved)) : []); } catch { setItems([]); } };
  useEffect(() => { load(); window.addEventListener('solomon-calendar-updated', load); window.addEventListener('storage', load); return () => { window.removeEventListener('solomon-calendar-updated', load); window.removeEventListener('storage', load); }; }, []);
  const todos = items.filter((item) => item.date === today);
  const toggle = (id: string) => { const next = sortCalendarItems(items.map((item) => item.id === id ? { ...item, completed: !item.completed } : item)); setItems(next); localStorage.setItem(CALENDAR_STORAGE_KEY, JSON.stringify(next)); window.dispatchEvent(new Event('solomon-calendar-updated')); };
  const complete = todos.filter((item) => item.completed).length;
  return <div className="mx-auto max-w-3xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700"><div className="rounded-3xl border border-indigo-500/25 bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.16),_transparent_45%)] bg-slate-900 p-7"><div className="flex items-start justify-between gap-4"><div><h2 className="flex items-center gap-2 text-2xl font-black text-white"><ListTodo className="h-6 w-6 text-indigo-400" />Daily To-Do</h2><p className="mt-2 text-slate-400">Tasks scheduled for {new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}.</p></div><span className="rounded-full bg-indigo-500/15 px-3 py-1.5 text-sm font-black text-indigo-200">{complete}/{todos.length}</span></div><div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${todos.length ? (complete / todos.length) * 100 : 0}%` }} /></div></div><div className="space-y-3">{todos.map((item) => <button key={item.id} onClick={() => toggle(item.id)} className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition hover:brightness-110 ${colors[item.color]} ${item.completed ? 'opacity-60' : ''}`}>{item.completed ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <Circle className="h-5 w-5 shrink-0" />}<span className={`flex-1 font-bold ${item.completed ? 'text-decoration-line: line-through' : ''}`}>{item.title}</span><span className="rounded-full border border-current/20 px-2 py-1 text-[10px] font-black uppercase">{item.color === 'rose' ? 'Highly Imp' : item.color === 'amber' ? 'Priority' : item.color === 'emerald' ? 'Low Priority' : item.color === 'blue' ? 'Casual' : 'Task'}</span></button>)}{todos.length === 0 && <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 p-12 text-center text-slate-500"><ListTodo className="mx-auto mb-3 h-10 w-10 opacity-30" /><p className="font-medium">Nothing scheduled for today.</p><p className="mt-1 text-sm">Use Add Task in Hackathon Track to plan a future task.</p></div>}</div></div>;
};
export default DailyTodo;
