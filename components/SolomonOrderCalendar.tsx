import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Plus, Trash2, Trophy } from 'lucide-react';
import { CalendarItem, Hackathon } from '../types';
import {
  CALENDAR_MIN_DATE,
  CALENDAR_STORAGE_KEY,
  clampMonthToCalendarRange,
  compareDateStrings,
  formatDateInput,
  getCalendarMaxDate,
  isCalendarDateAllowed,
  parseLocalDate,
  sanitizeCalendarItems,
  sortHackathonsByDeadline,
} from '../utils/calendarUtils';

const colorClasses: Record<NonNullable<CalendarItem['color']>, string> = {
  amber: 'bg-amber-200 text-amber-950 border border-amber-300/80',
  emerald: 'bg-emerald-300 text-emerald-950 border border-emerald-400/70',
  rose: 'bg-rose-400 text-rose-950 border border-rose-300/70',
  blue: 'bg-sky-300 text-sky-950 border border-sky-400/70',
};

const palette = ['amber', 'rose', 'emerald', 'blue'] as const;

const getHackathonColor = (hackathon: Hackathon): CalendarItem['color'] => {
  const index = hackathon.name.length % palette.length;
  return palette[index];
};

const getMonthDays = (month: Date): Date[] => {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstDay = new Date(year, monthIndex, 1);
  const start = new Date(firstDay);
  start.setDate(firstDay.getDate() - firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const value = new Date(start);
    value.setDate(start.getDate() + index);
    return value;
  });
};

const SolomonOrderCalendar: React.FC = () => {
  const [viewMonth, setViewMonth] = useState(() => clampMonthToCalendarRange(new Date()));
  const [manualItems, setManualItems] = useState<CalendarItem[]>([]);
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [draft, setDraft] = useState<{ title: string; date: string; color: CalendarItem['color'] }>({
    title: '',
    date: formatDateInput(clampMonthToCalendarRange(new Date())),
    color: 'amber',
  });

  useEffect(() => {
    try {
      const savedCalendar = localStorage.getItem(CALENDAR_STORAGE_KEY);
      if (savedCalendar) {
        setManualItems(sanitizeCalendarItems(JSON.parse(savedCalendar)));
      }
    } catch (error) {
      console.error('Failed to parse saved calendar items', error);
    }

    try {
      const savedHackathons = localStorage.getItem('solomon_hackathons');
      if (savedHackathons) {
        setHackathons(sortHackathonsByDeadline(JSON.parse(savedHackathons)));
      }
    } catch (error) {
      console.error('Failed to parse hackathons for calendar', error);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(CALENDAR_STORAGE_KEY, JSON.stringify(sanitizeCalendarItems(manualItems)));
  }, [manualItems]);

  const minMonth = useMemo(() => new Date(2026, 0, 1), []);
  const maxMonth = useMemo(() => {
    const max = parseLocalDate(getCalendarMaxDate());
    return new Date(max.getFullYear(), max.getMonth(), 1);
  }, []);

  const allItems = useMemo(() => {
    const hackathonItems: CalendarItem[] = hackathons
      .filter((hackathon) => isCalendarDateAllowed(hackathon.deadline))
      .map((hackathon) => ({
        id: `hackathon-${hackathon.id}`,
        title: hackathon.name,
        date: hackathon.deadline,
        color: getHackathonColor(hackathon),
        source: 'hackathon',
        link: hackathon.link,
      }));

    return [...sanitizeCalendarItems(manualItems), ...hackathonItems].sort((left, right) => {
      const dateDiff = compareDateStrings(left.date, right.date);
      if (dateDiff !== 0) return dateDiff;
      return left.title.localeCompare(right.title);
    });
  }, [hackathons, manualItems]);

  const itemsByDate = useMemo(() => {
    return allItems.reduce<Record<string, CalendarItem[]>>((accumulator, item) => {
      accumulator[item.date] = [...(accumulator[item.date] || []), item];
      return accumulator;
    }, {});
  }, [allItems]);

  const visibleDays = useMemo(() => getMonthDays(viewMonth), [viewMonth]);

  const addItem = () => {
    const title = draft.title.trim();
    if (!title || !isCalendarDateAllowed(draft.date)) return;

    setManualItems((previous) => sanitizeCalendarItems([
      ...previous,
      {
        id: Date.now().toString(),
        title,
        date: draft.date,
        color: draft.color,
        source: 'manual',
      },
    ]));

    setDraft({
      title: '',
      date: formatDateInput(viewMonth),
      color: draft.color,
    });
    setIsAdding(false);
  };

  const removeItem = (id: string) => {
    setManualItems((previous) => previous.filter((item) => item.id !== id));
  };

  const moveMonth = (direction: -1 | 1) => {
    setViewMonth((previous) => clampMonthToCalendarRange(new Date(previous.getFullYear(), previous.getMonth() + direction, 1)));
  };

  const canGoPrevious = viewMonth.getTime() > minMonth.getTime();
  const canGoNext = viewMonth.getTime() < maxMonth.getTime();

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="rounded-[24px] border border-amber-500/20 bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.08),_transparent_45%),linear-gradient(180deg,rgba(15,23,42,0.95),rgba(2,6,23,0.98))] p-3 md:p-4 shadow-2xl shadow-amber-950/20">
        <div className="flex flex-col gap-3 border-b border-slate-800/80 pb-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.35em] text-amber-400/80">Castle Task Registry</p>
            <h2 className="mt-1.5 flex items-center gap-2.5 text-xl font-black tracking-tight text-white md:text-3xl">
              <span className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-1.5 text-amber-300">
                <CalendarDays className="h-5 w-5" />
              </span>
              Solomon&apos;s Order
            </h2>
            <p className="mt-1 max-w-2xl text-xs text-slate-400 md:text-sm">
              Manual work blocks stay compact here, and tracked hackathons appear automatically on their deadline dates.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              {CALENDAR_MIN_DATE} to {getCalendarMaxDate()}
            </div>
            <button
              onClick={() => {
                setDraft((previous) => ({ ...previous, date: formatDateInput(viewMonth) }));
                setIsAdding(true);
              }}
              className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-3.5 py-1.5 text-xs font-black text-slate-950 transition-colors hover:bg-amber-300"
            >
              <Plus className="h-3.5 w-3.5" />
              New Item
            </button>
          </div>
        </div>

        <div className="mt-4 rounded-[22px] border border-slate-800 bg-slate-950/80 p-2.5 md:p-3.5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <button
              onClick={() => moveMonth(-1)}
              disabled={!canGoPrevious}
              className="rounded-full border border-slate-800 bg-slate-900 p-1.5 text-slate-300 transition-colors hover:border-amber-400/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>

            <div className="text-center">
              <h3 className="text-lg font-black uppercase tracking-[0.18em] text-white md:text-xl">
                {viewMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
              </h3>
              <p className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-slate-500">
                {manualItems.length} manual items • {hackathons.length} hackathons tracked
              </p>
            </div>

            <button
              onClick={() => moveMonth(1)}
              disabled={!canGoNext}
              className="rounded-full border border-slate-800 bg-slate-900 p-1.5 text-slate-300 transition-colors hover:border-amber-400/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next month"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mb-1.5 grid grid-cols-7 gap-1.5 px-1 text-center text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="py-1">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {visibleDays.map((day) => {
              const dayKey = formatDateInput(day);
              const isCurrentMonth = day.getMonth() === viewMonth.getMonth();
              const items = itemsByDate[dayKey] || [];
              const isToday = dayKey === formatDateInput(new Date());

              return (
                <div
                  key={dayKey}
                  className={`min-h-[82px] rounded-xl border p-1.5 md:min-h-[96px] ${
                    isCurrentMonth
                      ? 'border-slate-800 bg-slate-950'
                      : 'border-slate-900 bg-slate-950/40 opacity-45'
                  }`}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className={`text-xs font-bold ${isToday ? 'text-amber-300' : 'text-slate-300'}`}>
                      {day.getDate()}
                    </span>
                    {items.length > 0 && (
                      <span className="rounded-full bg-slate-800 px-1.5 py-0.5 text-[9px] font-black text-slate-400">
                        {items.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    {items.slice(0, 2).map((item) => (
                      <div key={item.id} className={`group rounded-md px-1.5 py-1 text-[10px] font-bold leading-tight ${colorClasses[item.color]}`}>
                        <div className="flex items-start justify-between gap-1">
                          <div className="min-w-0">
                            <p className="truncate">{item.title}</p>
                            {item.source === 'hackathon' && (
                              <span className="mt-0.5 inline-flex items-center gap-1 text-[8px] uppercase tracking-[0.12em] opacity-70">
                                <Trophy className="h-2.5 w-2.5" />
                                Hackathon
                              </span>
                            )}
                          </div>
                          {item.source === 'manual' && (
                            <button
                              onClick={() => removeItem(item.id)}
                              className="opacity-0 transition-opacity group-hover:opacity-100"
                              aria-label={`Remove ${item.title}`}
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}

                    {items.length > 2 && (
                      <div className="rounded-md border border-dashed border-slate-800 px-1.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-slate-500">
                        +{items.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-2xl">
            <h3 className="text-xl font-black text-white">Add Order Item</h3>
            <p className="mt-1 text-sm text-slate-400">Saved items stay within the supported calendar range only.</p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Title</label>
                <input
                  autoFocus
                  value={draft.title}
                  onChange={(event) => setDraft((previous) => ({ ...previous, title: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-amber-400"
                  placeholder="Ship landing page, revise pitch, QA sprint"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Date</label>
                <input
                  type="date"
                  min={CALENDAR_MIN_DATE}
                  max={getCalendarMaxDate()}
                  value={draft.date}
                  onChange={(event) => setDraft((previous) => ({ ...previous, date: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-amber-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Color</label>
                <div className="grid grid-cols-4 gap-2">
                  {palette.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setDraft((previous) => ({ ...previous, color }))}
                      className={`rounded-2xl px-3 py-2 text-xs font-black uppercase tracking-[0.16em] transition ${colorClasses[color]} ${
                        draft.color === color ? 'ring-2 ring-white/80' : 'opacity-80 hover:opacity-100'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setIsAdding(false)}
                className="flex-1 rounded-2xl bg-slate-800 px-4 py-3 font-bold text-slate-300 transition hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={addItem}
                disabled={!draft.title.trim() || !isCalendarDateAllowed(draft.date)}
                className="flex-1 rounded-2xl bg-amber-400 px-4 py-3 font-black text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Save Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SolomonOrderCalendar;
