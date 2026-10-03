import { CalendarItem, Hackathon, Habit } from '../types';

export const CALENDAR_STORAGE_KEY = 'solomon_order_calendar';
export const CALENDAR_MIN_DATE = '2026-01-01';

export const parseLocalDate = (value: string): Date => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
};

export const formatDateInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const compareDateStrings = (left: string, right: string): number =>
  parseLocalDate(left).getTime() - parseLocalDate(right).getTime();

const CALENDAR_ITEM_PRIORITY_WEIGHT: Record<CalendarItem['color'], number> = {
  rose: 4,
  amber: 3,
  emerald: 2,
  blue: 1,
  slate: 0,
};

export const getCalendarMaxDate = (now = new Date()): string =>
  `${now.getFullYear() + 4}-01-01`;

export const isCalendarDateAllowed = (value: string, now = new Date()): boolean =>
  compareDateStrings(value, CALENDAR_MIN_DATE) >= 0 &&
  compareDateStrings(value, getCalendarMaxDate(now)) <= 0;

export const clampMonthToCalendarRange = (date: Date, now = new Date()): Date => {
  const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
  const min = parseLocalDate(CALENDAR_MIN_DATE);
  const max = parseLocalDate(getCalendarMaxDate(now));

  if (monthStart.getTime() < min.getTime()) {
    return new Date(min.getFullYear(), min.getMonth(), 1);
  }

  if (monthStart.getTime() > max.getTime()) {
    return new Date(max.getFullYear(), max.getMonth(), 1);
  }

  return monthStart;
};

export const normalizeHackathon = (hackathon: Hackathon): Hackathon => {
  const { isMultistage: _legacyMultistage, subtasks: _legacySubtasks, ...cleanHackathon } = hackathon as Hackathon & { isMultistage?: boolean; subtasks?: unknown };
  return {
    ...cleanHackathon,
    priority: cleanHackathon.priority || 'slate',
  };
};

export const sortHackathonsByDeadline = (hackathons: Hackathon[]): Hackathon[] =>
  [...hackathons]
    .map(normalizeHackathon)
    .sort((left, right) => {
      const dateDiff = compareDateStrings(left.deadline, right.deadline);
      if (dateDiff !== 0) return dateDiff;
      return (left.deadlineTime || '99:99').localeCompare(right.deadlineTime || '99:99');
    });

export const compareCalendarItemPriority = (left: CalendarItem['color'], right: CalendarItem['color']): number =>
  CALENDAR_ITEM_PRIORITY_WEIGHT[right] - CALENDAR_ITEM_PRIORITY_WEIGHT[left];

export const sortCalendarItems = (items: CalendarItem[]): CalendarItem[] =>
  [...items].sort((left, right) => {
    const dateDiff = compareDateStrings(left.date, right.date);
    if (dateDiff !== 0) return dateDiff;

    const timeDiff = (left.time || '99:99').localeCompare(right.time || '99:99');
    if (timeDiff !== 0) return timeDiff;

    const priorityDiff = compareCalendarItemPriority(left.color, right.color);
    if (priorityDiff !== 0) return priorityDiff;

    if (left.source !== right.source) {
      return left.source === 'manual' ? -1 : 1;
    }

    return left.title.localeCompare(right.title);
  });

export const expandRecurringCalendarItems = (
  items: CalendarItem[],
  startDate: string,
  endDate: string,
): CalendarItem[] => {
  const start = parseLocalDate(startDate);
  const end = parseLocalDate(endDate);
  const today = parseLocalDate(formatDateInput(new Date()));
  const expanded: CalendarItem[] = [];

  items.forEach((item) => {
    const recurrence = item.recurrence || 'none';
    const baseDate = parseLocalDate(item.date);
    if (recurrence === 'none' || baseDate.getTime() > end.getTime()) {
      if (baseDate.getTime() >= start.getTime() && baseDate.getTime() <= end.getTime()) expanded.push(item);
      return;
    }

    const cursor = new Date(Math.max(baseDate.getTime(), today.getTime(), start.getTime()));
    if (recurrence === 'weekly') {
      while (cursor.getDay() !== baseDate.getDay()) cursor.setDate(cursor.getDate() + 1);
    }
    if (cursor.getTime() <= end.getTime()) {
      const occurrenceDate = formatDateInput(cursor);
      if (!item.completedDates?.includes(occurrenceDate)) {
        expanded.push({
          ...item,
          id: `${item.id}-${occurrenceDate}`,
          seriesId: item.id,
          date: occurrenceDate,
          completed: false,
        });
      }
    }
  });

  return sortCalendarItems(expanded);
};

export const sanitizeCalendarItems = (items: CalendarItem[], now = new Date()): CalendarItem[] =>
  sortCalendarItems(
    items
      .filter((item) => item.source !== 'hackathon')
      .filter((item) => Boolean(item.title?.trim()) && isCalendarDateAllowed(item.date, now))
      .map((item) => ({
        ...item,
        title: item.title.trim(),
        time: /^([01]\d|2[0-3]):[0-5]\d$/.test(item.time || '') ? item.time : undefined,
        recurrence: item.recurrence === 'daily' || item.recurrence === 'weekly' ? item.recurrence : 'none',
        completedDates: Array.isArray(item.completedDates) ? item.completedDates.filter((date): date is string => typeof date === 'string') : [],
        source: 'manual' as const,
        completed: Boolean(item.completed),
      }))
  );

const UNO_COLORS: Habit['color'][] = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];

export const sanitizeHabits = (items: unknown): Habit[] => {
  if (!Array.isArray(items)) return [];

  return items
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
    .map((item, index) => ({
      id: typeof item.id === 'string' && item.id ? item.id : `dream-${Date.now()}-${index}`,
      title: typeof item.title === 'string' ? item.title.trim() : '',
      section: item.section === 'goal' ? 'goal' as const : 'bucket' as const,
      color: UNO_COLORS.includes(item.color as Habit['color']) ? item.color as Habit['color'] : UNO_COLORS[index % UNO_COLORS.length],
      date: typeof item.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(item.date) ? item.date : undefined,
      completedOn: typeof item.completedOn === 'string' ? item.completedOn : item.completed ? formatDateInput(new Date()) : undefined,
    }))
    .filter((item) => Boolean(item.title));
};
