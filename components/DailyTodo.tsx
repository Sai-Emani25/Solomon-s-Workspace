import React, { useEffect, useState } from 'react';
import { CheckCircle2, Circle, ListTodo, RotateCcw } from 'lucide-react';
import { CalendarItem } from '../types';
import { CALENDAR_STORAGE_KEY, expandRecurringCalendarItems, formatDateInput, sanitizeCalendarItems, sortCalendarItems } from '../utils/calendarUtils';

const colors: Record<CalendarItem['color'], string> = {
  rose: 'border-pink-300 bg-pink-500 text-pink-950 shadow-lg shadow-pink-500/25', amber: 'border-orange-200 bg-orange-400 text-orange-950 shadow-lg shadow-orange-400/25', emerald: 'border-teal-200 bg-teal-400 text-teal-950 shadow-lg shadow-teal-400/25', blue: 'border-purple-200 bg-purple-500 text-purple-950 shadow-lg shadow-purple-500/25', slate: 'border-slate-200 bg-slate-500 text-slate-950 shadow-lg shadow-slate-500/25',
};

const DailyTodo: React.FC = () => {
  const [items, setItems] = useState<CalendarItem[]>([]);
  const today = formatDateInput(new Date());
  const save = (next: CalendarItem[]) => { setItems(next); localStorage.setItem(CALENDAR_STORAGE_KEY, JSON.stringify(next)); window.dispatchEvent(new Event('solomon-calendar-updated')); };
  const load = () => { try { const saved = localStorage.getItem(CALENDAR_STORAGE_KEY); setItems(saved ? sanitizeCalendarItems(JSON.parse(saved)) : []); } catch { setItems([]); } };
  useEffect(() => { load(); window.addEventListener('solomon-calendar-updated', load); window.addEventListener('storage', load); return () => { window.removeEventListener('solomon-calendar-updated', load); window.removeEventListener('storage', load); }; }, []);
  const todos = expandRecurringCalendarItems(items, today, today).filter((item) => !item.completed);
  const overdue = items.filter((item) => item.date < today && item.recurrence === 'none' && !item.completed);
  const baseId = (id: string) => id.match(/^(.*)-\d{4}-\d{2}-\d{2}$/)?.[1] || id;
  const toggle = (id: string) => {
    const occurrenceId = baseId(id);
    const occurrenceDate = id.match(/(\d{4}-\d{2}-\d{2})$/)?.[1] || today;
    save(sortCalendarItems(items.flatMap((item) => {
      if (item.id !== occurrenceId) return [item];
      if (item.recurrence === 'daily' || item.recurrence === 'weekly') {
        const completedDates = item.completedDates || [];
        return [{ ...item, completedDates: completedDates.includes(occurrenceDate) ? completedDates.filter((date) => date !== occurrenceDate) : [...completedDates, occurrenceDate] }];
      }
      return [];
    })));
  };
  const moveToToday = (id: string) => save(sortCalendarItems(items.map((item) => item.id === baseId(id) ? { ...item, date: today, completed: false, recurrence: 'none' } : item)));
  const complete = todos.filter((item) => item.completed).length;

  return <div className="mx-auto max-w-3xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <section className="rounded-3xl border border-indigo-500/25 bg-slate-900 p-7">
      <div className="flex items-start justify-between gap-4"><div><h2 className="flex items-center gap-2 text-2xl font-black text-white"><ListTodo className="h-6 w-6 text-indigo-400" />Daily To-Do</h2><p className="mt-2 text-slate-400">Tasks scheduled for {new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}.</p></div><span className="rounded-full bg-indigo-500/15 px-3 py-1.5 text-sm font-black text-indigo-200">{complete}/{todos.length}</span></div>
      <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-indigo-500" style={{ width: `${todos.length ? (complete / todos.length) * 100 : 0}%` }} /></div>
      <div className="mt-5 space-y-3">{todos.map((item) => <button key={item.id} onClick={() => toggle(item.id)} className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition hover:brightness-110 ${colors[item.color]} ${item.completed ? 'opacity-60' : ''}`}><>{item.completed ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <Circle className="h-5 w-5 shrink-0" />}</><span className={`flex-1 font-bold ${item.completed ? 'line-through' : ''}`}>{item.title}{item.time && <small className="ml-2 text-xs opacity-75">{item.time}</small>}</span></button>)}{todos.length === 0 && <div className="rounded-2xl border border-dashed border-slate-700 p-12 text-center text-slate-500">Nothing scheduled for today.</div>}</div>
    </section>
    {overdue.length > 0 && <section className="rounded-3xl border border-rose-500/25 bg-rose-500/5 p-6"><h3 className="mb-3 text-lg font-black text-rose-100">Unfinished earlier tasks</h3><div className="space-y-2">{overdue.map((item) => <div key={item.id} className="flex items-center gap-3 rounded-xl border border-rose-500/20 bg-slate-900/70 p-3"><span className="flex-1 font-bold text-white">{item.title} <small className="font-normal text-slate-400">{item.date}{item.time ? ` at ${item.time}` : ''}</small></span><button onClick={() => toggle(item.id)} className="rounded-lg bg-emerald-500/15 p-2 text-emerald-300" aria-label={`Complete ${item.title}`}><CheckCircle2 className="h-4 w-4" /></button><button onClick={() => moveToToday(item.id)} className="flex items-center gap-1 rounded-lg bg-indigo-500 px-3 py-2 text-xs font-bold text-white"><RotateCcw className="h-3.5 w-3.5" />Move to today</button></div>)}</div></section>}
  </div>;
};
export default DailyTodo;
