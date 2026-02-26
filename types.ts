
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

export interface Subtask {
  id: string;
  name: string;
  startDate?: string;
  endDate: string;
  completed: boolean;
  status: 'todo' | 'in-progress' | 'done';
}

export interface Hackathon {
  id: string;
  name: string;
  deadline: string;
  link: string;
  platform: string;
  type: 'in-person' | 'virtual';
  isMultistage: boolean;
  subtasks?: Subtask[];
}

export interface StudyItem {
  id: string;
  name: string;
  progress: number; // 0 to 100
  link?: string; // Study resource link for the course
  topics: { id: string; name: string; completed: boolean; link?: string }[];
}

export type AppTab = 'hub' | 'tools' | 'app-maker' | 'hackathons' | 'study';
