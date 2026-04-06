import { CalendarItem, Hackathon, Subtask } from '../types';

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

const sortSubtasks = (subtasks: Subtask[] = []): Subtask[] =>
  [...subtasks].sort((left, right) => compareDateStrings(left.endDate, right.endDate));

export const getHackathonActiveSubtask = (hackathon: Hackathon): Subtask | undefined => {
  if (!hackathon.isMultistage || !hackathon.subtasks?.length) return undefined;
  const sortedSubtasks = sortSubtasks(hackathon.subtasks);
  return sortedSubtasks.find((subtask) => !subtask.completed) || sortedSubtasks[sortedSubtasks.length - 1];
};

export const normalizeHackathon = (hackathon: Hackathon): Hackathon => {
  if (!hackathon.isMultistage || !hackathon.subtasks?.length) {
    return hackathon;
  }

  const sortedSubtasks = sortSubtasks(hackathon.subtasks);
  const activeSubtask = sortedSubtasks.find((subtask) => !subtask.completed) || sortedSubtasks[sortedSubtasks.length - 1];

  return {
    ...hackathon,
    subtasks: sortedSubtasks,
    deadline: activeSubtask?.endDate || hackathon.deadline,
  };
};

export const sortHackathonsByDeadline = (hackathons: Hackathon[]): Hackathon[] =>
  [...hackathons]
    .map(normalizeHackathon)
    .sort((left, right) => compareDateStrings(left.deadline, right.deadline));

export const sanitizeCalendarItems = (items: CalendarItem[], now = new Date()): CalendarItem[] =>
  items
    .filter((item) => item.source !== 'hackathon')
    .filter((item) => Boolean(item.title?.trim()) && isCalendarDateAllowed(item.date, now))
    .map((item) => ({
      ...item,
      title: item.title.trim(),
      source: 'manual' as const,
    }))
    .sort((left, right) => compareDateStrings(left.date, right.date));
