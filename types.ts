
export enum ToolType {
  PPT_TO_PDF = 'PPT to PDF',
  PPT_TO_WORD = 'PPT to Word',
  PDF_TO_PPT = 'PDF to PPT',
  PDF_TO_WORD = 'PDF to Word',
  IMAGE_COMPRESS = 'Image Compressor',
  VIDEO_COMPRESS = 'Video Compressor'
}

export interface StreakData {
  count: number;
  lastLoginDate: string; // ISO String in IST
}

export interface FileProcessingState {
  isProcessing: boolean;
  progress: number;
  resultUrl: string | null;
  error: string | null;
}

export interface HubLink {
  id: string;
  name: string;
  url: string;
  icon?: string;
}

export interface HubFolder {
  id: string;
  name: string;
  links: HubLink[];
}

export interface Hackathon {
  id: string;
  name: string;
  deadline: string;
  deadlineTime?: string;
  link: string;
  platform: string;
  type: 'in-person' | 'virtual';
  priority?: CalendarItem['color'];
}

export interface CalendarItem {
  id: string;
  title: string;
  date: string;
  /** Local time in 24-hour HH:mm format. Tasks without a time sort after timed tasks. */
  time?: string;
  color: 'amber' | 'emerald' | 'rose' | 'blue' | 'slate';
  source?: 'manual' | 'hackathon' | 'habit';
  link?: string;
  completed?: boolean;
  completedDates?: string[];
  recurrence?: 'none' | 'daily' | 'weekly';
  seriesId?: string;
}

export type HabitSection = 'bucket' | 'goal';
export type UnoFlipColor = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple';

export interface Habit {
  id: string;
  title: string;
  section: HabitSection;
  color: UnoFlipColor;
  date?: string;
  time?: string;
  completed?: boolean;
  completedOn?: string;
}

export interface StudyItem {
  id: string;
  name: string;
  progress: number; // 0 to 100
  link?: string; // Study resource link for the course
  topics: { id: string; name: string; completed: boolean; link?: string }[];
}

export type AppTab = 'hub' | 'tools' | 'hackathons' | 'study' | 'order' | 'daily' | 'habits';
